import { Effect, ParseResult, Schema } from "effect";
import { readFile } from "node:fs/promises";
import { HomeContentSchema } from "./home-content.ts";

export const loadHome = (source: string) =>
  Effect.tryPromise({
    try: () => readFile(source, "utf8"),
    catch: (error) => new Error(`Could not read ${source}: ${String(error)}`),
  }).pipe(
    Effect.flatMap((text) =>
      Effect.try({
        try: () => JSON.parse(text) as unknown,
        catch: (error) => new Error(`Invalid JSON in ${source}: ${String(error)}`),
      }),
    ),
    Effect.flatMap(Schema.decodeUnknown(HomeContentSchema)),
    Effect.mapError((error) =>
      ParseResult.isParseError(error)
        ? new Error(ParseResult.TreeFormatter.formatErrorSync(error))
        : error,
    ),
  );
