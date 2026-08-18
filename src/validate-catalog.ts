import { Effect, FileSystem, Result } from "effect";
import { loadHome } from "./load-home.ts";
import {
  type ContentValidationError,
  contentValidationError,
  sourceValidationError,
} from "./load-yaml.ts";

export interface CatalogEntry {
  readonly source: string;
  readonly validate: (
    source: string,
  ) => Effect.Effect<unknown, ContentValidationError, FileSystem.FileSystem>;
}

export const authoredCatalog: ReadonlyArray<CatalogEntry> = [
  { source: "content/home.yaml", validate: loadHome },
];

export const selectCatalogEntries = Effect.fn("selectCatalogEntries")(function* (
  sources: ReadonlyArray<string>,
) {
  if (sources.length === 0) return authoredCatalog;

  const entries = sources.map((source) => authoredCatalog.find((entry) => entry.source === source));
  const unknownSources = sources.filter((_, index) => entries[index] === undefined);
  if (unknownSources.length > 0) {
    return yield* contentValidationError(
      unknownSources.map((source) =>
        sourceValidationError(source, "unknown authored content source"),
      ),
    );
  }
  return entries as ReadonlyArray<CatalogEntry>;
});

export const validateCatalog = Effect.fn("validateCatalog")(function* (
  entries: ReadonlyArray<CatalogEntry> = authoredCatalog,
) {
  const results = yield* Effect.forEach(
    entries,
    ({ source, validate }) => Effect.result(validate(source)),
    { concurrency: "unbounded" },
  );
  const diagnostics = results.flatMap((result) =>
    Result.isFailure(result) ? result.failure.diagnostics : [],
  );

  if (diagnostics.length > 0) return yield* contentValidationError(diagnostics);
  return entries.length;
});
