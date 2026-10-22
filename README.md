# Roxy's Restobar website (demo build)

Astro + Tailwind CSS v4, static output. Built from `/workspace/roxys/build-script.md`.

- **Pages:** `/` (Home), `/events`, `/photos`, `/visit`, `/404`
- **Demo hosting:** Vercel project `roxys-restobar` (team MDP solo), production URL https://roxys-restobar.vercel.app (`vercel.json`).
  For a custom domain set `SITE_URL` (see `netlify.toml` for a Netlify alternative).
  Note: past events hide at build time, so set up a daily rebuild (Vercel deploy hook + cron) once the site is git-linked.
- Yellow dashed `[PLACEHOLDER - ...]` boxes are intentional: they are open questions for the business.
  `npm run build` shows them; `npm run build:launch` fails until every one is resolved.

## How to add tonight's band in 2 minutes
1. Open `src/content/events.json`.
2. Add one line, for example:
   `{ "title": "Band Name", "date": "2026-11-06", "time": "20:00", "type": "live-music", "note": "" }`
   Types: `open-mic`, `live-music`, `sing-along`, `dj`, `karaoke`.
3. Commit. The site rebuilds; past events hide automatically (a daily rebuild also runs).

## Other content
- Weekly nights: `src/content/weekly.json` (entries with `"confirmed": false` stay hidden).
- Hours, phone, links: `src/content/site.json`. Set `"hoursConfirmed": true` once confirmed to switch on the live "Open now" badge and schema hours.
- Photos: `src/content/photos.json`. The 10 Google listing photos are gated: they live in `gated/google-maps/` (not committed,
  copy them from the site kit) and are copied into the build only when their entry has `"approved": true`.

## Commands
```
npm install
npm run dev            # local dev
npm run build          # demo build (placeholders visible)
npm run build:launch   # fails while any PLACEHOLDER remains
node --experimental-strip-types qa/hours-test.mjs   # Open-now logic (Chicago time, after midnight, DST)
cd qa && node shoot.mjs && node interact.mjs        # screenshots, layout, interactions, axe (needs `npm run preview -- --port 4410`; set QA_BASE for another host)
```

## Open questions for the business (Section 15 of the build script)
Name spelling (Roxy's vs Roxys) · current hours (Facebook says 3 PM openings) · current events lineup + times, Monday Karaoke / Fourth Friday ·
food/menu, drink list · age policy, parking, accessibility, payments/ATM, games · private events, performer booking ·
logo (is the Facebook art official?) and wordmark/favicon approval · Google photo permission + original of the screenshot photo ·
email · domain + hosting owner · tagline / about copy · permission to quote reviews · analytics? · owner self-editing (Decap CMS)? ·
post-launch: update Google Business Profile website field, Facebook About, retire the old Google Site.

## v2 design (Oct 2026)
Late-night dive / music-bar look, same purple palette: near-black purples, sparse neon glow,
Anton (gig-poster display) + Archivo (body) + IBM Plex Mono (details), 1-2px corners, hairline rules,
film grain + halftone, low-key vignetted photos, setlist-style event lists, marquee "Tonight" board.
Before/after screenshots: `qa/before/*-live.png` (v1) vs `qa/*-v2.png` (v2), side-by-side in `qa/compare/`.

## Placeholders
`<Placeholder>` notes are hidden on the live site (open questions stay in source: `rg "<Placeholder"`).
Review build with them visible (muted dashed style): `PUBLIC_SHOW_PLACEHOLDERS=1 npm run build`.

## GitHub + Vercel
- Repo: https://github.com/madisondesignprojects-ship-it/Roxys-Restobar (branch `main`).
- Vercel project `roxys-restobar` (team MDP solo) builds from `main` -> https://roxys-restobar.vercel.app
- Daily rebuild: `.github/workflows/daily-rebuild.yml` POSTs the Vercel deploy hook stored in the repo
  secret `VERCEL_DEPLOY_HOOK` at 10:15 UTC. The hook URL is never committed. Run it by hand from the Actions tab.
- `gated/` (unapproved Google Maps photos) is gitignored and never committed or uploaded.
