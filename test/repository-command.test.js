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
work:
  technologiesLabel:
    en: Technologies
    pt: Tecnologias
  workingOn:
    heading:
      en: Working on
      pt: A trabalhar em
    items:
      - title:
          en: Active work
          pt: Trabalho ativo
        description:
          en: English active work
          pt: Trabalho ativo português
        technologies:
          - TypeScript
  selected:
    heading:
      en: Selected work
      pt: Trabalho selecionado
    items:
      - title:
          en: Selected work
          pt: Trabalho selecionado
        context:
          en: Independent work · Creator · 2026
          pt: Trabalho Independente · Criador · 2026
        points:
          - en: English selected work
            pt: Trabalho selecionado português
        technologies:
          - TypeScript
  experience:
    heading:
      en: Experience
      pt: Experiência
    present:
      en: present
      pt: presente
    items:
      - company: Example company
        roles:
          - title:
              en: Frontend Developer
              pt: Desenvolvedor de Frontend
            startedOn: 2024-01
            current: true
        description:
          en: English experience
          pt: Experiência portuguesa
setup:
  heading:
    en: Setup and tools
    pt: Configuração e ferramentas
  updated:
    en: Updated February 2026
    pt: Atualizado em fevereiro de 2026
  items:
    - en: Zed
      pt: Zed
contact:
  heading:
    en: Contact
    pt: Contacto
  links:
    - label:
        en: Email
        pt: Email
      href: mailto:duarteplesteves@gmail.com
`;

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const validateScript = join(repositoryRoot, "scripts/validate.ts");
const buildScript = join(repositoryRoot, "scripts/build.ts");
const validSite = await readFile(join(repositoryRoot, "content/site.yaml"), "utf8");
const validLibrary = `books:
  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482
    title: Ballad for Sophie
    authors:
      - displayName: Juan Cavia
        sortValue: Cavia, Juan
      - displayName: Filipe Melo
        sortValue: Melo, Filipe
