import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL || 'https://shktech.pages.dev';
const base = process.env.BASE_PATH || '/';

// SITE_URL and BASE_PATH are overridden by the GitHub Pages preview workflow.
// Production remains root-based until the final public domain is confirmed.
export default defineConfig({
  site,
  base,
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/enquiry/') && !page.endsWith('/404/') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
