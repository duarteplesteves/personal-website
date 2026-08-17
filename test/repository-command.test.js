import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
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

const runValidate = (source = "content/home.yaml") =>
  spawnSync("nub", ["scripts/validate.ts", source], { encoding: "utf8" });

const validateSource = async (context, contents) => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const source = join(directory, "home.yaml");
  await writeFile(source, contents);
  return runValidate(source);
};

test("validate accepts the authored bilingual Home value", () => {
  const result = runValidate();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated bilingual Home content/);
});

test("validate rejects a missing Equivalent translation", async (context) => {
  const result = await validateSource(
    context,
    validHome.replace("  pt: Introdução portuguesa\n", ""),
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /introduction.*pt|pt.*required/i);
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

test("validate rejects oversized YAML", async (context) => {
  const result = await validateSource(context, `title: ${"x".repeat(1024 * 1024)}\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /exceeds the 1048576-byte limit/i);
});

test("validate rejects unknown Home fields", async (context) => {
  const result = await validateSource(context, `${validHome}unknown: true\n`);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unknown/i);
});
