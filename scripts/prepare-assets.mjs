// Prebuild: crop the Google UI bar off gmaps-04 (build script 6.7), copy the banner texture,
// and generate favicon.svg/.ico, apple-touch-icon.png and 1200x630 Open Graph images.
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
const P = (p) => new URL(`../${p}`, import.meta.url).pathname;
mkdirSync(P('public/og'), { recursive: true });
mkdirSync(P('public/textures'), { recursive: true });

const src4 = P('gated/google-maps/gmaps-04-back-bar-neon-screenshot.png');
const out4 = P('gated/google-maps/gmaps-04-back-bar-neon-cropped.png');
if (existsSync(src4) && !existsSync(out4)) {
  const { width, height } = await sharp(src4).metadata();
  await sharp(src4).extract({ left: 0, top: 0, width, height: height - 140 }).png().toFile(out4);
}

// Photo-permission gate (Section 0 #5): Google listing photos live in gated/ and are copied into
// src/assets/images/ only when photos.json marks them "approved": true. Unapproved files never reach dist/.
const photos = JSON.parse(readFileSync(P('src/content/photos.json'), 'utf8'));
rmSync(P('src/assets/images/google-maps'), { recursive: true, force: true });
const approved = photos.filter((p) => p.source === 'google-maps' && p.approved);
if (approved.length) mkdirSync(P('src/assets/images/google-maps'), { recursive: true });
for (const p of approved) if (!existsSync(P(`gated/${p.file}`))) throw new Error('Approved photo missing from gated/: ' + p.file); else copyFileSync(P(`gated/${p.file}`), P(`src/assets/images/${p.file}`));
console.log(`google listing photos approved: ${approved.length} of ${photos.filter((p) => p.source === 'google-maps').length}`);
if (!existsSync(P('public/textures/banner.webp'))) {
  await sharp(P('src/assets/images/website/header-banner-purple-geometric.jpg')).webp({ quality: 72 }).toFile(P('public/textures/banner.webp'));
}

// Favicon: vinyl record with an "R" on the label. [PLACEHOLDER - business approval of wordmark/favicon]
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#0d0a12"/><circle cx="32" cy="32" r="26" fill="none" stroke="#2c2438" stroke-width="1.5"/><circle cx="32" cy="32" r="21" fill="none" stroke="#2c2438" stroke-width="1.5"/><circle cx="32" cy="32" r="15" fill="#E8833A"/><text x="32" y="38.5" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="17" fill="#1A1326">R</text></svg>`;
writeFileSync(P('public/favicon.svg'), svg);
await sharp(Buffer.from(svg), { density: 600 }).resize(180, 180).flatten({ background: '#1A1326' }).png().toFile(P('public/apple-touch-icon.png'));
const png32 = await sharp(Buffer.from(svg), { density: 300 }).resize(32, 32).png().toBuffer();
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(png32.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(P('public/favicon.ico'), Buffer.concat([head, png32]));

async function og(src, out, pos = 'centre') {
  if (existsSync(P(out))) return;
  await sharp(P(`src/assets/images/${src}`)).resize(1200, 630, { fit: 'cover', position: pos }).jpeg({ quality: 84 }).toFile(P(out));
}
await og('website/carousel-01-karaoke-crowd-at-bar.jpg', 'public/og-default.jpg');
await og('website/carousel-06-acoustic-band-purple-light.jpg', 'public/og/events.jpg');
await og('website/carousel-04-bar-counter-neon-band-playing.jpg', 'public/og/photos.jpg');
// Visit uses gmaps-07 only once Google photos are approved; fallback carousel-05 (Main Street).
await og('website/carousel-05-beer-incoming-call-sidewalk-sign-main-st.jpg', 'public/og/visit.jpg', 'attention');
console.log('assets ready');