`;
const identifierScript = join(repositoryRoot, "scripts/identifier.ts");
const boundaryScript = join(repositoryRoot, "scripts/check-frontend-boundary.ts");
const importIsbnScript = join(repositoryRoot, "scripts/import-isbn.ts");
const addBookScript = join(repositoryRoot, "scripts/add-book.ts");

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

test("validate accepts the complete authored catalog without writing output", async (context) => {
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

test("validate rejects Library count labels without their placeholders", async (context) => {
  const directory = await writeCatalog(context, validHome);
  await writeFile(
    join(directory, "content/site.yaml"),
    validSite
      .replace('    en: "{count} Books"', "    en: Books")
      .replace('    pt: "{matching} de {total} livros"', '    pt: "{matching} livros"'),
  );

  const result = runValidate(directory, "content/site.yaml");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\$\.library\.resultCountLabel\.en.*\{count\}/);
  assert.match(result.stderr, /\$\.library\.matchingResultCountLabel\.pt.*\{total\}/);
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
    `${validLibrary.trim()}\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Balada para Sophie\n    language: pt-PT\n    format: hardcover\n    publisher: Porto Editora\n    publicationDate: 2024-09\n    isbn: 978-3-16-148410-0\n    contributors:\n      - displayName: João Translator\n        role: translator\n    pageCount: 320\n    inCollection: true\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Ballad for Sophie\n    language: en-GB\n    format: ebook\n    pageCount: 300\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1485\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Ballad for Sophie\n    language: en\n    format: paperback\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1486\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Ballad for Sophie\n    language: en\n    format: audiobook\n    durationMinutes: 600\n`,
  );

  const result = runValidate(directory, "content/library.yaml");
  const built = runScript(directory, buildScript);
  const html = await readFile(join(directory, "dist/en/library/index.html"), "utf8");

  assert.equal(result.status, 0, result.stderr);
  assert.equal(built.status, 0, built.stderr);
  assert.match(html, /Ballad for Sophie(?:(?!<\/li>).)*In collection/s);
  assert.doesNotMatch(html, /Balada para Sophie/);
});

test("Readings and curation derive public Library and Home relationships", async (context) => {
  const library = `${validLibrary.trim()}\n    alternateTitles:\n      - Balada para Sophie\neditions:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    title: Ballad for Sophie\n    language: en\n    format: hardcover\nreadings:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    editionIds:\n      - 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    state: completed\n    startedOn: 2024-01\n    endedOn: 2024-02\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1485\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    state: active\nfavorites:\n  - 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n`;
  const directory = await writeCatalog(context, validHome, library);

  const validated = runValidate(directory);
  const built = runScript(directory, buildScript);
  const libraryHtml = await readFile(join(directory, "dist/en/library/index.html"), "utf8");
  const homeHtml = await readFile(join(directory, "dist/en/index.html"), "utf8");

  assert.equal(validated.status, 0, validated.stderr);
  assert.equal(built.status, 0, built.stderr);
  assert.match(
    libraryHtml,
    /Ballad for Sophie(?:(?!<\/li>).)*Favourite · Currently reading · Rereading/s,
  );
  assert.match(homeHtml, /Currently reading(?:(?!<\/section>).)*Ballad for Sophie/s);
  assert.match(homeHtml, /Favourites(?:(?!<\/section>).)*Ballad for Sophie/s);
  assert.doesNotMatch(homeHtml, /Next reads/);
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

test("Reflections require Equivalent translations, valid Reading references, and UUID creation order", async (context) => {
  const library = `${validLibrary.trim()}\nreadings:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    state: completed\nreflections:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1486\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    text:\n      en: Later reflection\n      pt: Reflexão posterior\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1485\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    readingId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    text:\n      en: Earlier reflection\n      pt: Reflexão anterior\n`;
  const directory = await writeCatalog(context, validHome, library);

  const built = runScript(directory, buildScript);
  const english = await readFile(join(directory, "dist/en/library/index.html"), "utf8");
  const portuguese = await readFile(join(directory, "dist/pt/library/index.html"), "utf8");

  assert.equal(built.status, 0, built.stderr);
  assert.ok(english.indexOf("Earlier reflection") < english.indexOf("Later reflection"));
  assert.ok(portuguese.indexOf("Reflexão anterior") < portuguese.indexOf("Reflexão posterior"));
});

test("validate rejects incomplete and cross-Book Reflection references", async (context) => {
  const secondBook = validLibrary
    .split("\n")
    .slice(1)
    .join("\n")
    .replace("01a01fcd-0a4e-7c1c-9e31-8de4688c1482", "01a01fcd-0a4e-7c1c-9e31-8de4688c1483")
    .replace("Ballad for Sophie", "Another Book");
  const library = `${validLibrary.trim()}\n${secondBook}\nreadings:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1483\n    state: completed\nreflections:\n  - id: 01a01fcd-0a4e-7c1c-9e31-8de4688c1485\n    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482\n    readingId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1484\n    text:\n      en: English reflection\n      pt: Reflexão portuguesa\n`;
  const incomplete = await writeCatalog(
    context,
    validHome,
    library.replace("      pt: Reflexão portuguesa\n", ""),
  );
  const crossBook = await writeCatalog(context, validHome, library);

  const incompleteResult = runValidate(incomplete, "content/library.yaml");
  const crossBookResult = runValidate(crossBook, "content/library.yaml");

  assert.notEqual(incompleteResult.status, 0);
  assert.match(incompleteResult.stderr, /Missing Portuguese Equivalent translation/);
  assert.notEqual(crossBookResult.status, 0);
  assert.match(crossBookResult.stderr, /referenced Reading belongs to a different Book/i);
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

test("validate enforces consistent Experience role periods", async (context) => {
  const currentWithEnd = await validateSource(
    context,
    validHome.replace(
      "            current: true\n",
      "            endedOn: 2025-01\n            current: true\n",
    ),
  );
  const formerWithoutEnd = await validateSource(
    context,
    validHome.replace("            current: true\n", "            current: false\n"),
  );
  const reversedDates = await validateSource(
    context,
    validHome.replace(
      "            current: true\n",
      "            endedOn: 2023-12\n            current: false\n",
    ),
  );

  assert.notEqual(currentWithEnd.status, 0);
  assert.match(currentWithEnd.stderr, /current role cannot have an end date/i);
  assert.notEqual(formerWithoutEnd.status, 0);
  assert.match(formerWithoutEnd.stderr, /former role requires an end date/i);
  assert.notEqual(reversedDates.status, 0);
  assert.match(reversedDates.stderr, /end date must not precede start date/i);
});

test("validate rejects unknown Home fields", async (context) => {
  const result = await validateSource(context, `${validHome}unknown: true\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[\$\.unknown\].*Unexpected key/i);
});

test("invalid content preserves the previous build output", async (context) => {
  const directory = await writeCatalog(context, validHome);
  const first = runScript(directory, buildScript);
  assert.equal(first.status, 0, first.stderr);
  const englishPath = join(directory, "dist/en/index.html");
  const portuguesePath = join(directory, "dist/pt/index.html");
  const previousEnglish = await readFile(englishPath, "utf8");
  const previousPortuguese = await readFile(portuguesePath, "utf8");
  await writeFile(
    join(directory, "content/home.yaml"),
    validHome.replace("  pt: Introdução portuguesa\n", ""),
  );

  const result = runScript(directory, buildScript);

  assert.notEqual(result.status, 0);
  assert.equal(await readFile(englishPath, "utf8"), previousEnglish);
  assert.equal(await readFile(portuguesePath, "utf8"), previousPortuguese);
});

