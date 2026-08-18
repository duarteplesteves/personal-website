import { Effect } from "effect";
import { HomeContentSchema } from "./home-content.ts";
import { decodeYaml, loadYaml } from "./load-yaml.ts";

export const loadHome = Effect.fn("loadHome")(function* (source: string) {
  const input = yield* loadYaml(source);
  return yield* decodeYaml(input, HomeContentSchema);
});
