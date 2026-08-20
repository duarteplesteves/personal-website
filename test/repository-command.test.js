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
const validLibrary = await readFile(join(repositoryRoot, "content/library.yaml"), "utf8");
const identifierScript = join(repositoryRoot, "scripts/identifier.ts");
const boundaryScript = join(repositoryRoot, "scripts/check-frontend-boundary.ts");

const runScript = (directory, script, ...arguments_) =>
  spawnSync("nub", [script, ...arguments_], { cwd: directory, encoding: "utf8" });

const runValidate = (directory, ...sources) => runScript(directory, validateScript, ...sources);

const writeCatalog = async (context, contents, library = validLibrary) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "content"));
  await writeFile(join(directory, "content/home.yaml"), contents);
  await writeFile(join(directory, "content/site.yaml"), validSite);
  await writeFile(join(directory, "content/library.yaml"), library);
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
  assert.match(result.stdout, /Validated 3 authored content sources/);
  assert.deepEqual(await readdir(join(directory, "content")), [
    "home.yaml",
    "library.yaml",
    "site.yaml",
  ]);
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

test("validate accepts a sparse Book with optional Alternate titles", async (context) => {
  const directory = await writeCatalog(
    context,
    validHome,
    `${validLibrary.trim()}\n    alternateTitles:\n      - My Brilliant Friend\n`,
  );

  const result = runValidate(directory, "content/library.yaml");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 1 authored content source/);
});

test("validate requires an explicit sort value for every author credit", async (context) => {
  const directory = await writeCatalog(
    context,
    validHome,
    validLibrary.replace("        sortValue: Cavia, Juan\n", ""),
  );

  const result = runValidate(directory, "content/library.yaml");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /library\.yaml:\d+:\d+ \[\$\.books\[0\]\.authors\[0\]\.sortValue\]/);
});

test("validate rejects invalid and duplicate durable Book identifiers", async (context) => {
  const invalidDirectory = await writeCatalog(
    context,
    validHome,
    validLibrary.replace("01a01fcd-0a4e-7c1c-9e31-8de4688c1482", "not-an-identifier"),
  );
  const duplicateDirectory = await writeCatalog(
    context,
    validHome,
    `${validLibrary.trim()}\n${validLibrary.split("\n").slice(1).join("\n")}`,
  );

  const invalid = runValidate(invalidDirectory, "content/library.yaml");
  const duplicate = runValidate(duplicateDirectory, "content/library.yaml");

  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /a UUID v7/i);
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /duplicate durable identifier/i);
});

test("validate accepts complete Editions and format-appropriate optional fields", async (context) => {
  const directory = await writeCatalog(
    context,
    validHome,
    `${validLibrary.trim()}\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Balada para Sophie\n    language: pt-PT\n    format: hardcover\n    publisher: Porto Editora\n    publicationDate: 2024-09\n    isbn: 978-3-16-148410-0\n    contributors:\n      - displayName: João Translator\n        role: translator\n    pageCount: 320\n    inCollection: true\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Ballad for Sophie\n    language: en-GB\n    format: ebook\n    pageCount: 300\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1485\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Ballad for Sophie\n    language: en\n    format: audiobook\n    durationMinutes: 600\n`,
  );

  const result = runValidate(directory, "content/library.yaml");

  assert.equal(result.status, 0, result.stderr);
  const generated = runScript(directory, generateScript);
  assert.equal(generated.status, 0, generated.stderr);
  const page = JSON.parse(await readFile(join(directory, ".generated/en/library.json")));
  assert.equal(page.books[0].inCollection, true);
  assert.ok(!("editions" in page));
});

