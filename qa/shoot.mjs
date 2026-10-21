// QA: render every page at 390px and 1440px, check overflow, broken images, H1 count, console errors.
import { chromium } from 'playwright';
const base = process.env.QA_BASE ?? 'http://127.0.0.1:4410';
const out = new URL('.', import.meta.url).pathname;
const pages = ['', 'events', 'photos', 'visit', '404'];
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let fail = 0;
for (const [label, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: label === 'mobile', hasTouch: label === 'mobile', timezoneId: 'America/Chicago' });
  for (const p of pages) {
    const page = await ctx.newPage(); const errs = []; const bad = [];
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/404')) bad.push(`${r.status()} ${r.url()}`); });
    const res = await page.goto(`${base}/${p}`, { waitUntil: 'networkidle' });
    // Force lazy images to load for full-page capture.
    await page.evaluate(async () => { document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')); await new Promise((r) => setTimeout(r, 600)); });
    await page.waitForLoadState('networkidle');
    const name = p || 'home';
    if (label === 'mobile') await page.screenshot({ path: `${out}${name}-mobile-firstscreen.png` });
    await page.addStyleTag({ content: '.sticky-bar{position:absolute !important;bottom:auto !important;top:calc(100% - 60px)} body{position:relative}' });
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      broken: [...document.images].filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      imgs: document.images.length,
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      css: [...document.styleSheets].length,
      font: getComputedStyle(document.querySelector('h1')).fontFamily,
    }));
    await page.screenshot({ path: `${out}${name}-${label}.png`, fullPage: true });
    const ok = info.overflow <= 0 && !info.broken.length && info.h1.length === 1 && !errs.length && !bad.length && info.css > 0;
    if (!ok) fail++;
    console.log(ok ? 'PASS' : 'FAIL', label, name, res.status(), JSON.stringify(info), errs.join(' | '), bad.join(' | '));
    await page.close();
  }
  await ctx.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
