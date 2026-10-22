// Scans rendered pages for empty containers, dangling separators and orphaned headings (e.g. left behind by hidden placeholders).
// Expected hits: sr-only "Home:" wordmark prefix and JS-filled sr-only .today-label spans.
import { chromium } from 'playwright';
const base = process.env.QA_BASE ?? 'http://127.0.0.1:4411';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const vw of [390, 1440]) {
const p = await b.newPage({ viewport: { width: vw, height: 900 } });
for (const s of ['', 'events/', 'photos/', 'visit/', '404']) {
  await p.goto(base + '/' + s, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const out = [];
    const vis = (el) => { const cs = getComputedStyle(el); const rc = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && rc.width > 0 && rc.height > 0; };
    for (const el of document.querySelectorAll('main *, footer *, header *')) {
      if (el.closest('[aria-hidden="true"],svg,picture,dialog:not([open]),[hidden],template,script,style,iframe,noscript')) continue;
      if (['IMG','SVG','IFRAME','BR','HR','INPUT','SOURCE','PICTURE','SCRIPT','svg','path','circle'].includes(el.tagName)) continue;
      if (!vis(el)) continue;
      const txt = el.textContent.replace(/\s+/g, ' ').trim();
      const hasMedia = el.querySelector('img,svg,iframe,picture,canvas,video');
      const decorative = el.children.length === 0 && /halftone|vignette|rule|leader|gradient|bg-|absolute/.test(el.className?.toString?.() ?? '');
      if (!txt && !hasMedia && !decorative && !el.matches('a,button') ) out.push('EMPTY ' + el.tagName + '.' + (el.className?.toString?.() ?? '').slice(0, 70));
      if (/^(h[1-6]|p|span|li|dt|label)$/i.test(el.tagName) && /[:·|–-]\s*$/.test(txt) && el.children.length === 0) out.push('DANGLING "' + txt.slice(-40) + '"');
    }
    // headings with no following content inside their section
    for (const h of document.querySelectorAll('main h2, main h3')) {
      const sec = h.closest('section, article'); if (!sec) continue;
      const rest = sec.textContent.replace(h.textContent, '').replace(/\s+/g, '').length;
      if (rest === 0 && !sec.querySelector('img,iframe')) out.push('ORPHAN HEADING ' + h.textContent.trim());
    }
    return out;
  });
  console.log(vw, s || 'home', r.length ? r : 'clean');
}
await p.close(); }
await b.close();
