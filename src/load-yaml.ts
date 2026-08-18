import { Effect, FileSystem, Predicate, Schema, SchemaIssue } from "effect";
import {
  LineCounter,
  isAlias,
  isMap,
  isScalar,
  isSeq,
  parseAllDocuments,
  type Document,
  type ParsedNode,
} from "yaml";

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
const DiagnosticSchema = Schema.Struct({
  source: Schema.String,
  line: Schema.Int,
  column: Schema.Int,
  dataPath: Schema.String,
  identifier: Schema.optional(Schema.String),
  reason: Schema.String,
});

export type ContentDiagnostic = typeof DiagnosticSchema.Type;

export class ContentValidationError extends Schema.TaggedError<ContentValidationError>()(
  "ContentValidationError",
  {
    diagnostics: Schema.Array(DiagnosticSchema),
    message: Schema.String,
  },
) {}

type DataPath = ReadonlyArray<string | number>;
type SourceLocation = { readonly line: number; readonly column: number };

const formatDataPath = (path: DataPath) =>
  path.reduce<string>(
    (formatted, segment) =>
      typeof segment === "number"
        ? `${formatted}[${segment}]`
        : /^[A-Za-z_$][\w$]*$/.test(segment)
          ? `${formatted}.${segment}`
          : `${formatted}[${JSON.stringify(segment)}]`,
    "$",
  );

export const formatDiagnostic = (diagnostic: ContentDiagnostic) =>
  `${diagnostic.source}:${diagnostic.line}:${diagnostic.column} [${diagnostic.dataPath}]${
    diagnostic.identifier === undefined ? "" : ` (id: ${diagnostic.identifier})`
  } ${diagnostic.reason}`;

export const contentValidationError = (
  diagnostics: ReadonlyArray<ContentDiagnostic>,
): ContentValidationError => {
  const values = [...diagnostics];
  return new ContentValidationError({
    diagnostics: values,
    message: values.map(formatDiagnostic).join("\n"),
  });
};

class LoadedYaml {
  constructor(
    readonly source: string,
    readonly value: unknown,
    private readonly document: Document.Parsed,
    private readonly lineCounter: LineCounter,
  ) {}

  private location(path: DataPath): SourceLocation {
    let candidate = [...path];
    while (candidate.length > 0 && this.document.getIn(candidate, true) === undefined) {
      candidate = candidate.slice(0, -1);
    }
    const node =
      candidate.length === 0 ? this.document.contents : this.document.getIn(candidate, true);
    const offset = Predicate.isObject(node) && Array.isArray(node.range) ? node.range[0] : 0;
    const location = this.lineCounter.linePos(offset);
    return { line: location.line, column: location.col };
  }

  private valueAt(path: DataPath): unknown {
    let value: unknown = this.value;
    for (const segment of path) {
      if (Array.isArray(value) && typeof segment === "number") {
        value = value[segment];
      } else if (Predicate.isObject(value) && typeof segment === "string") {
        value = value[segment];
      } else {
        return undefined;
      }
    }
    return value;
  }

  private identifier(path: DataPath): string | undefined {
    for (let length = path.length; length >= 0; length -= 1) {
      const value = this.valueAt(path.slice(0, length));
      if (Predicate.isObject(value) && Predicate.isString(value.id)) return value.id;
    }
  }

  diagnostics(error: Schema.SchemaError): ReadonlyArray<ContentDiagnostic> {
    const formatted = SchemaIssue.makeFormatterStandardSchemaV1({
      leafHook: (issue) =>
        issue._tag === "UnexpectedKey"
          ? "Unexpected key is not allowed"
          : SchemaIssue.defaultLeafHook(issue),
    })(error.issue);

    return formatted.issues.map((issue) => {
      const path = (issue.path ?? []).filter(
        (segment): segment is string | number =>
          Predicate.isString(segment) || Predicate.isNumber(segment),
      );
      const location = this.location(path);
      return {
        source: this.source,
        line: location.line,
        column: location.column,
        dataPath: formatDataPath(path),
        identifier: this.identifier(path),
        reason: issue.message,
      };
    });
  }
}

