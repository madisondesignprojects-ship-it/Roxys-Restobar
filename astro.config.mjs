// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Demo hosting: Vercel production URL. For the real launch set SITE_URL to the custom domain
// ([PLACEHOLDER domain]).
const SITE_URL = process.env.SITE_URL ?? 'https://roxys-restobar.vercel.app';
const BASE_PATH = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
  vite: { plugins: [tailwindcss()] },
});
