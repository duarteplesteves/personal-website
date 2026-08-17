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
    assert.doesNotMatch(html, /<script\b/i);
  });
}

test("the build emits only files needed by the static Home routes", async () => {
  assert.equal((await stat("dist/en/index.html")).isFile(), true);
  assert.equal((await stat("dist/pt/index.html")).isFile(), true);
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
