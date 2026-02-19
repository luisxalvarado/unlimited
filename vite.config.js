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
      },
    },
  },
});
