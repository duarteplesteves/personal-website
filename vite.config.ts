import { NodeFileSystem } from "@effect/platform-node";
import { octane } from "@octanejs/vite-plugin";
import { Effect } from "effect";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { compileSite } from "./src/compile-site.ts";

export default defineConfig({
  plugins: [
    octane(),
    {
      name: "site-development-server",
      configureServer(server) {
        const contentRoot = resolve("content");
        const sourceRoot = resolve("src");
        server.watcher.add(contentRoot);
        server.watcher.on("change", (file) => {
          if (file.startsWith(contentRoot) || file.startsWith(sourceRoot)) {
            server.ws.send({ type: "full-reload" });
          }
        });
        server.middlewares.use(async (request, response, next) => {
          if (request.url === undefined) return next();

          const url = new URL(request.url, "http://localhost");
          if (url.pathname === "/assets/site.css") {
            request.url = "/src/site.css?direct";
            return next();
          }
          if (url.pathname === "/assets/library.js") {
            request.url = `/src/browser/library.ts${url.search}`;
            return next();
          }
          if (request.method !== "GET" || !request.headers.accept?.includes("text/html")) {
            return next();
          }

          try {
            const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
            const site = await Effect.runPromise(
              compileSite().pipe(Effect.provide(NodeFileSystem.layer)),
            );
            // SAFETY: Vite loads this exact local module; its exports are checked by TypeScript at build time.
            const renderers = (await server.ssrLoadModule(
              "/src/render-site.ts",
            )) as typeof import("./src/render-site.ts");
            const page = site.pages.find(({ publication }) => publication.pathname === pathname);
            const segment = pathname.split("/")[1];
            const siteLanguage = segment === "en" || segment === "pt" ? segment : undefined;
            const html =
              pathname === "/"
                ? renderers.renderRoot(site.root)
                : page === undefined
                  ? renderers.renderMissing(site.root, siteLanguage)
                  : renderers.renderPage(page.data, page.publication);

            response.statusCode = pathname === "/" || page !== undefined ? 200 : 404;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(await server.transformIndexHtml(pathname, html));
          } catch (error) {
            next(error);
          }
        });
      },
    },
  ],
  build: {
    target: "node22",
    ssr: "src/render-site.ts",
    outDir: ".vite-ssg",
    emptyOutDir: true,
    rollupOptions: {
      output: { entryFileNames: "render-site.js" },
    },
  },
});
