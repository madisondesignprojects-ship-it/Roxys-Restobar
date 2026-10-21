// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Demo hosting: GitHub Pages project site. For the real launch set SITE_URL to the custom domain
// ([PLACEHOLDER domain]) and BASE_PATH to "/".
const SITE_URL = process.env.SITE_URL ?? 'https://madisondesignprojects-ship-it.github.io';
const BASE_PATH = process.env.BASE_PATH ?? '/roxys-restobar';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
  vite: { plugins: [tailwindcss()] },
});
