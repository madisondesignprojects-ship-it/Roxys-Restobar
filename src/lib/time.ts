// Shared by server render and client scripts. All times are America/Chicago (handles DST via Intl).
export const TZ = 'America/Chicago';
const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const SHORT: Record<string, string> = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };
export type Hours = { day: string; open: string; close: string }[];

export function chicagoNow(at: Date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
    .formatToParts(at).map((p) => [p.type, p.value]));
  const dow = DOW.indexOf(parts.weekday.toLowerCase().slice(0, 3));
  return { y: +parts.year, m: +parts.month, d: +parts.day, dow, minutes: +parts.hour * 60 + +parts.minute };
}
const mins = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export function fmt(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM'; const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap}`;
}

/** Open/closed state. A close time at or before the open time means "after midnight, next day". */
export function openState(hours: Hours, at: Date = new Date()) {
  const now = chicagoNow(at);
  const byDay = (i: number) => hours.find((h) => h.day === DOW[(i + 7) % 7]);
  const today = byDay(now.dow); const yest = byDay(now.dow - 1);
  // Still inside yesterday's late-night window (e.g. Sat 1:30 AM -> Friday's hours).
  if (yest && mins(yest.close) <= mins(yest.open) && now.minutes < mins(yest.close))
    return { state: 'open', text: `Open now · until ${fmt(yest.close)}` };
  if (today) {
    const o = mins(today.open), c = mins(today.close);
    const overnight = c <= o;
    if (now.minutes >= o && (overnight || now.minutes < c)) return { state: 'open', text: `Open now · until ${fmt(today.close)}` };
    if (now.minutes < o) return { state: 'soon', text: `Opens today at ${fmt(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const h = byDay(now.dow + i);
    if (h) return { state: 'closed', text: `Closed · opens ${SHORT[h.day]} ${fmt(h.open)}` };
  }
  return { state: 'closed', text: 'Closed' };
}

type Item = { kind: string; day?: string; date?: string; title: string; label: string; tag: string; timeText: string };
/** Today's or the next item. Weekly items repeat on their weekday; dated items need an ISO date. */
export function nextItem(items: Item[], at: Date = new Date()) {
  const now = chicagoNow(at);
  const todayUTC = Date.UTC(now.y, now.m - 1, now.d);
  let best: { item: Item; offset: number } | null = null;
  for (const it of items) {
    let offset: number;
    if (it.kind === 'weekly' && it.day) offset = (DOW.indexOf(it.day) - now.dow + 7) % 7;
    else if (it.date && /^\d{4}-\d{2}-\d{2}$/.test(it.date)) {
      const [y, m, d] = it.date.split('-').map(Number);
      offset = Math.round((Date.UTC(y, m - 1, d) - todayUTC) / 864e5);
      if (offset < 0) continue;
    } else continue;
    if (!best || offset < best.offset) best = { item: it, offset };
  }
  if (!best) return null;
  const date = new Date(todayUTC + best.offset * 864e5);
  return {
    ...best,
    dow: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase(),
    num: date.getUTCDate(),
    when: best.offset === 0 ? 'Tonight' : best.offset === 1 ? 'Tomorrow' : 'Up next',
  };
}
