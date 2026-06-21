/**
 * E2E verification: onboarding save + completion flags.
 * Run: node scripts/verify-onboarding.mjs
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL ?? 'https://tvadpmxbmdgwxjqirdbw.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!anonKey) {
  console.error('Set VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, anonKey);
const email = `onboarding-test-${Date.now()}@cyra-test.local`;
const password = 'TestPass123!';

const onboardingData = {
  full_name: 'Test User',
  age_range: '25–34',
  region: 'south',
  health_goals: ['Track cycles'],
  last_period_date: '2026-06-01',
  cycle_regularity: 'Regular',
  energy_level: 7,
  common_symptoms: ['Cramps'],
  onboarding_completed: true,
  preferred_language: 'en',
};

async function main() {
  console.log('1. Sign up test user:', email);
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Test User' } },
  });
  if (signUpError) throw signUpError;
  if (!signUp.user) throw new Error('No user from signUp');
  const userId = signUp.user.id;
  console.log('   userId:', userId);

  console.log('2. Before save — metadata onboarding_completed:', signUp.user.user_metadata?.onboarding_completed ?? null);

  const { error: metaError } = await supabase.auth.updateUser({ data: onboardingData });
  if (metaError) throw metaError;

  const { data: { user: afterMeta } } = await supabase.auth.getUser();
  console.log('3. After metadata save — onboarding_completed:', afterMeta?.user_metadata?.onboarding_completed);

  const { error: insertError } = await supabase.from('profiles').upsert({
    id: userId,
    email,
    full_name: onboardingData.full_name,
    onboarding_completed: true,
  }, { onConflict: 'id' });
  if (insertError) {
    console.warn('4. profiles upsert (production column) failed:', insertError.message);
    const { error: legacyError } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: onboardingData.full_name,
    }, { onConflict: 'id' });
    if (legacyError) console.warn('   legacy upsert failed:', legacyError.message);
  } else {
    console.log('4. profiles.onboarding_completed upsert succeeded');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, onboarding_completed, full_name')
    .eq('id', userId)
    .maybeSingle();
  if (profileError) console.warn('5. profile select error:', profileError.message);
  else console.log('5. profiles row:', profile);

  const metaComplete = afterMeta?.user_metadata?.onboarding_completed === true;
  const dbComplete = profile?.onboarding_completed === true;
  const resolved = metaComplete || dbComplete;

  console.log('\n--- Result ---');
  console.log('auth.uid() equivalent:', userId);
  console.log('session user id:', afterMeta?.id);
  console.log('profile id:', profile?.id ?? null);
  console.log('onboarding_completed (metadata):', metaComplete);
  console.log('onboarding_completed (profiles):', profile?.onboarding_completed ?? '(column missing or null)');
  console.log('resolved complete:', resolved);

  if (!resolved) {
    console.error('\nFAIL: onboarding not marked complete');
    process.exit(1);
  }
  console.log('\nPASS: onboarding completion verified');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
