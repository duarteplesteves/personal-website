import { octane } from "@octanejs/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [octane()],
  build: {
    target: "node22",
    ssr: "src/render-home.ts",
    outDir: ".vite-ssg",
    emptyOutDir: true,
    rollupOptions: {
      output: { entryFileNames: "render-home.js" },
    },
  },
});
