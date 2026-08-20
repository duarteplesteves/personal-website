import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import test from "node:test";

const validHome = `
title: Duarte Esteves
introduction:
  en: English introduction
  pt: Introdução portuguesa
description:
  en: English description
  pt: Descrição portuguesa
`;

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const validateScript = join(repositoryRoot, "scripts/validate.ts");
const generateScript = join(repositoryRoot, "scripts/generate.ts");
const validSite = await readFile(join(repositoryRoot, "content/site.yaml"), "utf8");
const identifierScript = join(repositoryRoot, "scripts/identifier.ts");
const boundaryScript = join(repositoryRoot, "scripts/check-frontend-boundary.ts");

const runScript = (directory, script, ...arguments_) =>
  spawnSync("nub", [script, ...arguments_], { cwd: directory, encoding: "utf8" });

const runValidate = (directory, ...sources) => runScript(directory, validateScript, ...sources);

const writeCatalog = async (context, contents) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "content"));
  await writeFile(join(directory, "content/home.yaml"), contents);
  await writeFile(join(directory, "content/site.yaml"), validSite);
  return directory;
};

const validateSource = async (context, contents) => {
  const directory = await writeCatalog(context, contents);
  return runValidate(directory);
};

test("validate accepts the complete authored catalog without generating output", async (context) => {
  const directory = await writeCatalog(context, validHome);

  const result = runValidate(directory);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 2 authored content sources/);
  assert.deepEqual(await readdir(join(directory, "content")), ["home.yaml", "site.yaml"]);
});

test("validate rejects a missing Equivalent translation", async (context) => {
  const result = await validateSource(
    context,
    validHome.replace("  pt: Introdução portuguesa\n", ""),
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /home\.yaml:\d+:\d+ \[\$\.introduction\.pt\]/);
  assert.match(result.stderr, /Missing Portuguese Equivalent translation/);
});

test("validate rejects duplicate YAML keys", async (context) => {
  const result = await validateSource(context, `${validHome}title: Another title\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /keys must be unique/i);
});

test("validate rejects YAML aliases", async (context) => {
  const result = await validateSource(
    context,
    validHome
      .replace("title: Duarte Esteves", "title: &title Duarte Esteves")
      .replace("English description", "*title"),
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /aliases are not allowed/i);
});

test("validate rejects custom YAML tags", async (context) => {
  const result = await validateSource(
    context,
    validHome.replace("title: Duarte Esteves", "title: !person Duarte Esteves"),
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /custom tag !person is not allowed/i);
});

test("validate rejects multiple YAML documents", async (context) => {
  const result = await validateSource(context, `${validHome}---\n${validHome}`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /expected one document, received 2/i);
});

test("validate does not interpret authored prose as a date or URL field", async (context) => {
  const contents = validHome
    .replace("English introduction", "The unfinished date was 2025-02-30")
    .replace("English description", "The example used javascript:alert(1)");

  const result = await validateSource(context, contents);

  assert.equal(result.status, 0, result.stderr);
});

test("validate rejects oversized YAML", async (context) => {
  const result = await validateSource(context, `title: ${"x".repeat(1024 * 1024)}\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /home\.yaml:1:1 \[\$\].*exceeds the 1048576-byte limit/i);
});

test("validate rejects sources outside the authored catalog", async (context) => {
  const directory = await writeCatalog(context, validHome);

  const result = runValidate(directory, "content/other.yaml");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /content\/other\.yaml:1:1.*unknown authored content source/i);
});

