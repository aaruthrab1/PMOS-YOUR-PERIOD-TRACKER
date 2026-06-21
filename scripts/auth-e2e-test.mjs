/**
 * Frontend auth flow E2E (mirrors AuthContext + onboarding paths)
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { autoRefreshToken: true, persistSession: false, flowType: 'pkce' },
});

const email = `cyra-auth-${Date.now()}@test.cyra.local`;
const password = 'TestPass123!';
const fullName = 'Auth Test User';

function isOnboardingComplete(profile, user) {
  if (profile?.onboarding_completed === true) return true;
  const meta = user?.user_metadata?.onboarding_completed;
  return meta === true || meta === 'true';
}

const onboardingData = {
  full_name: fullName,
  age_range: '25–34',
  region: 'south',
  health_goals: ['Track cycles'],
  last_period_date: '2026-06-01',
  cycle_regularity: 'Regular',
  energy_level: 7,
  common_symptoms: ['Cramps'],
  onboarding_completed: true,
};

let failed = 0;
function pass(n, msg) {
  console.log(`PASS ${n}: ${msg}`);
}
function fail(n, msg) {
  console.error(`FAIL ${n}: ${msg}`);
  failed++;
}

async function main() {
  // 1-2 signUp / signIn calls
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (signUpError) fail(1, `signUp error: ${signUpError.message}`);
  else pass(1, 'supabase.auth.signUp() called and returned');

  if (!signUpData.user) fail(3, 'No user from signUp');
  else pass(3, `User created id=${signUpData.user.id}`);

  if (!signUpData.session) {
    console.log('No session after signUp — trying signInWithPassword');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) fail(2, `signInWithPassword error: ${signInError.message}`);
    else pass(2, 'supabase.auth.signInWithPassword() called and returned');
    if (!signInData.session) fail(4, 'No session after signIn');
    else pass(4, 'Session created with access_token');
  } else {
    pass(2, 'signUp returned session (signInWithPassword not required)');
    pass(4, 'Session created with access_token');
  }

  const { data: { session: s1 } } = await supabase.auth.getSession();
  if (!s1?.access_token) fail(5, 'getSession has no access_token');
  else pass(5, 'Session accessible via getSession');

  const userId = signUpData.user.id;

  // profiles row (trigger or insert)
  await new Promise((r) => setTimeout(r, 1500));
  let { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (profileErr) fail(8, `profiles select: ${profileErr.message}`);
  else if (!profile) fail(8, 'No profiles row after signup');
  else pass(8, `profiles row exists id=${profile.id}`);

  // onboarding save
  const { error: metaErr } = await supabase.auth.updateUser({ data: onboardingData });
  if (metaErr) fail(9, `updateUser metadata: ${metaErr.message}`);
  else pass(9, 'onboarding metadata saved via updateUser');

  const { data: prodUpdate, error: prodErr } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      age_range: '25–34',
      region: 'south',
      health_goals: ['Track cycles'],
      onboarding_completed: true,
    })
    .eq('id', userId)
    .select()
    .maybeSingle();
  if (prodErr) fail(9, `profiles update: ${prodErr.message}`);
  else pass(9, `profiles updated onboarding_completed=${prodUpdate?.onboarding_completed}`);

  const { data: { user: afterUser } } = await supabase.auth.getUser();
  if (!isOnboardingComplete(prodUpdate, afterUser)) fail(10, 'onboarding_completed not true');
  else pass(10, 'onboarding_completed is true (profile + metadata)');

  // session persist simulation — new client with same session
  const { data: { session: persistSession } } = await supabase.auth.getSession();
  const supabase2 = createClient(url, anonKey, { auth: { persistSession: false } });
  await supabase2.auth.setSession({
    access_token: persistSession.access_token,
    refresh_token: persistSession.refresh_token,
  });
  const { data: { user: u2 }, error: u2err } = await supabase2.auth.getUser();
  if (u2err || !u2) fail(5, `Session persist/getUser failed: ${u2err?.message}`);
  else pass(5, 'Session persists after setSession + getUser');

  if (!isOnboardingComplete(prodUpdate, u2)) fail(11, 'Would redirect to onboarding loop');
  else pass(11, 'Dashboard route: onboarding complete after refresh');

  const { count: usersBefore } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  pass('counts', `profiles count=${usersBefore}`);

  console.log(`\n${failed === 0 ? 'ALL TESTS PASSED' : `${failed} TEST(S) FAILED`}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
