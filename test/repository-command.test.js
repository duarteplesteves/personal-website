import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
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

const validateScript = join(dirname(fileURLToPath(import.meta.url)), "../scripts/validate.ts");

const runValidate = (directory, ...sources) =>
  spawnSync("nub", [validateScript, ...sources], { cwd: directory, encoding: "utf8" });

const writeCatalog = async (context, contents) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "content"));
  await writeFile(join(directory, "content/home.yaml"), contents);
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
  assert.match(result.stdout, /Validated 1 authored content source/);
  assert.deepEqual(await readdir(join(directory, "content")), ["home.yaml"]);
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
