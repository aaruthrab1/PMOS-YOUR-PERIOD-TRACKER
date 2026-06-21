/**
 * Full demo journey E2E — auth → onboarding → dashboard → chat → refresh
 */
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { mkdir } from 'fs/promises';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const API = process.env.API_URL || 'http://localhost:3001';
const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const shotDir = 'screenshots/demo-e2e';

const email = `demo-${Date.now()}@cyra-demo.test`;
const password = 'DemoPass123!';
const fullName = 'Demo User';

const results = [];
function record(id, pass, detail) {
  results.push({ id, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${id}] ${detail}`);
}

async function clickContinue(page) {
  await page.click('button:has-text("Continue"), button:has-text("Continue to Cyra"), button:has-text("Skip symptoms")');
  await page.waitForTimeout(500);
}

async function completeOnboarding(page) {
  await page.fill('input[autocomplete="name"]', fullName);
  await page.click('button:has-text("25–34")');
  await clickContinue(page);
  await page.click('button:has-text("Track cycles")');
  await clickContinue(page);
  await page.click('button:has-text("Continue to Cyra")');
  await page.waitForTimeout(2500);
}

async function main() {
  if (!url || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  await mkdir(shotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  // 1 Landing page
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const landingVisible =
    (page.url() === `${BASE}/` || page.url().includes('/intro')) &&
    await page.locator('text=Understand your body').isVisible();
  record('1-open-landing', landingVisible, `url=${page.url()}`);
  await page.screenshot({ path: `${shotDir}/01-landing.png`, fullPage: true });

  // 1b Login page visible with Google + email
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const loginVisible =
    await page.locator('text=Welcome back').isVisible() &&
    await page.locator('text=Continue with Google').isVisible() &&
    await page.locator('input[autocomplete="email"]').isVisible();
  record('1b-login-page', loginVisible, `url=${page.url()}`);
  await page.screenshot({ path: `${shotDir}/01-login.png`, fullPage: true });

  // 2 signup page
  await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  record('2-signup-page', await page.locator('h1:has-text("Create your account")').isVisible(), `url=${page.url()}`);
  await page.screenshot({ path: `${shotDir}/02-signup.png`, fullPage: true });

  // 3 signup
  await page.fill('input[autocomplete="name"]', fullName);
  await page.fill('input[autocomplete="email"]', email);
  await page.fill('input[autocomplete="new-password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  record('3-signup', page.url().includes('/onboarding'), `url=${page.url()}`);

  // 4 auth.users
  const adminSb = createClient(url, anonKey);
  const { data: signInData } = await adminSb.auth.signInWithPassword({ email, password });
  const userId = signInData.user?.id;
  record('4-auth-users', Boolean(userId), userId || 'no user');

  // 5 profiles row
  await new Promise((r) => setTimeout(r, 3000));
  const { data: profile } = await adminSb.from('profiles').select('id').eq('id', userId).maybeSingle();
  record('5-profiles-row', Boolean(profile?.id), profile?.id || 'missing');

  // 6 login cycle — fresh context
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[autocomplete="email"]', email);
  await page.fill('input[autocomplete="current-password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  record('6-login', !page.url().includes('/login'), `url=${page.url()}`);

  // 7 onboarding once (if not already there, navigate)
  if (!page.url().includes('/onboarding')) {
    await page.goto(`${BASE}/onboarding`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
  }
  record('7-onboarding-shown', page.url().includes('/onboarding'), `url=${page.url()}`);
  await page.screenshot({ path: `${shotDir}/07-onboarding.png`, fullPage: true });

  // 8 complete onboarding
  if (page.url().includes('/onboarding')) {
    await completeOnboarding(page);
  }
  const { data: { user: afterOnboard } } = await adminSb.auth.getUser();
  const onboardSaved =
    afterOnboard?.user_metadata?.onboarding_completed === true ||
    (await page.evaluate(() => localStorage.getItem('cyra_demo_onboarding_complete') === 'true'));
  record('8-onboarding-save', onboardSaved,
    `metadata=${afterOnboard?.user_metadata?.onboarding_completed}`);

  // 9 dashboard
  await page.waitForTimeout(2000);
  if (!page.url().includes('/dashboard')) {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }
  record('9-dashboard', page.url().includes('/dashboard'), `url=${page.url()}`);
  await page.screenshot({ path: `${shotDir}/09-dashboard.png`, fullPage: true });

  // 10 chat loads
  await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const chatLoaded = page.url().includes('/chat');
  record('10-chat-loads', chatLoaded, `url=${page.url()}`);
  await page.screenshot({ path: `${shotDir}/10-chat.png`, fullPage: true });

  // 11 AI responds
  const token = (await page.evaluate(() => {
    for (const k of Object.keys(localStorage)) {
      if (k.includes('auth-token')) {
        try {
          const j = JSON.parse(localStorage.getItem(k));
          return j?.access_token || j?.currentSession?.access_token;
        } catch { /* */ }
      }
    }
    return null;
  }));

  let aiOk = false;
  if (token) {
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: 'What is a normal cycle length?', stream: false }),
      });
      const body = await res.json();
      aiOk = res.ok && Boolean(body.message || body.conversationId);
      record('11-ai-response', aiOk, res.ok ? `len=${String(body.message || '').length}` : JSON.stringify(body));
    } catch (e) {
      record('11-ai-response', false, e.message);
    }
  } else {
    record('11-ai-response', false, 'no token');
  }

  // 12 conversations/messages save
  if (token && aiOk) {
    const convRes = await fetch(`${API}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const convs = await convRes.json();
    const hasConv = Array.isArray(convs) && convs.length > 0;
    record('12-conversations-save', hasConv, `count=${Array.isArray(convs) ? convs.length : 0}`);

    if (hasConv) {
      const msgRes = await fetch(`${API}/api/chat/conversations/${convs[0].id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgs = await msgRes.json();
      record('12b-messages-save', Array.isArray(msgs) && msgs.length >= 2, `count=${Array.isArray(msgs) ? msgs.length : 0}`);
    }
  } else {
    record('12-conversations-save', false, 'skipped');
    record('12b-messages-save', false, 'skipped');
  }

  // 13 refresh session persists
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  record('13-session-persist', !page.url().includes('/login'), `url=${page.url()}`);

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log('\n=== DEMO E2E ===');
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} | ${r.id} | ${r.detail}`);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  console.log(`URLs: ${BASE} ${API}`);
  console.log(`Screenshots: ${shotDir}/`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
