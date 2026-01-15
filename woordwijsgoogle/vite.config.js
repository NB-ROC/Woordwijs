import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: '/src/popup.js',
      output: {
        format: 'es',
      }
    }
  }
});
