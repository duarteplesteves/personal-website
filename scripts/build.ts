import { NodeFileSystem, NodePath, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, FileSystem, Layer, Path, Schema } from "effect";
import { loadGeneratedHome } from "../src/load-generated-home.ts";
import { homePublication } from "../src/publication.ts";

type RenderHome = typeof import("../src/render-home.ts").renderHome;

const output = "dist";
const staging = ".dist-temporary";
const rendererEntry = "../.vite-ssg/render-home.js";

class RendererLoadError extends Schema.TaggedError<RendererLoadError>()("RendererLoadError", {
  cause: Schema.Defect(),
  message: Schema.String,
}) {}

const loadRenderer = Effect.tryPromise({
  try: async () => {
    const module = (await import(rendererEntry)) as { renderHome: RenderHome };
    return module.renderHome;
  },
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

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const renderHome = yield* loadRenderer;

  yield* cleanupStaging;
  yield* Effect.all(
    homePublication.map((publication) =>
      loadGeneratedHome(publication.siteLanguage).pipe(
        Effect.flatMap((content) => Effect.tryPromise(() => renderHome(content, publication))),
        Effect.flatMap((html) => writePage(`${staging}/${publication.outputPath}`, html)),
      ),
    ),
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
