import { defineConfig } from 'vite';

export default defineConfig({
  base: '/unlimited/',
  root: '.',
  server: {
    open: true,
    host: true,
    port: 5173,
    allowedHosts: 'all',
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        freedom: 'freedom/index.html',
        health: 'health/index.html',
        wealth: 'wealth/index.html',
        ata: 'ata/index.html',
      },
    },
  },
});
