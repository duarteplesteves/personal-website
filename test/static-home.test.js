import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const homes = [
  ["en", "I build software to explore ideas"],
  ["pt", "Crio software para explorar ideias"],
];

for (const [siteLanguage, introduction] of homes) {
  test(`/${siteLanguage} is a static Home artifact in the selected Site language`, async () => {
    const html = await readFile(`dist/${siteLanguage}/index.html`, "utf8");
    assert.match(html, new RegExp(`<html lang="${siteLanguage === "en" ? "en-GB" : "pt-PT"}">`));
    assert.match(html, /<h1>Duarte Esteves<\/h1>/);
    assert.ok(html.includes(introduction));
    assert.equal(html.match(/<script\b/g)?.length, 1);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
  });
}

test("the build emits the root and localized Home and Library routes", async () => {
  for (const file of [
    "dist/index.html",
    "dist/en/index.html",
    "dist/pt/index.html",
    "dist/en/library/index.html",
    "dist/pt/library/index.html",
  ]) {
    assert.equal((await stat(file)).isFile(), true);
  }
});

test("Octane places Home metadata in the document head for each Site language", async () => {
  const descriptions = {
    en: "Duarte Esteves explores software, ideas, learning, and reading.",
    pt: "Duarte Esteves explora software, ideias, aprendizagem e leitura.",
  };

  for (const siteLanguage of ["en", "pt"]) {
    const html = await readFile(`dist/${siteLanguage}/index.html`, "utf8");
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];

    assert.ok(head, "the Home document must contain a head");
    assert.match(head, /<title>Duarte Esteves<\/title>/);
    assert.equal(html.match(/<meta name="description"/g)?.length, 1);
    assert.ok(head.includes(`<meta name="description" content="${descriptions[siteLanguage]}">`));
    assert.doesNotMatch(html, /data-octane-hoisted/);
  }
});
