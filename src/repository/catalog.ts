import { Effect, FileSystem, Result } from "effect";
import { loadHome } from "./load-home.ts";
import { loadLibrary } from "./load-library.ts";
import { loadSite } from "./load-site.ts";
import { type ContentValidationError, contentValidationError } from "./load-yaml.ts";

/** An authored content source and the parser that owns it. */
export interface CatalogEntry {
  readonly source: string;
  readonly load: (
    source: string,
  ) => Effect.Effect<unknown, ContentValidationError, FileSystem.FileSystem>;
}

/** The authored content catalog. */
export const catalog = {
  home: { source: "content/home.yaml", load: loadHome },
  library: { source: "content/library.yaml", load: loadLibrary },
  site: { source: "content/site.yaml", load: loadSite },
} as const satisfies Record<string, CatalogEntry>;

/** All authored content sources in validation order. */
export const authoredCatalog: ReadonlyArray<CatalogEntry> = Object.values(catalog);

/** Load the complete authored catalog while collecting diagnostics from every source. */
export const loadCatalog = Effect.fn("loadCatalog")(function* () {
  const sources = yield* Effect.all(
    {
      home: catalog.home.load(catalog.home.source),
      library: catalog.library.load(catalog.library.source),
      site: catalog.site.load(catalog.site.source),
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
  return {
    home: sources.home.success,
    library: sources.library.success,
    site: sources.site.success,
  };
});
