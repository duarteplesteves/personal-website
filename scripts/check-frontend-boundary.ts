import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import ts from "typescript";
import { Console, Effect, FileSystem, Schema } from "effect";

class FrontendBoundaryError extends Schema.TaggedError<FrontendBoundaryError>()(
  "FrontendBoundaryError",
  { message: Schema.String },
) {}

const repositorySchemaPattern =
  /(?:^|\/)(?:authored-fields|home-content|load-home|load-yaml|page-data-schema|validate-catalog)(?:\.ts)?$/;

const forbiddenReason = (specifier: string, typeOnly: boolean): string | undefined => {
  if (
    !typeOnly &&
    (specifier === "effect" || specifier.startsWith("effect/") || specifier.startsWith("@effect/"))
  ) {
    return "Effect runtime values are not allowed in frontend modules";
  }
  if (repositorySchemaPattern.test(specifier)) {
    return "repository schemas are not allowed in frontend modules";
  }
  if (specifier === "yaml" || specifier.startsWith("yaml/")) {
    return "YAML parsing is not allowed in frontend modules";
  }
  if (
    specifier === "fs" ||
    specifier.startsWith("fs/") ||
    specifier === "node:fs" ||
    specifier.startsWith("node:fs/")
  ) {
    return "filesystem access is not allowed in frontend modules";
  }
};

const checkSource = (file: string, text: string): ReadonlyArray<string> => {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const diagnostics: Array<string> = [];
  const report = (node: ts.Node, specifier: string, typeOnly: boolean) => {
    const reason = forbiddenReason(specifier, typeOnly);
    if (reason === undefined) return;
    const location = source.getLineAndCharacterOfPosition(node.getStart(source));
    diagnostics.push(
      `${file}:${location.line + 1}:${location.character + 1} ${reason}: ${specifier}`,
    );
  };

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const namedBindings = clause?.namedBindings;
      const namedImportsAreTypes =
        namedBindings !== undefined &&
        ts.isNamedImports(namedBindings) &&
        namedBindings.elements.length > 0 &&
        namedBindings.elements.every((element) => element.isTypeOnly);
      report(node, node.moduleSpecifier.text, clause?.isTypeOnly === true || namedImportsAreTypes);
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      report(node, node.arguments[0].text, false);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return diagnostics;
};

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const matches = yield* Effect.all([
    fs.glob("src/**/*.tsrx"),
    fs.glob("src/browser/**/*.ts"),
    fs.glob("src/browser/**/*.tsx"),
    fs.glob("src/browser/**/*.js"),
  ]);
  const files = [...new Set(matches.flat())].sort();
  const diagnostics = (yield* Effect.forEach(files, (file) =>
    fs.readFileString(file).pipe(Effect.map((text) => checkSource(file, text))),
  )).flat();

  if (diagnostics.length > 0) {
    return yield* new FrontendBoundaryError({ message: diagnostics.join("\n") });
  }
  yield* Console.log(`Checked ${files.length} frontend module${files.length === 1 ? "" : "s"}`);
}).pipe(
  Effect.tapError((error) => Console.error(error instanceof Error ? error.message : String(error))),
  Effect.provide(NodeFileSystem.layer),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