test("validate rejects unknown Home fields", async (context) => {
  const result = await validateSource(context, `${validHome}unknown: true\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[\$\.unknown\].*Unexpected key/i);
});

test("generate atomically replaces deterministic route-level plain data", async (context) => {
  const directory = await writeCatalog(context, validHome);

  const first = runScript(directory, generateScript);
  assert.equal(first.status, 0, first.stderr);
  const englishPath = join(directory, ".generated/en/home.json");
  const portuguesePath = join(directory, ".generated/pt/home.json");
  const firstEnglish = await readFile(englishPath, "utf8");
  const firstPortuguese = await readFile(portuguesePath, "utf8");
  const firstEnglishPage = JSON.parse(firstEnglish);
  const firstPortuguesePage = JSON.parse(firstPortuguese);

  assert.deepEqual(
    {
      title: firstEnglishPage.title,
      introduction: firstEnglishPage.introduction,
      description: firstEnglishPage.description,
    },
    {
      title: "Duarte Esteves",
      introduction: "English introduction",
      description: "English description",
    },
  );
  assert.deepEqual(
    {
      title: firstPortuguesePage.title,
      introduction: firstPortuguesePage.introduction,
      description: firstPortuguesePage.description,
    },
    {
      title: "Duarte Esteves",
      introduction: "Introdução portuguesa",
      description: "Descrição portuguesa",
    },
  );
  assert.equal(
    JSON.parse(await readFile(join(directory, ".generated/en/library.json"))).heading,
    "Library",
  );
  assert.equal(
    JSON.parse(await readFile(join(directory, ".generated/pt/library.json"))).heading,
    "Biblioteca",
  );
  assert.equal(
    JSON.parse(await readFile(join(directory, ".generated/root.json"))).languages.pt,
    "Português",
  );
  await writeFile(join(directory, ".generated/stale.json"), "stale\n");

  const second = runScript(directory, generateScript);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(await readFile(englishPath, "utf8"), firstEnglish);
  assert.equal(await readFile(portuguesePath, "utf8"), firstPortuguese);
  await assert.rejects(readFile(join(directory, ".generated/stale.json"), "utf8"), {
    code: "ENOENT",
  });
});

test("failed production generation preserves the complete previous output", async (context) => {
  const directory = await writeCatalog(context, validHome);
  assert.equal(runScript(directory, generateScript).status, 0);
  const englishPath = join(directory, ".generated/en/home.json");
  const portuguesePath = join(directory, ".generated/pt/home.json");
  const previousEnglish = await readFile(englishPath, "utf8");
  const previousPortuguese = await readFile(portuguesePath, "utf8");
  await writeFile(
    join(directory, "content/home.yaml"),
    validHome.replace("  pt: Introdução portuguesa\n", ""),
  );

  const result = runScript(directory, generateScript);

  assert.notEqual(result.status, 0);
  assert.equal(await readFile(englishPath, "utf8"), previousEnglish);
  assert.equal(await readFile(portuguesePath, "utf8"), previousPortuguese);
});

test("invalid development generation removes stale generated output", async (context) => {
  const directory = await writeCatalog(context, validHome);
  assert.equal(runScript(directory, generateScript).status, 0);
  await writeFile(
    join(directory, "content/home.yaml"),
    validHome.replace("  pt: Introdução portuguesa\n", ""),
  );

  const result = runScript(directory, generateScript, "--development");

  assert.notEqual(result.status, 0);
  await assert.rejects(readFile(join(directory, ".generated/en/home.json"), "utf8"), {
    code: "ENOENT",
  });
});

test("identifier emits a UUIDv7 through the project command", () => {
  const result = runScript(repositoryRoot, identifierScript);
  const identifier = result.stdout.trim();

  assert.equal(result.status, 0, result.stderr);
  assert.match(identifier, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.ok(
    Math.abs(Number.parseInt(identifier.replaceAll("-", "").slice(0, 12), 16) - Date.now()) <
      10_000,
  );
});

test("frontend boundary rejects repository runtime dependencies", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-boundary-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "src/browser"), { recursive: true });
  await mkdir(join(directory, "src/repository"), { recursive: true });
  await writeFile(
    join(directory, "src/repository/home-content.ts"),
    "export const HomeContentSchema = {};\n",
  );
  await writeFile(
    join(directory, "src/browser/enhance.ts"),
    [
      'import { Effect } from "effect";',
      'import { HomeContentSchema } from "../repository/home-content.ts";',
      'import { readFile } from "node:fs/promises";',
      'import { parse } from "yaml";',
      "void [Effect, HomeContentSchema, readFile, parse];",
    ].join("\n"),
  );

  const result = runScript(directory, boundaryScript);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /src\/browser\/enhance\.ts:1:1/);
  assert.match(result.stderr, /Effect runtime values are not allowed/i);
  assert.match(result.stderr, /repository modules are not allowed/i);
  assert.match(result.stderr, /filesystem access is not allowed/i);
  assert.match(result.stderr, /YAML parsing is not allowed/i);
});

test("frontend boundary rejects runtime re-exports", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-boundary-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "src/browser"), { recursive: true });
  await writeFile(join(directory, "src/browser/effect.ts"), 'export { Effect } from "effect";\n');

  const result = runScript(directory, boundaryScript);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /src\/browser\/effect\.ts:1:1/);
  assert.match(result.stderr, /Effect runtime values are not allowed/i);
});

test("frontend boundary rejects transitive runtime dependencies", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-boundary-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "src"), { recursive: true });
  await writeFile(
    join(directory, "src/home.tsrx"),
    'import { runtime } from "./runtime.ts";\nexport function Home() @{ <p>{String(runtime)}</p>; }\n',
  );
  await writeFile(
    join(directory, "src/runtime.ts"),
    'import { Effect } from "effect";\nexport const runtime = Effect.void;\n',
  );

  const result = runScript(directory, boundaryScript);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /src\/runtime\.ts:1:1/);
  assert.match(result.stderr, /Effect runtime values are not allowed/i);
  assert.match(result.stderr, /src\/home\.tsrx -> src\/runtime\.ts -> effect/);
});

test("frontend boundary rejects non-static runtime imports", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-boundary-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "src/browser"), { recursive: true });
  await writeFile(
    join(directory, "src/browser/dynamic.ts"),
    'const moduleName = "effect";\nvoid import(moduleName);\n',
  );

  const result = runScript(directory, boundaryScript);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /src\/browser\/dynamic\.ts:2:6/);
  assert.match(result.stderr, /non-static runtime imports are not allowed/i);
});

test("frontend boundary resolves TypeScript behind JavaScript module specifiers", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-boundary-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "src"), { recursive: true });
  await writeFile(
    join(directory, "src/home.tsrx"),
    'import { runtime } from "./runtime.js";\nexport function Home() @{ <p>{String(runtime)}</p>; }\n',
  );
  await writeFile(
    join(directory, "src/runtime.ts"),
    'import { Effect } from "effect";\nexport const runtime = Effect.void;\n',
  );

  const result = runScript(directory, boundaryScript);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /src\/runtime\.ts:1:1/);
  assert.match(result.stderr, /Effect runtime values are not allowed/i);
});
