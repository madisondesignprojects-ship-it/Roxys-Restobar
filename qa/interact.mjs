// QA: interaction + axe checks on the built site.
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
const base = process.env.QA_BASE ?? 'http://127.0.0.1:4410';
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, timezoneId: 'America/Chicago' });
const page = await ctx.newPage();
const r = (ok, msg) => console.log(ok ? 'PASS' : 'FAIL', msg);
await page.goto(base + '/', { waitUntil: 'networkidle' });
// Menu
await page.click('[data-menu-open]');
r(await page.isVisible('[data-menu]'), 'mobile menu opens');
r(await page.evaluate(() => document.documentElement.style.overflow === 'hidden'), 'body scroll locked');
await page.keyboard.press('Escape');
r(!(await page.isVisible('[data-menu]')), 'menu closes on Esc');
// Map
await page.click('[data-map-load] >> nth=0');
r(await page.locator('[data-map] iframe').count() === 1, 'map loads on click');
r((await page.getAttribute('[data-map] iframe', 'title')) === "Map to Roxy's Restobar, 208 W Main St, Stoughton", 'map iframe title');
// Links
const tels = await page.$$eval('a[href^="tel:"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')))]);
r(tels.length === 1 && tels[0] === 'tel:+16084807007', 'tel links: ' + tels.join(','));
const fb = await page.$$eval('a[href*="facebook"]', (a) => [...new Set(a.map((x) => x.href))]);
r(fb.every((h) => h === 'https://www.facebook.com/roxysrestobar'), 'facebook links direct https: ' + fb.join(','));
r(await page.textContent('[data-t-title]') === 'Chip Draw and Meat Raffle', 'tonight card');
// Lightbox
await page.goto(base + '/photos', { waitUntil: 'networkidle' });
await page.click('[data-tile] >> nth=0');
r(await page.isVisible('[data-lightbox]'), 'lightbox opens');
r((await page.textContent('[data-lb-count]')) === '1 / 7', 'counter 1 / 7');
await page.keyboard.press('ArrowRight');
r((await page.textContent('[data-lb-count]')) === '2 / 7', 'arrow key next');
await page.waitForFunction(() => document.querySelector('[data-lb-img]').naturalWidth > 0);
r(true, 'lightbox image loaded');
await page.keyboard.press('Escape');
r(!(await page.isVisible('[data-lightbox]')), 'lightbox closes on Esc');
// axe on all pages
for (const p of ['', 'events', 'photos', 'visit', '404']) {
  await page.goto(`${base}/${p}`, { waitUntil: 'networkidle' });
  const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  const serious = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  r(serious.length === 0, `axe ${p || 'home'}: ${serious.length} serious/critical` + (res.violations.length ? ' | all: ' + res.violations.map((v) => `${v.id}(${v.impact},${v.nodes.length})`).join(' ') : ''));
  for (const v of serious) console.log('   ', v.id, v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' ; '));
}
await browser.close();
