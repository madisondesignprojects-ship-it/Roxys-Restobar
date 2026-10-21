// Launch gate (build script 0.3 / 7.13 / 14): fails if any "PLACEHOLDER" remains in the built site.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const hits = [];
for (const f of walk('dist').filter((f) => /\.(html|xml|txt|json)$/.test(f))) {
  const t = readFileSync(f, 'utf8'); const re = /PLACEHOLDER[^<"\]]*/g; let m;
  while ((m = re.exec(t))) hits.push(`${f.replace(/^dist/, '')}: ${m[0].trim()}`);
}
if (hits.length) {
  const uniq = [...new Set(hits)];
  console.error(`\n${uniq.length} placeholder(s) still need confirmation from the business:\n` + uniq.map((h) => ' - ' + h).join('\n'));
  process.exit(1);
}
console.log('No placeholders left. OK to launch.');
