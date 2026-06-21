/**
 * Capture UI screenshots for forensic audit (no auth required pages).
 * Usage: node scripts/ui-screenshot.mjs [before|after]
 */
import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const tag = process.argv[2] || 'capture';
const BASE = 'http://localhost:5173';
const outDir = `screenshots/ui-restore-${tag}`;

const pages = [
  { name: 'intro', path: '/intro' },
  { name: 'login', path: '/login' },
  { name: 'signup', path: '/signup' },
  { name: 'splash', path: '/' },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  for (const { name, path } of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
    console.log(`saved ${outDir}/${name}.png url=${page.url()}`);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
