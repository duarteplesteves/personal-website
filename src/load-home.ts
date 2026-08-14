import { Effect, FileSystem, Schema } from "effect";
import { HomeContentSchema } from "./home-content.ts";

export const loadHome = Effect.fn("loadHome")(
  function* (source: string) {
    const fs = yield* FileSystem.FileSystem;
    const text = yield* fs
      .readFileString(source)
      .pipe(Effect.mapError((error) => new Error(`Could not read ${source}: ${String(error)}`)));
    const json = yield* Effect.try({
      try: () => JSON.parse(text) as unknown,
      catch: (error) => new Error(`Invalid JSON in ${source}: ${String(error)}`),
    });

    return yield* Schema.decodeUnknownEffect(HomeContentSchema)(json);
  },
  Effect.mapError((error) => (error instanceof Error ? error : new Error(String(error)))),
);