export const sourceValidationError = (
  source: string,
  reason: string,
  line = 1,
  column = 1,
  path: DataPath = [],
): ContentDiagnostic => ({
  source,
  line,
  column,
  dataPath: formatDataPath(path),
  reason,
});

const inspectNodes = (
  source: string,
  lineCounter: LineCounter,
  node: ParsedNode | null,
  path: DataPath = [],
): Array<ContentDiagnostic> => {
  if (node === null) return [];
  const offset = node.range?.[0] ?? 0;
  const location = lineCounter.linePos(offset);
  const diagnostic = (reason: string) =>
    sourceValidationError(source, reason, location.line, location.col, path);

  if (isAlias(node)) return [diagnostic("aliases are not allowed; repeat the value explicitly")];
  if (node.tag !== undefined && !standardTags.has(node.tag)) {
    return [diagnostic(`custom tag ${node.tag} is not allowed; use JSON-compatible YAML values`)];
  }
  if (isMap(node)) {
    return node.items.flatMap((pair) => {
      const key = isScalar(pair.key) && Predicate.isString(pair.key.value) ? pair.key.value : "?";
      const keyDiagnostics = isScalar(pair.key)
        ? inspectNodes(source, lineCounter, pair.key, [...path, key])
        : [];
      const valueDiagnostics =
        pair.value === null ? [] : inspectNodes(source, lineCounter, pair.value, [...path, key]);
      return [...keyDiagnostics, ...valueDiagnostics];
    });
  }
  if (isSeq(node)) {
    return node.items.flatMap((item, index) =>
      item === null ? [] : inspectNodes(source, lineCounter, item, [...path, index]),
    );
  }
  return [];
};

const decodeLoadedYaml = Effect.fn("decodeLoadedYaml")(function* <S extends Schema.Top>(
  loaded: LoadedYaml,
  schema: S,
) {
  return yield* Schema.decodeUnknownEffect(schema, {
    errors: "all",
    onExcessProperty: "error",
  })(loaded.value).pipe(
    Effect.mapError((error) => contentValidationError(loaded.diagnostics(error))),
  );
});

const parseYaml = Effect.fn("parseYaml")(function* (source: string, text: string) {
  if (Buffer.byteLength(text) > maximumSourceBytes) {
    return yield* contentValidationError([
      sourceValidationError(source, `source exceeds the ${maximumSourceBytes}-byte limit`),
    ]);
  }

  const lineCounter = new LineCounter();
  const documents = yield* Effect.try({
    try: () =>
      parseAllDocuments(text, {
        customTags: [],
        lineCounter,
        merge: false,
        prettyErrors: false,
        resolveKnownTags: false,
        schema: "core",
        strict: true,
        stringKeys: true,
        uniqueKeys: true,
        version: "1.2",
      }),
    catch: (cause) =>
      contentValidationError([
        sourceValidationError(source, `could not parse YAML: ${String(cause)}`),
      ]),
  });

  if (documents.length !== 1) {
    const secondDocument = documents[1];
    const location = lineCounter.linePos(secondDocument?.range?.[0] ?? 0);
    return yield* contentValidationError([
      sourceValidationError(
        source,
        `expected one document, received ${documents.length}; keep one YAML document per source`,
        location.line,
        location.col,
      ),
    ]);
  }

  const document = documents[0];
  if (document.errors.length > 0) {
    return yield* contentValidationError(
      document.errors.map((error) => {
        const location = lineCounter.linePos(error.pos[0]);
        return sourceValidationError(source, error.message, location.line, location.col);
      }),
    );
  }

  const nodeDiagnostics = inspectNodes(source, lineCounter, document.contents);
  if (nodeDiagnostics.length > 0) return yield* contentValidationError(nodeDiagnostics);

  const value: unknown = document.toJS({ maxAliasCount: 0 });
  return new LoadedYaml(source, value, document, lineCounter);
});

export const loadYaml = Effect.fn("loadYaml")(function* (source: string) {
  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs
    .readFileString(source)
    .pipe(
      Effect.mapError((error) =>
        contentValidationError([
          sourceValidationError(source, `could not read source: ${String(error)}`),
        ]),
      ),
    );

  return yield* parseYaml(source, text);
});

export const decodeYaml = decodeLoadedYaml;
