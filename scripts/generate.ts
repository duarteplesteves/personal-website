import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, FileSystem, Schema, Stream } from "effect";
import { loadHome } from "../src/repository/load-home.ts";
import { HomePageDataSchema } from "../src/page-data-schema.ts";
import { projectHome } from "../src/project-home.ts";
import { homePublication } from "../src/publication.ts";
import { validateCatalog } from "../src/repository/validate-catalog.ts";

const output = ".generated";
const staging = ".generated-temporary";
const previous = ".generated-previous";

const remove = Effect.fn("removeGeneratedPath")(function* (path: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.remove(path, { recursive: true, force: true });
});

const recoverInterruptedReplacement = Effect.fn("recoverInterruptedReplacement")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const hasOutput = yield* fs.exists(output);
  const hasPrevious = yield* fs.exists(previous);
  if (!hasPrevious) return;
  if (hasOutput) yield* remove(previous);
  else yield* fs.rename(previous, output);
});

const replaceOutput = Effect.fn("replaceGeneratedOutput")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const hasOutput = yield* fs.exists(output);
  if (hasOutput) yield* fs.rename(output, previous);

  const replacement = yield* Effect.result(fs.rename(staging, output));
  if (replacement._tag === "Failure") {
    if (hasOutput) yield* fs.rename(previous, output);
    return yield* Effect.fail(replacement.failure);
  }

  yield* remove(previous);
});

const generate = Effect.fn("generate")(function* (development: boolean) {
  const fs = yield* FileSystem.FileSystem;

  const generation = Effect.gen(function* () {
    yield* recoverInterruptedReplacement();
    yield* validateCatalog();
    const home = yield* loadHome("content/home.yaml");
    const pages = yield* Effect.forEach(homePublication, (publication) => {
      const page = projectHome(home, publication.siteLanguage);
      return Schema.decodeUnknownEffect(HomePageDataSchema, {
        errors: "all",
        onExcessProperty: "error",
      })(page).pipe(Effect.map((data) => ({ publication, data })));
    });

    yield* remove(staging);
    for (const { data, publication } of pages) {
      const target = `${staging}/${publication.siteLanguage}/home.json`;
      yield* fs.makeDirectory(`${staging}/${publication.siteLanguage}`, { recursive: true });
      yield* fs.writeFileString(target, `${JSON.stringify(data, null, 2)}\n`);
    }
    yield* replaceOutput();
    yield* Console.log(`Generated ${pages.length} route-level content files`);
  });

  return yield* generation.pipe(
    Effect.tapError(() => (development ? remove(output) : Effect.void)),
    Effect.ensuring(remove(staging).pipe(Effect.ignore)),
  );
});

const formatError = (error: unknown) => (error instanceof Error ? error.message : String(error));

const watch = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const regenerate = generate(true).pipe(
    Effect.catch((error) => Console.error(formatError(error))),
  );

  yield* regenerate;
  yield* fs.watch("content", { recursive: true }).pipe(
    Stream.debounce("100 millis"),
    Stream.runForEach(() => regenerate),
  );
});

const development = process.argv.includes("--development") || process.argv.includes("--watch");
const program = (process.argv.includes("--watch") ? watch : generate(development)).pipe(
  Effect.tapError((error) => Console.error(formatError(error))),
  Effect.provide(NodeFileSystem.layer),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
