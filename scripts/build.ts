import { NodeFileSystem, NodePath, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, FileSystem, Layer, Path, Schema } from "effect";
import { loadGeneratedPage, loadGeneratedRoot } from "../src/load-generated-site.ts";
import { sitePublication, type Publication } from "../src/publication.ts";

interface Renderers {
  readonly renderPage: typeof import("../src/render-site.ts").renderPage;
  readonly renderRoot: typeof import("../src/render-site.ts").renderRoot;
}

const output = "dist";
const staging = ".dist-temporary";
const rendererEntry = "../.vite-ssg/render-site.js";

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
) {
  const content = yield* loadGeneratedPage(publication);
  const html = yield* Effect.tryPromise(() => renderers.renderPage(content, publication));
  yield* writePage(`${staging}/${publication.outputPath}`, html);
});

const renderRootPage = Effect.fn("renderRootPage")(function* (renderers: Renderers) {
  const content = yield* loadGeneratedRoot();
  const html = yield* Effect.tryPromise(() => renderers.renderRoot(content));
  yield* writePage(`${staging}/index.html`, html);
});

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const renderers = yield* loadRenderers;

  yield* cleanupStaging;
  yield* Effect.all(
    [
      ...sitePublication.map((publication) => renderLocalized(renderers, publication)),
      renderRootPage(renderers),
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
