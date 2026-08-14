import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";

const runValidate = (source = "content/home.json") =>
  spawnSync("nub", ["scripts/validate.ts", source], { encoding: "utf8" });

test("validate accepts the authored bilingual Home value", () => {
  const result = runValidate();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated bilingual Home content/);
});

test("validate rejects a missing Equivalent translation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "personal-home-"));
  const source = join(directory, "home.json");
  const home = JSON.parse(await readFile("content/home.json", "utf8"));
  delete home.introduction.pt;
  await writeFile(source, JSON.stringify(home));

  const result = runValidate(source);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /introduction.*pt|pt.*required/i);
});
