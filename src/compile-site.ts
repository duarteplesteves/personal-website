import { Effect, Result, Schema } from "effect";
import { PageDataSchema, RootPageDataSchema } from "./page-data-schema.ts";
import { projectPage, projectRoot } from "./project-site.ts";
import { sitePublication } from "./publication.ts";
import { loadHome } from "./repository/load-home.ts";
import { loadLibrary } from "./repository/load-library.ts";
import { loadSite } from "./repository/load-site.ts";
import { contentValidationError } from "./repository/load-yaml.ts";

/** Compile authored content into the typed pages needed to render the site. */
export const compileSite = Effect.fn("compileSite")(function* () {
  const sources = yield* Effect.all(
    {
      home: loadHome("content/home.yaml"),
      library: loadLibrary("content/library.yaml"),
      site: loadSite("content/site.yaml"),
    },
    { concurrency: "unbounded", mode: "result" },
  );

  const diagnostics = [
    ...(Result.isFailure(sources.home) ? sources.home.failure.diagnostics : []),
    ...(Result.isFailure(sources.library) ? sources.library.failure.diagnostics : []),
    ...(Result.isFailure(sources.site) ? sources.site.failure.diagnostics : []),
  ];
  if (diagnostics.length > 0) return yield* contentValidationError(diagnostics);

  if (Result.isFailure(sources.home)) return yield* sources.home.failure;
  if (Result.isFailure(sources.library)) return yield* sources.library.failure;
  if (Result.isFailure(sources.site)) return yield* sources.site.failure;
  const { success: home } = sources.home;
  const { success: library } = sources.library;
  const { success: site } = sources.site;
  const pages = yield* Effect.forEach(sitePublication, (publication) =>
    Schema.decodeUnknownEffect(PageDataSchema, {
      errors: "all",
      onExcessProperty: "error",
    })(projectPage(home, library, site, publication)).pipe(
      Effect.map((data) => ({ publication, data })),
    ),
  );
  const root = yield* Schema.decodeUnknownEffect(RootPageDataSchema, {
    errors: "all",
    onExcessProperty: "error",
  })(projectRoot(site));

  return { pages, root };
});
