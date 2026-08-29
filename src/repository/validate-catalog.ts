import { Effect, Result } from "effect";
import { authoredCatalog, type CatalogEntry } from "./catalog.ts";
import { contentValidationError, sourceValidationError } from "./load-yaml.ts";

export const selectCatalogEntries = Effect.fn("selectCatalogEntries")(function* (
  sources: ReadonlyArray<string>,
) {
  if (sources.length === 0) return authoredCatalog;

  const entries: Array<CatalogEntry> = [];
  const unknownSources: Array<string> = [];
  for (const source of sources) {
    const entry = authoredCatalog.find((candidate) => candidate.source === source);
    if (entry === undefined) unknownSources.push(source);
    else entries.push(entry);
  }
  if (unknownSources.length > 0) {
    return yield* contentValidationError(
      unknownSources.map((source) =>
        sourceValidationError(source, "unknown authored content source"),
      ),
    );
  }
  return entries;
});

export const validateCatalog = Effect.fn("validateCatalog")(function* (
  entries: ReadonlyArray<CatalogEntry> = authoredCatalog,
) {
  const results = yield* Effect.forEach(
    entries,
    ({ source, load }) => Effect.result(load(source)),
    { concurrency: "unbounded" },
  );
  const diagnostics = results.flatMap((result) =>
    Result.isFailure(result) ? result.failure.diagnostics : [],
  );

  if (diagnostics.length > 0) return yield* contentValidationError(diagnostics);
  return entries.length;
});
