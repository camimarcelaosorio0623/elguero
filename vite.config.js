import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 3031 },
  preview: { port: 4173 },
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
  },
});
