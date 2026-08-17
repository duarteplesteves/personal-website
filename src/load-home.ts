import { Effect, Schema } from "effect";
import { HomeContentSchema } from "./home-content.ts";
import { loadYaml } from "./load-yaml.ts";

export const loadHome = Effect.fn("loadHome")(function* (source: string) {
  const input = yield* loadYaml(source);
  return yield* Schema.decodeUnknownEffect(HomeContentSchema, {
    onExcessProperty: "error",
  })(input);
});
