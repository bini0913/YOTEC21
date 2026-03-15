import { defineConfig } from 'vite';

export default defineConfig({
  root: 'YOTEC',
  server: {
    host: true,
    port: 8420
  },
  preview: {
    host: true,
    port: 8420
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
