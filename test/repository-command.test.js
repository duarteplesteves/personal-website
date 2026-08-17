import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

const runValidate = (...sources) =>
  spawnSync("nub", ["scripts/validate.ts", ...sources], { encoding: "utf8" });

const validateSource = async (context, contents) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const source = join(directory, "home.yaml");
  await writeFile(source, contents);
  return runValidate(source);
};

test("validate accepts the complete authored catalog without generating output", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const source = join(directory, "home.yaml");
  await writeFile(source, validHome);

  const result = runValidate(source);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 1 authored content source/);
  assert.deepEqual(await readdir(directory), ["home.yaml"]);
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

test("validate rejects invalid ISO partial dates", async (context) => {
  const result = await validateSource(
    context,
    validHome.replace("English description", "2025-02-30"),
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[\$\.description\.en\].*invalid ISO partial date/i);
});

test("validate rejects unsafe URLs", async (context) => {
  const result = await validateSource(
    context,
    validHome.replace("English description", "javascript:alert(1)"),
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[\$\.description\.en\].*unsafe URL/i);
});

test("validate rejects oversized YAML", async (context) => {
  const result = await validateSource(context, `title: ${"x".repeat(1024 * 1024)}\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /home\.yaml:1:1 \[\$\].*exceeds the 1048576-byte limit/i);
});

test("validation diagnostics include a stable identifier when available", async (context) => {
  const identifier = "019ce466-5f83-7000-8000-000000000036";
  const result = await validateSource(
    context,
    `items:\n  - id: ${identifier}\n    link: javascript:alert(1)\n`,
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, new RegExp(`\\(id: ${identifier}\\)`));
  assert.match(result.stderr, /\[\$\.items\[0\]\.link\].*unsafe URL/i);
});

test("validate reports every invalid source in the requested catalog", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-catalog-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const duplicateSource = join(directory, "duplicate.yaml");
  const translationSource = join(directory, "translation.yaml");
  await writeFile(duplicateSource, `${validHome}title: Another title\n`);
  await writeFile(translationSource, validHome.replace("  pt: Introdução portuguesa\n", ""));

  const result = runValidate(duplicateSource, translationSource);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate\.yaml:\d+:\d+.*keys must be unique/i);
  assert.match(
    result.stderr,
    /translation\.yaml:\d+:\d+.*Missing Portuguese Equivalent translation/i,
  );
});

test("validate rejects unknown Home fields", async (context) => {
  const result = await validateSource(context, `${validHome}unknown: true\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[\$\.unknown\].*Unexpected key/i);
});
