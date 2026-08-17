import { Effect, Result } from "effect";
import { loadHome } from "./load-home.ts";
import { contentValidationError } from "./load-yaml.ts";

export const authoredCatalogSources: ReadonlyArray<string> = ["content/home.yaml"];

export const validateCatalog = Effect.fn("validateCatalog")(function* (
  sources: ReadonlyArray<string> = authoredCatalogSources,
) {
  const results = yield* Effect.forEach(sources, (source) => Effect.result(loadHome(source)), {
    concurrency: "unbounded",
  });
  const diagnostics = results.flatMap((result) =>
    Result.isFailure(result) ? result.failure.diagnostics : [],
  );

  if (diagnostics.length > 0) return yield* contentValidationError(diagnostics);
  return sources.length;
});
