import { NodeFileSystem, NodePath, NodeRuntime } from "@effect/platform-node";
import { builtinModules } from "node:module";
import ts from "typescript";
import { Console, Effect, FileSystem, Layer, Path, Schema } from "effect";

class FrontendBoundaryError extends Schema.TaggedError<FrontendBoundaryError>()(
  "FrontendBoundaryError",
  { message: Schema.String },
) {}

interface ModuleLocation {
  readonly line: number;
  readonly character: number;
}

interface StaticModuleEdge extends ModuleLocation {
  readonly _tag: "StaticModuleEdge";
  readonly specifier: string;
  readonly typeOnly: boolean;
}

interface NonStaticModuleEdge extends ModuleLocation {
  readonly _tag: "NonStaticModuleEdge";
}

type ModuleEdge = StaticModuleEdge | NonStaticModuleEdge;

interface PendingModule {
  readonly file: string;
  readonly chain: ReadonlyArray<string>;
}

const sourceExtensions = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs", ".tsrx"];
const sourceSubstitutions = [
  { specifierExtension: ".js", sourceExtensions: [".ts", ".tsx", ".js", ".jsx"] },
  { specifierExtension: ".jsx", sourceExtensions: [".tsx", ".jsx"] },
  { specifierExtension: ".mjs", sourceExtensions: [".mts", ".mjs"] },
  { specifierExtension: ".cjs", sourceExtensions: [".cts", ".cjs"] },
] as const;
const nodeModules = new Set(builtinModules.map((module) => module.replace(/^node:/, "")));

const isLocalSpecifier = (specifier: string) =>
  specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/");

const hasPackagePrefix = (specifier: string, name: string) =>
  specifier === name || specifier.startsWith(`${name}/`);

const forbiddenPackageReason = (specifier: string): string | undefined => {
  if (isLocalSpecifier(specifier)) return;
  if (
    hasPackagePrefix(specifier, "effect") ||
    specifier === "@effect" ||
    specifier.startsWith("@effect/")
  ) {
    return "Effect runtime values are not allowed in frontend modules";
  }
  if (hasPackagePrefix(specifier, "yaml")) {
    return "YAML parsing is not allowed in frontend modules";
  }

  const nodeModule = specifier.replace(/^node:/, "");
  if (nodeModule === "fs" || nodeModule.startsWith("fs/")) {
    return "filesystem access is not allowed in frontend modules";
  }
  if (nodeModules.has(nodeModule)) {
    return "Node.js runtime modules are not allowed in frontend modules";
  }
  if (!hasPackagePrefix(specifier, "octane")) {
    return "runtime package is not approved for frontend modules";
  }
};

const isTypeOnlyImport = (clause: ts.ImportClause | undefined) => {
  if (clause?.isTypeOnly === true) return true;
  if (clause === undefined || clause.name !== undefined) return false;
  return (
    clause.namedBindings !== undefined &&
    ts.isNamedImports(clause.namedBindings) &&
    clause.namedBindings.elements.length > 0 &&
    clause.namedBindings.elements.every((element) => element.isTypeOnly)
  );
};

const isTypeOnlyExport = (declaration: ts.ExportDeclaration) =>
  declaration.isTypeOnly ||
  (declaration.exportClause !== undefined &&
    ts.isNamedExports(declaration.exportClause) &&
    declaration.exportClause.elements.length > 0 &&
    declaration.exportClause.elements.every((element) => element.isTypeOnly));

const staticSpecifier = (node: ts.Expression): string | undefined =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : undefined;

const collectModuleEdges = (file: string, text: string): ReadonlyArray<ModuleEdge> => {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const edges: Array<ModuleEdge> = [];
  const locationOf = (node: ts.Node): ModuleLocation => {
    const location = source.getLineAndCharacterOfPosition(node.getStart(source));
    return { line: location.line + 1, character: location.character + 1 };
  };
  const addStatic = (node: ts.Node, specifier: string, typeOnly: boolean) => {
    edges.push({ _tag: "StaticModuleEdge", specifier, typeOnly, ...locationOf(node) });
  };
  const addNonStatic = (node: ts.Node) => {
    edges.push({ _tag: "NonStaticModuleEdge", ...locationOf(node) });
  };

  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      addStatic(node, node.moduleSpecifier.text, isTypeOnlyImport(node.importClause));
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      addStatic(node, node.moduleSpecifier.text, isTypeOnlyExport(node));
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      const expression = node.moduleReference.expression;
      const specifier = expression === undefined ? undefined : staticSpecifier(expression);
      if (specifier !== undefined) addStatic(node, specifier, node.isTypeOnly);
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length > 0 &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      const specifier = staticSpecifier(node.arguments[0]);
      if (specifier === undefined) addNonStatic(node);
      else addStatic(node, specifier, false);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return edges;
};

