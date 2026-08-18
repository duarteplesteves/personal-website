import { Effect, FileSystem, Schema } from "effect";
import { HomePageDataSchema } from "./page-data-schema.ts";
import type { SiteLanguage } from "./publication.ts";

export class GeneratedContentError extends Schema.TaggedError<GeneratedContentError>()(
  "GeneratedContentError",
  {
    source: Schema.String,
    message: Schema.String,
  },
) {}

export const loadGeneratedHome = Effect.fn("loadGeneratedHome")(function* (
  siteLanguage: SiteLanguage,
) {
  const fs = yield* FileSystem.FileSystem;
  const source = `.generated/${siteLanguage}/home.json`;
  const text = yield* fs.readFileString(source).pipe(
    Effect.mapError(
      (cause) =>
        new GeneratedContentError({
          source,
          message: `Could not read generated content ${source}: ${String(cause)}`,
        }),
    ),
  );
  const input = yield* Effect.try({
    try: () => JSON.parse(text) as unknown,
    catch: (cause) =>
      new GeneratedContentError({
        source,
        message: `Could not parse generated content ${source}: ${String(cause)}`,
      }),
  });
  return yield* Schema.decodeUnknownEffect(HomePageDataSchema, {
    errors: "all",
    onExcessProperty: "error",
  })(input).pipe(
    Effect.mapError(
      (cause) =>
        new GeneratedContentError({
          source,
          message: `Generated content ${source} does not match its page contract: ${cause.message}`,
        }),
    ),
  );
});
