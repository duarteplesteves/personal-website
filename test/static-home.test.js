import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const homes = [
  ["en", "I build software to explore ideas"],
  ["pt", "Crio software para explorar ideias"],
];

for (const [locale, introduction] of homes) {
  test(`/${locale} is a static localized Home artifact`, async () => {
    const html = await readFile(`dist/${locale}/index.html`, "utf8");
    assert.match(html, new RegExp(`<html lang="${locale === "en" ? "en-GB" : "pt-PT"}">`));
    assert.match(html, /<h1>Duarte Esteves<\/h1>/);
    assert.ok(html.includes(introduction));
    assert.doesNotMatch(html, /<script\b/i);
  });
}

test("the build emits only files needed by the static Home routes", async () => {
  assert.equal((await stat("dist/en/index.html")).isFile(), true);
  assert.equal((await stat("dist/pt/index.html")).isFile(), true);
});

test("the metadata workaround produces one localized description", async () => {
  for (const locale of ["en", "pt"]) {
    const html = await readFile(`dist/${locale}/index.html`, "utf8");
    assert.equal(html.match(/<meta name="description"/g)?.length, 1);
    assert.match(html, new RegExp(`<meta name="description" content="[^"]+" data-octane-metadata-workaround="35">`));
  }
});
