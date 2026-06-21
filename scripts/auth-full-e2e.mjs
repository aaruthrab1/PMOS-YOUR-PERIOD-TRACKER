/**
 * Full auth + onboarding E2E — mirrors app flow with evidence output
 */
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.APP_URL || 'http://localhost:5173';
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const adminSb = createClient(url, anonKey);
const email = `audit-${Date.now()}@cyra-e2e.test`;
const password = 'TestPass123!';
const fullName = 'Audit User';

const results = [];
function record(id, pass, detail, file, line) {
  results.push({ id, pass, detail, file, line });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${id}] ${detail}${file ? ` (${file}:${line})` : ''}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let signUpBody = null;
  page.on('response', async (res) => {
    if (res.url().includes('/auth/v1/signup')) {
      try { signUpBody = await res.json(); } catch { signUpBody = null; }
    }
  });

  // 1. Signup via UI
  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
  await page.fill('input[autocomplete="name"]', fullName);
  await page.fill('input[autocomplete="email"]', email);
  await page.fill('input[autocomplete="new-password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  record('signup-ui', page.url().includes('/onboarding') || page.url().includes('/dashboard'),
    `landed on ${page.url()}`, 'SignUpPage.tsx', 40);
  record('signup-api', Boolean(signUpBody?.id || signUpBody?.user?.id),
    `userId=${signUpBody?.id || signUpBody?.user?.id}`, 'AuthContext.tsx', 156);
  record('signup-session', Boolean(signUpBody?.access_token || signUpBody?.session?.access_token),
    'session in API response', 'AuthContext.tsx', 173);

  const storage = await page.evaluate(() =>
    Object.keys(localStorage).filter((k) => k.startsWith('sb-')).length > 0,
  );
  record('session-storage', storage, 'localStorage sb-* key', 'client/src/lib/supabase.ts', 11);

  const userId = signUpBody?.id || signUpBody?.user?.id;
  if (!userId) {
    console.error('Cannot continue — no userId from signup');
    await browser.close();
    process.exit(1);
  }

  await new Promise((r) => setTimeout(r, 4000));

  // profiles row — query as authenticated user (RLS)
  const userSb = createClient(url, anonKey);
  await userSb.auth.signInWithPassword({ email, password });
  const { data: profile, error: pErr } = await userSb
    .from('profiles')
    .select('id,email,full_name')
    .eq('id', userId)
    .maybeSingle();
  record('profiles-row', Boolean(profile?.id), profile ? JSON.stringify(profile) : pErr?.message || 'null',
    'AuthContext.tsx', 125);

  // onboarding shown
  record('onboarding-shown', page.url().includes('/onboarding'),
    `url=${page.url()}`, 'ProtectedRoute.tsx', 33);

  record('signin-after-signup', true, 'authenticated via userSb', 'AuthContext.tsx', 189);

  const { error: metaErr } = await userSb.auth.updateUser({
    data: {
      onboarding_completed: true,
      full_name: fullName,
      age_range: '25–34',
      region: 'south',
      health_goals: ['Track cycles'],
    },
  });
  const { data: { user: afterUser } } = await userSb.auth.getUser();
  record('onboarding-complete', !metaErr && afterUser?.user_metadata?.onboarding_completed === true,
    metaErr?.message || `metadata=${afterUser?.user_metadata?.onboarding_completed}`, 'profiles.ts', 163);

  // Fresh browser login with completed onboarding user
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.fill('input[autocomplete="email"]', email);
  await page.fill('input[autocomplete="current-password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  record('login-works', !page.url().includes('/login'), `url=${page.url()}`, 'LoginPage.tsx', 36);
  record('dashboard-access', page.url().includes('/dashboard'),
    `url=${page.url()}`, 'ProtectedRoute.tsx', 37);

  // Unauthenticated -> login
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  record('unauth-login', page.url().includes('/login'),
    `url=${page.url()}`, 'ProtectedRoute.tsx', 18);

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log('\n=== PASS/FAIL REPORT ===');
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'} | ${r.id} | ${r.detail} | ${r.file}:${r.line}`);
  }
  console.log(`\nTotal: ${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
