import site from '../content/site.json';
import events from '../content/events.json';
import weekly from '../content/weekly.json';
import photos from '../content/photos.json';
export { site, events, weekly, photos };

export const isPlaceholder = (v: unknown) => typeof v === 'string' && v.includes('PLACEHOLDER');
/** Strip "[PLACEHOLDER - " and "]" for display inside a <Placeholder> box. */
// Placeholders render only in review builds (PUBLIC_SHOW_PLACEHOLDERS=1). Sections whose content is
// entirely placeholder must check SHOW_PH and not render at all on the live site.
export const SHOW_PH = import.meta.env.PUBLIC_SHOW_PLACEHOLDERS === '1';
export const phNote = (v: string) => v.replace(/^\[?PLACEHOLDER\s*-?\s*/, '').replace(/\]$/, '');

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
/** Base-aware internal URL. Page paths get a trailing slash (matches static directory output; no redirects). */
export const u = (path = '/') => {
  const [p, hash] = path.split('#');
  let out = BASE + (p.startsWith('/') ? p : '/' + p);
  if (!/\.[a-z0-9]+$/i.test(out) && !out.endsWith('/')) out += '/';
  return out + (hash ? '#' + hash : '');
};
export const abs = (path: string) => new URL(u(path), import.meta.env.SITE).href;

export const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
export const DAY_NAMES: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
export function fmtTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 && h < 24 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap}`;
}
export const TYPE_LABELS: Record<string, { label: string; icon: string; tone: string }> = {
  'open-mic': { label: 'Open Mic', icon: 'mic-vocal', tone: 'lav' },
  'live-music': { label: 'Live Music', icon: 'guitar', tone: 'blue' },
  'sing-along': { label: 'Sing-along', icon: 'music', tone: 'blue' },
  dj: { label: 'DJ', icon: 'disc-3', tone: 'lav' },
  karaoke: { label: 'Karaoke', icon: 'mic-vocal', tone: 'lav' },
  raffle: { label: 'Raffle', icon: 'dices', tone: 'gold' },
};
/** Events with a real ISO date (YYYY-MM-DD). Placeholder-dated events are never "upcoming". */
export const datedEvents = events.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date));
export const confirmedWeekly = weekly.filter((w) => w.confirmed);
