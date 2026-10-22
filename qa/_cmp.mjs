import sharp from '../node_modules/sharp/lib/index.js';
const pages = ['home','events','photos','visit','404'];
for (const p of pages) for (const v of ['mobile-firstscreen','desktop']) {
  const a = `before/${p}-${v}-live.png`, b = `${p}-${v}-v2.png`;
  const H = v === 'desktop' ? 1800 : 844;
  const ra = await sharp(a).resize({ height: H, fit: 'inside' }).extract({left:0,top:0,width:0||undefined,height:undefined}).toBuffer().catch(async()=>sharp(a).resize({height:H}).toBuffer());
  const ia = await sharp(a).metadata(), ib = await sharp(b).metadata();
  const w = v === 'desktop' ? 720 : 390;
  const crop = async (f, m) => { const s = sharp(f).resize({ width: w }); const buf = await s.toBuffer(); const mm = await sharp(buf).metadata(); return sharp(buf).extract({ left: 0, top: 0, width: w, height: Math.min(mm.height, v==='desktop'?1400:844) }).toBuffer(); };
  const A = await crop(a), B = await crop(b);
  const ha = (await sharp(A).metadata()).height, hb = (await sharp(B).metadata()).height;
  await sharp({ create: { width: w*2+24, height: Math.max(ha,hb), channels: 3, background: '#000' } })
    .composite([{ input: A, left: 0, top: 0 }, { input: B, left: w+24, top: 0 }]).png().toFile(`compare/${p}-${v}-before-after.png`);
}
console.log('ok');
