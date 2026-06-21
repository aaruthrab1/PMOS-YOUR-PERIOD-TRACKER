/**
 * Browser E2E: signup form → Supabase Auth network → session storage
 */
import { chromium } from 'playwright';

const BASE = process.env.APP_URL || 'http://localhost:5173';
const email = `ui-signup-${Date.now()}@cyra-e2e.test`;
const password = 'TestPass123!';
const fullName = 'UI E2E User';

const results = [];
function record(step, ok, detail = '') {
  results.push({ step, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${step}${detail ? `: ${detail}` : ''}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const signUpRequests = [];
  page.on('request', (req) => {
    if (req.url().includes('/auth/v1/signup')) signUpRequests.push(req);
  });
  const signUpResponses = [];
  page.on('response', async (res) => {
    if (res.url().includes('/auth/v1/signup')) {
      let body = null;
      try { body = await res.json(); } catch { body = await res.text().catch(() => null); }
      signUpResponses.push({ status: res.status(), body });
    }
  });

  await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
  record('1. Signup page loads', page.url().includes('/signup'));

  await page.fill('input[autocomplete="name"]', fullName);
  await page.fill('input[autocomplete="email"]', email);
  await page.fill('input[autocomplete="new-password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForTimeout(5000);

  record('2. signUp network request sent', signUpRequests.length > 0, `${signUpRequests.length} request(s)`);

  if (signUpResponses[0]) {
    const { status, body } = signUpResponses[0];
    record('3. Supabase Auth responded', status >= 200 && status < 300, `HTTP ${status}`);
    record('4. Response has user id', Boolean(body?.id || body?.user?.id), JSON.stringify(body?.id || body?.user?.id || body));
    record('5. Response has session/access_token', Boolean(body?.access_token || body?.session?.access_token));
    if (status >= 400) {
      console.log('API ERROR BODY:', JSON.stringify(body, null, 2));
    }
  } else {
    record('3. Supabase Auth responded', false, 'no response captured');
    record('4. Response has user id', false);
    record('5. Response has session/access_token', false);
  }

  const storage = await page.evaluate(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('sb-'));
    return keys.map((k) => ({ key: k, hasValue: localStorage.getItem(k)?.length > 0 }));
  });
  record('6. Session stored in localStorage', storage.some((s) => s.hasValue), JSON.stringify(storage));

  const finalUrl = page.url();
  const pageText = await page.textContent('body');
  const onInbox = pageText?.includes('Check your inbox');
  const onOnboarding = finalUrl.includes('/onboarding');
  const onDashboard = finalUrl.includes('/dashboard');
  record('7. Post-signup navigation', onOnboarding || onDashboard || onInbox, finalUrl);

  const errorAlert = await page.locator('[role="alert"]').textContent().catch(() => null);
  if (errorAlert) console.log('UI ERROR:', errorAlert);

  await browser.close();

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${failed === 0 ? 'ALL UI TESTS PASSED' : `${failed} FAILED`}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
