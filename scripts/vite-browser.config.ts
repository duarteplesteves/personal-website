import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: ".vite-browser",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/browser/library.ts",
      // ponytail: keep a stable name until immutable caching requires hashed assets.
      output: { entryFileNames: "library.js" },
    },
  },
});
