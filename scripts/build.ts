import { NodeFileSystem, NodePath, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, FileSystem, Layer, Path } from "effect";
import { loadHome } from "../src/load-home.ts";
import type { SiteLanguage } from "../src/home-content.ts";

type RenderHome = typeof import("../src/render-home.ts").renderHome;

const output = "dist";
const staging = ".dist-temporary";
const rendererEntry = "../.vite-ssg/render-home.js";
const locales: readonly SiteLanguage[] = ["en", "pt"];

const loadRenderer = Effect.tryPromise({
  try: async () => {
    const module = (await import(rendererEntry)) as { renderHome: RenderHome };
    return module.renderHome;
  },
  catch: (error) => new Error(`Could not load Vite's server build: ${String(error)}`),
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
  const { content, renderHome } = yield* Effect.all({
    content: loadHome("content/home.json"),
    renderHome: loadRenderer,
  });

  yield* cleanupStaging;
  yield* Effect.all(
    locales.map((locale) =>
      Effect.tryPromise(() => renderHome(content, locale)).pipe(
        Effect.flatMap((html) => writePage(`${staging}/${locale}/index.html`, html)),
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
