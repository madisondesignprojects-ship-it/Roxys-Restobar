// OpenNowBadge logic test (QA checklist): America/Chicago, after-midnight and DST.
import { openState } from '../src/lib/time.ts';
const hours = JSON.parse((await import('node:fs')).readFileSync(new URL('../src/content/site.json', import.meta.url))).hours;
const cases = [
  ['2026-10-24T06:30:00Z', 'Sat 1:30 AM CDT', /^Open now · until 2 AM$/],      // Friday's hours
  ['2026-10-24T07:30:00Z', 'Sat 2:30 AM CDT', /^Opens today at 2 PM$/],
  ['2026-10-25T07:15:00Z', 'Sun 2:15 AM CDT', /^Open now · until 2:30 AM$/],   // Saturday's hours
  ['2026-10-21T17:00:00Z', 'Wed 12 PM CDT', /^Opens today at 2 PM$/],
  ['2026-10-21T20:00:00Z', 'Wed 3 PM CDT', /^Open now · until 2 AM$/],
  ['2026-11-02T08:00:00Z', 'Mon 2:00 AM CST (after DST end)', /^Open now · until 2:30 AM$/],
  ['2026-11-02T08:45:00Z', 'Mon 2:45 AM CST', /^Opens today at 2 PM$/],
  ['2026-11-02T07:59:00Z', 'Mon 1:59 AM CST', /^Open now · until 2:30 AM$/],
  ['2026-03-08T07:30:00Z', 'Sun 1:30 AM CST (DST start day)', /^Open now · until 2:30 AM$/],
  ['2026-10-25T17:30:00Z', 'Sun 12:30 PM CDT', /^Open now · until 2:30 AM$/],
];
let fail = 0;
for (const [iso, label, re] of cases) { const s = openState(hours, new Date(iso)); const ok = re.test(s.text); if (!ok) fail++; console.log(ok ? 'PASS' : 'FAIL', label, '->', s.text); }
process.exit(fail ? 1 : 0);
