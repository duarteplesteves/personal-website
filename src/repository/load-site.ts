import { Effect } from "effect";
import { decodeYaml, loadYaml } from "./load-yaml.ts";
import { SiteContentSchema } from "./site-content.ts";

export const loadSite = Effect.fn("loadSite")(function* (source: string) {
  const input = yield* loadYaml(source);
  return yield* decodeYaml(input, SiteContentSchema);
});
