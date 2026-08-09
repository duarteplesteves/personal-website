import { defineConfig } from 'vite';
import { octane } from '@octanejs/vite-plugin';

export default defineConfig({
  plugins: [octane()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: 'src/entry-client.ts',
      output: {
        entryFileNames: 'assets/client.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