const resolveLocalModule = Effect.fn("resolveFrontendLocalModule")(function* (
  importer: string,
  specifier: string,
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const resolved = path.normalize(
    specifier.startsWith("/") ? specifier.slice(1) : path.join(path.dirname(importer), specifier),
  );
  const substitution = sourceSubstitutions.find(({ specifierExtension }) =>
    resolved.endsWith(specifierExtension),
  );
  const candidates =
    substitution !== undefined
      ? substitution.sourceExtensions.map(
          (extension) =>
            `${resolved.slice(0, -substitution.specifierExtension.length)}${extension}`,
        )
      : sourceExtensions.some((extension) => resolved.endsWith(extension))
        ? [resolved]
        : [
            ...sourceExtensions.map((extension) => `${resolved}${extension}`),
            ...sourceExtensions.map((extension) => path.join(resolved, `index${extension}`)),
          ];

  for (const candidate of candidates) {
    if (yield* fs.exists(candidate)) return candidate;
  }
});

const isRepositoryModule = (file: string) =>
  file === "src/repository" || file.startsWith("src/repository/");

const formatDiagnostic = (
  file: string,
  location: ModuleLocation,
  reason: string,
  specifier: string,
  chain: ReadonlyArray<string>,
) =>
  `${file}:${location.line}:${location.character} ${reason}: ${specifier}\n  dependency chain: ${chain.join(" -> ")}`;

const checkFrontendGraph = Effect.fn("checkFrontendGraph")(function* (
  roots: ReadonlyArray<string>,
) {
  const fs = yield* FileSystem.FileSystem;
  const pending: Array<PendingModule> = roots.map((file) => ({ file, chain: [file] }));
  const visited = new Set<string>();
  const diagnostics: Array<string> = [];
  const reported = new Set<string>();
  const report = (
    file: string,
    location: ModuleLocation,
    reason: string,
    specifier: string,
    chain: ReadonlyArray<string>,
  ) => {
    const key = `${file}:${location.line}:${location.character}:${reason}`;
    if (reported.has(key)) return;
    reported.add(key);
    diagnostics.push(formatDiagnostic(file, location, reason, specifier, chain));
  };

  while (pending.length > 0) {
    const current = pending.shift();
    if (current === undefined || visited.has(current.file)) continue;
    visited.add(current.file);

    const text = yield* fs.readFileString(current.file);
    for (const edge of collectModuleEdges(current.file, text)) {
      if (edge._tag === "NonStaticModuleEdge") {
        report(
          current.file,
          edge,
          "non-static runtime imports are not allowed in frontend modules",
          "<dynamic>",
          [...current.chain, "<dynamic>"],
        );
        continue;
      }
      if (edge.typeOnly) continue;

      const packageReason = forbiddenPackageReason(edge.specifier);
      if (packageReason !== undefined) {
        report(current.file, edge, packageReason, edge.specifier, [
          ...current.chain,
          edge.specifier,
        ]);
        continue;
      }

      if (!isLocalSpecifier(edge.specifier)) continue;
      const dependency = yield* resolveLocalModule(current.file, edge.specifier);
      if (dependency === undefined) continue;
      const chain = [...current.chain, dependency];

      if (isRepositoryModule(dependency)) {
        report(
          current.file,
          edge,
          "repository modules are not allowed in frontend modules",
          edge.specifier,
          chain,
        );
        continue;
      }

      pending.push({ file: dependency, chain });
    }
  }

  return diagnostics;
});

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const matches = yield* Effect.all([
    fs.glob("src/**/*.tsrx"),
    fs.glob("src/browser/**/*.ts"),
    fs.glob("src/browser/**/*.tsx"),
    fs.glob("src/browser/**/*.mts"),
    fs.glob("src/browser/**/*.cts"),
    fs.glob("src/browser/**/*.js"),
    fs.glob("src/browser/**/*.jsx"),
    fs.glob("src/browser/**/*.mjs"),
    fs.glob("src/browser/**/*.cjs"),
  ]);
  const files = [...new Set(matches.flat())].sort();
  const diagnostics = yield* checkFrontendGraph(files);

  if (diagnostics.length > 0) {
    return yield* new FrontendBoundaryError({ message: diagnostics.join("\n") });
  }
  yield* Console.log(`Checked ${files.length} frontend module${files.length === 1 ? "" : "s"}`);
}).pipe(
  Effect.tapError((error) => Console.error(error instanceof Error ? error.message : String(error))),
  Effect.provide(Layer.merge(NodeFileSystem.layer, NodePath.layer)),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