test("Readings and curation derive public Library and Home relationships", async (context) => {
  const library = `${validLibrary.trim()}\n    alternateTitles:\n      - Balada para Sophie\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Ballad for Sophie\n    language: en\n    format: hardcover\nreadings:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    editionIds:\n      - 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    state: completed\n    startedOn: 2024-01\n    endedOn: 2024-02\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1485\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    state: active\nfavorites:\n  - 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n`;
  const directory = await writeCatalog(context, validHome, library);

  assert.equal(runValidate(directory).status, 0);
  const generated = runScript(directory, generateScript);
  assert.equal(generated.status, 0, generated.stderr);
  const libraryPage = JSON.parse(await readFile(join(directory, ".generated/en/library.json")));
  const homePage = JSON.parse(await readFile(join(directory, ".generated/en/home.json")));

  assert.deepEqual(
    {
      readingStatus: libraryPage.books[0].readingStatus,
      completionCount: libraryPage.books[0].completionCount,
      rereading: libraryPage.books[0].rereading,
      favorite: libraryPage.books[0].favorite,
      nextRead: libraryPage.books[0].nextRead,
    },
    { readingStatus: "read", completionCount: 1, rereading: true, favorite: true, nextRead: false },
  );
  assert.deepEqual(homePage.libraryPreview.currentlyReading, [
    {
      id: libraryPage.books[0].id,
      title: "Ballad for Sophie",
      authors: libraryPage.books[0].authors,
    },
  ]);
  assert.equal(homePage.libraryPreview.favorites.length, 1);
  assert.ok(!("nextReads" in homePage.libraryPreview));
});

test("validate rejects invalid Reading and curation relationships", async (context) => {
  const library = `${validLibrary.trim()}\nreadings:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    editionIds:\n      - 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    state: active\n    endedOn: 2025-01\nnextReads:\n  - 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n`;
  const directory = await writeCatalog(context, validHome, library);
  const result = runValidate(directory, "content/library.yaml");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /active Reading cannot have an end date/i);
  assert.match(result.stderr, /referenced Edition does not exist/i);
  assert.match(result.stderr, /Next reads Book cannot have an active or completed Reading/i);
});

test("validate rejects incomplete Editions and format-inappropriate extents", async (context) => {
  const incompleteDirectory = await writeCatalog(
    context,
    validHome,
    `${validLibrary.trim()}\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Balada para Sophie\n    language: not_a_language\n`,
  );
  const printDurationDirectory = await writeCatalog(
    context,
    validHome,
    `${validLibrary.trim()}\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Balada para Sophie\n    language: pt\n    format: paperback\n    durationMinutes: 600\n`,
  );
  const audioPagesDirectory = await writeCatalog(
    context,
    validHome,
    `${validLibrary.trim()}\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Balada para Sophie\n    language: en\n    format: audiobook\n    pageCount: 320\n`,
  );

  const incomplete = runValidate(incompleteDirectory, "content/library.yaml");
  const printDuration = runValidate(printDurationDirectory, "content/library.yaml");
  const audioPages = runValidate(audioPagesDirectory, "content/library.yaml");

  assert.notEqual(incomplete.status, 0);
  assert.match(incomplete.stderr, /format/i);
  assert.match(incomplete.stderr, /BCP 47/i);
  assert.notEqual(printDuration.status, 0);
  assert.match(printDuration.stderr, /durationMinutes.*Unexpected key/i);
  assert.notEqual(audioPages.status, 0);
  assert.match(audioPages.stderr, /pageCount.*Unexpected key/i);
});

test("validate rejects references to Books that do not exist", async (context) => {
  const directory = await writeCatalog(
    context,
    validHome,
    `${validLibrary.trim()}\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    title: My Brilliant Friend\n    language: en\n    format: paperback\n`,
  );

  const result = runValidate(directory, "content/library.yaml");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[\$\.editions\[0\]\.bookId\].*referenced Book does not exist/i);
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
  const englishLibrary = JSON.parse(await readFile(join(directory, ".generated/en/library.json")));
  const portugueseLibrary = JSON.parse(
    await readFile(join(directory, ".generated/pt/library.json")),
  );
  assert.equal(englishLibrary.heading, "Library");
  assert.equal(portugueseLibrary.heading, "Biblioteca");
  assert.deepEqual(englishLibrary.books, portugueseLibrary.books);
  assert.deepEqual(englishLibrary.books, [
    {
      id: "01a01fcd-0a4e-7c1c-9e31-8de4688c1482",
      title: "Ballad for Sophie",
      authors: [
        { displayName: "Juan Cavia", sortValue: "Cavia, Juan" },
        { displayName: "Filipe Melo", sortValue: "Melo, Filipe" },
      ],
      alternateTitles: [],
      inCollection: false,
      readingStatus: "unread",
      completionCount: 0,
      rereading: false,
      favorite: false,
      nextRead: false,
    },
  ]);
  assert.equal(
    JSON.parse(await readFile(join(directory, ".generated/root.json"))).languages.pt,
    "Português",
  );
  assert.equal(englishLibrary.books[0].inCollection, false);
  assert.ok(!("editions" in englishLibrary));
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
