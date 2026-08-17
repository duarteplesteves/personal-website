import { Effect, FileSystem, Schema } from "effect";
import { parseAllDocuments, visit } from "yaml";

const maximumSourceBytes = 1024 * 1024;
const standardTags = new Set([
  "tag:yaml.org,2002:map",
  "tag:yaml.org,2002:seq",
  "tag:yaml.org,2002:str",
  "tag:yaml.org,2002:null",
  "tag:yaml.org,2002:bool",
  "tag:yaml.org,2002:int",
  "tag:yaml.org,2002:float",
]);

export class YamlSourceError extends Schema.TaggedError<YamlSourceError>()("YamlSourceError", {
  source: Schema.String,
  reason: Schema.Literals(["read", "tooLarge", "invalid"]),
  message: Schema.String,
}) {}

const invalidSource = (source: string, message: string) =>
  new YamlSourceError({
    source,
    reason: "invalid",
    message: `Invalid YAML in ${source}: ${message}`,
  });

const parseYaml = Effect.fn("parseYaml")(function* (source: string, text: string) {
  if (Buffer.byteLength(text) > maximumSourceBytes) {
    return yield* new YamlSourceError({
      source,
      reason: "tooLarge",
      message: `YAML source exceeds the ${maximumSourceBytes}-byte limit: ${source}`,
    });
  }

  const documents = parseAllDocuments(text, {
    customTags: [],
    merge: false,
    resolveKnownTags: false,
    schema: "core",
    strict: true,
    stringKeys: true,
    uniqueKeys: true,
    version: "1.2",
  });

  if (documents.length !== 1) {
    return yield* invalidSource(source, `expected one document, received ${documents.length}`);
  }

  const document = documents[0];
  if (document.errors.length > 0) {
    return yield* invalidSource(source, document.errors.map((error) => error.message).join("\n"));
  }

  let unsupportedFeature: string | undefined;
  visit(document, {
    Alias() {
      unsupportedFeature ??= "aliases are not allowed";
      return visit.BREAK;
    },
    Node(_key, node) {
      if (node.tag !== undefined && !standardTags.has(node.tag)) {
        unsupportedFeature ??= `custom tag ${node.tag} is not allowed`;
        return visit.BREAK;
      }
    },
  });

  if (unsupportedFeature !== undefined) {
    return yield* invalidSource(source, unsupportedFeature);
  }

  return document.toJS({ maxAliasCount: 0 }) as unknown;
});

export const loadYaml = Effect.fn("loadYaml")(function* (source: string) {
  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs.readFileString(source).pipe(
    Effect.mapError(
      (error) =>
        new YamlSourceError({
          source,
          reason: "read",
          message: `Could not read ${source}: ${String(error)}`,
        }),
    ),
  );

  return yield* parseYaml(source, text);
});
