import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kabeli.ae',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
});
