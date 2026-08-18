import { Effect, FileSystem, Schema } from "effect";
import {
  HomePageDataSchema,
  LibraryPageDataSchema,
  RootPageDataSchema,
} from "./page-data-schema.ts";
import type { SiteLanguage } from "./publication.ts";

export class GeneratedContentError extends Schema.TaggedError<GeneratedContentError>()(
  "GeneratedContentError",
  {
    source: Schema.String,
    message: Schema.String,
  },
) {}

const readGenerated = Effect.fn("readGenerated")(function* (source: string) {
  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs.readFileString(source).pipe(
    Effect.mapError(
      (cause) =>
        new GeneratedContentError({
          source,
          message: `Could not read generated content ${source}: ${String(cause)}`,
        }),
    ),
  );
  return yield* Effect.try({
    try: () => JSON.parse(text) as unknown,
    catch: (cause) =>
      new GeneratedContentError({
        source,
        message: `Could not parse generated content ${source}: ${String(cause)}`,
      }),
  });
});

const decodeGenerated = <S extends Schema.Top>(source: string, schema: S) =>
  readGenerated(source).pipe(
    Effect.flatMap(
      Schema.decodeUnknownEffect(schema, { errors: "all", onExcessProperty: "error" }),
    ),
    Effect.mapError((cause) =>
      cause instanceof GeneratedContentError
        ? cause
        : new GeneratedContentError({
            source,
            message: `Generated content ${source} does not match its page contract: ${cause.message}`,
          }),
    ),
  );

export const loadGeneratedHome = Effect.fn("loadGeneratedHome")(function* (
  siteLanguage: SiteLanguage,
) {
  return yield* decodeGenerated(`.generated/${siteLanguage}/home.json`, HomePageDataSchema);
});

export const loadGeneratedLibrary = Effect.fn("loadGeneratedLibrary")(function* (
  siteLanguage: SiteLanguage,
) {
  return yield* decodeGenerated(`.generated/${siteLanguage}/library.json`, LibraryPageDataSchema);
});

export const loadGeneratedRoot = Effect.fn("loadGeneratedRoot")(function* () {
  return yield* decodeGenerated(".generated/root.json", RootPageDataSchema);
});
