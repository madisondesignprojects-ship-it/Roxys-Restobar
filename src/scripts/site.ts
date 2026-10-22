import { openState, nextItem } from '../lib/time';

// Open-now badges (7.4): only live once hours are confirmed.
document.querySelectorAll<HTMLElement>('[data-open-badge]').forEach((el) => {
  if (el.dataset.confirmed !== 'true') return;
  const s = openState(JSON.parse(el.dataset.hours!));
  const dot = el.querySelector<HTMLElement>('[data-dot]')!;
  el.querySelector('[data-text]')!.textContent = s.text;
  dot.className = 'h-2 w-2 rounded-full ' + (s.state === 'open' ? 'bg-neon-green shadow-[0_0_8px_#42AF71]' : s.state === 'soon' ? 'bg-label-gold' : 'bg-dim');
});

// Highlight today's row in hours tables (Chicago weekday; before close-after-midnight counts as the previous day).
{
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).format(new Date()).toLowerCase().slice(0, 3);
  document.querySelectorAll(`[data-hours-table] tr[data-day="${wd}"]`).forEach((tr) => {
    tr.classList.add('is-today'); const l = tr.querySelector('.today-label'); if (l) l.textContent = ' (today)';
  });
}

// Tonight / Up next card (7.5).
document.querySelectorAll<HTMLElement>('[data-tonight]').forEach((el) => {
  const n = nextItem(JSON.parse(el.dataset.items || '[]'));
  if (!n) return;
  const set = (k: string, v: string) => { const t = el.querySelector(`[data-t-${k}]`); if (t) t.textContent = v; };
  set('dow', n.dow); set('num', String(n.num)); set('when', n.when); set('title', n.item.title);
  if (n.item.label) set('label', n.item.label);
});

// Click-to-load map (7.9).
document.querySelectorAll<HTMLElement>('[data-map]').forEach((wrap) => {
  wrap.querySelector('[data-map-load]')?.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = wrap.dataset.src!; f.title = wrap.dataset.title!; f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade'; f.className = 'absolute inset-0 h-full w-full border-0';
    wrap.querySelector('[data-map-card]')?.remove(); wrap.appendChild(f); f.focus();
  });
});

// Mobile menu (7.2): focus trap, Esc, scroll lock.
{
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (menu && opener) {
    const focusables = () => [...menu.querySelectorAll<HTMLElement>('a[href],button')];
    const close = () => { menu.classList.add('hidden'); document.documentElement.style.overflow = ''; opener.setAttribute('aria-expanded', 'false'); opener.focus(); };
    opener.addEventListener('click', () => { menu.classList.remove('hidden'); document.documentElement.style.overflow = 'hidden'; opener.setAttribute('aria-expanded', 'true'); focusables()[1]?.focus(); });
    menu.querySelector('[data-menu-close]')?.addEventListener('click', close);
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = focusables(); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
}

// Lightbox (7.7): <dialog>, arrows, Esc, swipe, "n / N" counter, alt text as caption. No autoplay.
{
  const dlg = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const tiles = [...document.querySelectorAll<HTMLButtonElement>('[data-tile]')];
  if (dlg && tiles.length) {
    const im = dlg.querySelector<HTMLImageElement>('[data-lb-img]')!;
    const cap = dlg.querySelector('[data-lb-cap]')!; const cnt = dlg.querySelector('[data-lb-count]')!;
    let i = 0;
    const show = (n: number) => {
      i = (n + tiles.length) % tiles.length; const t = tiles[i];
      im.src = t.dataset.full!; im.alt = t.dataset.alt!; cap.textContent = t.dataset.alt!; cnt.textContent = `${i + 1} / ${tiles.length}`;
    };
    tiles.forEach((t, n) => t.addEventListener('click', () => { show(n); dlg.showModal(); }));
    dlg.querySelector('[data-lb-prev]')!.addEventListener('click', () => show(i - 1));
    dlg.querySelector('[data-lb-next]')!.addEventListener('click', () => show(i + 1));
    dlg.querySelector('[data-lb-close]')!.addEventListener('click', () => dlg.close());
    dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    let x0: number | null = null;
    dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1); x0 = null; });
    dlg.addEventListener('close', () => tiles[i]?.focus());
  }
}

// Click-to-load Facebook feed (7.12), off by default.
document.querySelectorAll<HTMLElement>('[data-fb-feed]').forEach((wrap) => {
  wrap.querySelector('button')?.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = wrap.dataset.src!; f.title = "Roxy's Restobar latest Facebook posts"; f.loading = 'lazy';
    f.width = '500'; f.height = '640'; f.className = 'mx-auto block w-full max-w-[500px] border-0 bg-white';
    wrap.replaceChildren(f);
  });
});
