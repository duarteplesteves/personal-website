import { Effect } from "effect";
import { LibraryContentSchema } from "./library-content.ts";
import { decodeYaml, loadYaml } from "./load-yaml.ts";

export const loadLibrary = Effect.fn("loadLibrary")(function* (source: string) {
  const input = yield* loadYaml(source);
  return yield* decodeYaml(input, LibraryContentSchema);
});
