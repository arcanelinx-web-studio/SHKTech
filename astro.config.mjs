import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
// Set SITE_URL to the confirmed production origin before a public release.
export default defineConfig({
  site: process.env.SITE_URL || 'https://shktech.pages.dev',
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/enquiry/') && !page.endsWith('/404/') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
