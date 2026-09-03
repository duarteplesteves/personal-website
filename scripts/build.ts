import { NodeFileSystem, NodePath, NodeRuntime } from "@effect/platform-node";
import { fileURLToPath } from "node:url";
import { Console, Effect, FileSystem, Layer, Path, Schema } from "effect";
import { compileSite } from "../src/compile-site.ts";
import type { PageData, RootPageData } from "../src/page-data-schema.ts";
import {
  productionOrigin,
  sitePublication,
  socialPreviewImage,
  type Publication,
} from "../src/publication.ts";

interface Renderers {
  readonly renderPage: typeof import("../src/render-site.ts").renderPage;
  readonly renderRoot: typeof import("../src/render-site.ts").renderRoot;
  readonly renderMissing: typeof import("../src/render-site.ts").renderMissing;
}

const output = "dist";
const staging = ".dist-temporary";
const rendererEntry = "../.vite-ssg/render-site.js";
const libraryBrowserEntry = fileURLToPath(new URL("../.vite-browser/library.js", import.meta.url));
const socialPreviewEntry = fileURLToPath(
  new URL("../public/assets/social-preview.png", import.meta.url),
);
const siteStylesEntry = fileURLToPath(new URL("../src/site.css", import.meta.url));
const dmSansEntry = fileURLToPath(
  new URL("../public/assets/fonts/dm-sans-variable.woff2", import.meta.url),
);
const dmSansItalicEntry = fileURLToPath(
  new URL("../public/assets/fonts/dm-sans-italic-variable.woff2", import.meta.url),
);

class RendererLoadError extends Schema.TaggedError<RendererLoadError>()("RendererLoadError", {
  cause: Schema.Defect(),
  message: Schema.String,
}) {}

const loadRenderers = Effect.tryPromise({
  try: async () => (await import(rendererEntry)) as Renderers,
  catch: (cause) =>
    new RendererLoadError({
      cause,
      message: `Could not load Vite's server build: ${String(cause)}`,
    }),
});

const writePage = Effect.fn("writePage")(function* (file: string, html: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs.makeDirectory(path.dirname(file), { recursive: true });
  yield* fs.writeFileString(file, html);
});

const cleanupStaging = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(staging, { recursive: true, force: true });
});

const renderLocalized = Effect.fn("renderLocalized")(function* (
  renderers: Renderers,
  publication: Publication,
  content: PageData,
) {
  const html = yield* Effect.try(() => renderers.renderPage(content, publication));
  yield* writePage(`${staging}/${publication.outputPath}`, html);
});

const renderRootPage = Effect.fn("renderRootPage")(function* (
  renderers: Renderers,
  content: RootPageData,
) {
  const html = yield* Effect.try(() => renderers.renderRoot(content));
  yield* writePage(`${staging}/index.html`, html);
  yield* Effect.forEach(
    [
      ["404.html", undefined],
      ["en/404.html", "en"],
      ["pt/404.html", "pt"],
    ] as const,
    ([file, siteLanguage]) =>
      writePage(`${staging}/${file}`, renderers.renderMissing(content, siteLanguage)),
  );
});

const renderDiscoveryArtifacts = Effect.fn("renderDiscoveryArtifacts")(function* () {
  const urls = ["/", ...sitePublication.map(({ pathname }) => pathname)];
  yield* writePage(
    `${staging}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${productionOrigin}${url}</loc></url>`).join("\n")}\n</urlset>\n`,
  );
  yield* writePage(
    `${staging}/robots.txt`,
    `User-agent: *\nAllow: /\nSitemap: ${productionOrigin}/sitemap.xml\n`,
  );
  yield* Effect.all([
    writePage(
      `${staging}/googled085d2f70d727b28.html`,
      "google-site-verification: googled085d2f70d727b28.html",
    ),
    writePage(
      `${staging}/_redirects`,
      "/en/* /en/404.html 404\n/pt/* /pt/404.html 404\n/* /404.html 404\n",
    ),
    writePage(
      `${staging}/_headers`,
      "/*\n  Permissions-Policy: camera=(), geolocation=(), microphone=()\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n\n/assets/*\n  Cache-Control: public, max-age=86400\n",
    ),
  ]);
});

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const renderers = yield* loadRenderers;
  const site = yield* compileSite();

  yield* cleanupStaging;
  yield* fs.makeDirectory(`${staging}/assets/fonts`, { recursive: true });
  yield* Effect.all([
    fs.copyFile(libraryBrowserEntry, `${staging}/assets/library.js`),
    fs.copyFile(socialPreviewEntry, `${staging}${socialPreviewImage.pathname}`),
    fs.copyFile(siteStylesEntry, `${staging}/assets/site.css`),
    fs.copyFile(dmSansEntry, `${staging}/assets/fonts/dm-sans-variable.woff2`),
    fs.copyFile(dmSansItalicEntry, `${staging}/assets/fonts/dm-sans-italic-variable.woff2`),
  ]);
  yield* Effect.all(
    [
      ...site.pages.map(({ publication, data }) => renderLocalized(renderers, publication, data)),
      renderRootPage(renderers, site.root),
      renderDiscoveryArtifacts(),
    ],
    { concurrency: "unbounded" },
  );

  yield* fs.remove(output, { recursive: true, force: true });
  yield* fs.rename(staging, output);
}).pipe(
  Effect.ensuring(Effect.ignore(cleanupStaging)),
  Effect.tapError((error) => Console.error(error instanceof Error ? error.message : String(error))),
  Effect.provide(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
