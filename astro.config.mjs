import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL || 'https://arcanelinx-web-studio.github.io/SHKTech';
const base = process.env.BASE_PATH || '/';

// GitHub Pages remains a review preview only.
// Production is deployed at the Hostinger domain with SITE_URL set during the final build.
export default defineConfig({
  site,
  base,
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({ filter: (page) => !page.endsWith('/enquiry/') && !page.endsWith('/404/') && !page.endsWith('/admin/') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