test("ISBN import rejects an invalid checksum before network access", async (context) => {
  const directory = await writeCatalog(context, validHome);
  const result = runScript(
    directory,
    importIsbnScript,
    "9783161484101",
    "--book",
    "01a01fcd-0a4e-7c1c-9e31-8de4688c1482",
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalid ISBN-13 checksum/i);
});

test("ISBN import replaces an existing Edition without creating a duplicate", async (context) => {
  const sourceLibrary = `${validLibrary}editions:
  - id: 01a01fcd-0a4e-712c-812c-8de4688c1482
    bookId: 01a01fcd-0a4e-7c1c-9e31-8de4688c1482
    title: Old title
    language: pt-PT
    format: paperback
    publisher: Old publisher
`;
  const directory = await writeCatalog(context, validHome, sourceLibrary);
  const mods = `<?xml version="1.0"?><modsCollection xmlns="http://www.loc.gov/mods/v3"><mods><identifier type="isbn">978-972-20-4882-8</identifier><titleInfo><title>&#x98;O &#x9c;som e a fúria</title><subtitle>romance</subtitle></titleInfo><originInfo><publisher>D. Quixote</publisher><dateIssued>2012-01-01</dateIssued></originInfo><physicalDescription><extent>287 p. ; 24 cm</extent></physicalDescription></mods></modsCollection>`;
  const result = spawnSync(
    "nub",
    [
      importIsbnScript,
      "9789722048828",
      "--edition",
      "01a01fcd-0a4e-712c-812c-8de4688c1482",
      "--accept",
    ],
    {
      cwd: directory,
      encoding: "utf8",
      env: {
        ...process.env,
        ISBN_BNP_URL: `data:application/xml,${encodeURIComponent(mods)}`,
        ISBN_OPEN_LIBRARY_URL: `data:application/json,${encodeURIComponent(JSON.stringify({}))}`,
      },
    },
  );
  const library = await readFile(join(directory, "content/library.yaml"), "utf8");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /title: O som e a fúria: romance \(BNP\)/);
  assert.match(library, /pageCount: 287/);
  assert.doesNotMatch(library, /Old title|Old publisher/);
  assert.equal(library.match(/01a01fcd-0a4e-712c-812c-8de4688c1482/g)?.length, 1);
});

test("add Book prompts for its title and author, then prints its identifier", async (context) => {
  const directory = await writeCatalog(context, validHome);
  const result = spawnSync("nub", [addBookScript], {
    cwd: directory,
    encoding: "utf8",
    input: "New Book\nJane Doe\n\nyes\n",
  });
  const library = await readFile(join(directory, "content/library.yaml"), "utf8");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Created Book [0-9a-f-]{36}/);
  assert.match(library, /title: New Book/);
  assert.match(library, /displayName: Jane Doe/);
  assert.match(library, /sortValue: Jane Doe/);
});

test("ISBN import falls back, reports provenance, and atomically accepts a reviewed Edition", async (context) => {
  const directory = await writeCatalog(context, validHome);
  const environment = {
    ...process.env,
    ISBN_BNP_URL: `data:application/xml,${encodeURIComponent("<urn-response><error>Registo inexistente</error></urn-response>")}`,
    ISBN_OPEN_LIBRARY_URL: `data:application/json,${encodeURIComponent(JSON.stringify({ ISBN: "9783161484100", title: "Reviewed title", publishers: ["Example Press"], publish_date: "2024", number_of_pages: 240 }))}`,
  };

  const result = spawnSync(
    "nub",
    [
      importIsbnScript,
      "978-3-16-148410-0",
      "--book",
      "01a01fcd-0a4e-7c1c-9e31-8de4688c1482",
      "--language",
      "pt-PT",
      "--format",
      "paperback",
    ],
    { cwd: directory, encoding: "utf8", env: environment, input: "yes\n" },
  );
  const library = await readFile(join(directory, "content/library.yaml"), "utf8");

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /title: Reviewed title \(Open Library\)/);
  assert.match(result.stdout, /Accept this Edition\? \[y\/N\]/);
  assert.match(library, /title: Reviewed title/);
  assert.match(library, /isbn: "?9783161484100"?/);
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
