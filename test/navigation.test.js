import { readFile } from "node:fs/promises";
import vm from "node:vm";
import assert from "node:assert/strict";
import test from "node:test";

const readArtifact = (path) => readFile(`dist${path}`, "utf8");

const inlineScript = (html) => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1, "expected one inline enhancement script");
  return scripts[0][1];
};

const rootDestinations = [
  { saved: "pt", languages: ["en-GB"], expected: "/pt" },
  { saved: "en", languages: ["pt-PT"], expected: "/en" },
  { saved: null, languages: ["fr-FR", "pt-BR", "en-US"], expected: "/pt" },
  { saved: null, languages: ["fr-FR", "en-US", "pt-PT"], expected: "/en" },
  { saved: null, languages: ["fr-FR"], expected: "/en" },
];

test("the root remains a bilingual chooser without JavaScript", async () => {
  const html = await readArtifact("/index.html");

  assert.match(html, /<html lang="en">/);
  assert.match(html, /href="\/pt"[^>]*>Português<\/a>/);
  assert.match(html, /href="\/en"[^>]*>English<\/a>/);
  assert.match(html, /Escolha o idioma/);
  assert.match(html, /Choose a language/);
});

for (const { saved, languages, expected } of rootDestinations) {
  test(`the enhanced root chooses ${expected} for saved=${saved ?? "none"}, languages=${languages.join(",")}`, async () => {
    const html = await readArtifact("/index.html");
    let destination;
    const context = {
      localStorage: { getItem: () => saved },
      navigator: { languages },
      location: { replace: (value) => (destination = value) },
    };

    vm.runInNewContext(inlineScript(html), context);

    assert.equal(destination, expected);
  });
}

const localizedRoutes = [
  {
    path: "/en/index.html",
    language: "en-GB",
    home: "/en",
    library: "/en/library",
    equivalent: "/pt",
    currentLanguage: "English",
    alternateLanguage: "Português",
  },
  {
    path: "/pt/index.html",
    language: "pt-PT",
    home: "/pt",
    library: "/pt/library",
    equivalent: "/en",
    currentLanguage: "Português",
    alternateLanguage: "English",
  },
  {
    path: "/en/library/index.html",
    language: "en-GB",
    home: "/en",
    library: "/en/library",
    equivalent: "/pt/library",
    currentLanguage: "English",
    alternateLanguage: "Português",
  },
  {
    path: "/pt/library/index.html",
    language: "pt-PT",
    home: "/pt",
    library: "/pt/library",
    equivalent: "/en/library",
    currentLanguage: "Português",
    alternateLanguage: "English",
  },
];

for (const route of localizedRoutes) {
  test(`${route.path} has localized navigation and an Equivalent translation`, async () => {
    const html = await readArtifact(route.path);

    assert.match(html, new RegExp(`<html lang="${route.language}">`));
    assert.ok(html.includes(`href="${route.home}"`));
    assert.ok(html.includes(`href="${route.library}"`));
    assert.ok(html.includes(`>${route.currentLanguage}</span>`));
    assert.ok(html.includes(`href="${route.equivalent}"`));
    assert.ok(html.includes(`>${route.alternateLanguage}</a>`));
  });
}

test("the language control saves the explicit choice and preserves Library query state", async () => {
  const html = await readArtifact("/en/library/index.html");
  const listeners = new Map();
  const control = {
    href: "https://example.test/pt/library",
    dataset: { siteLanguage: "pt" },
    addEventListener: (name, listener) => listeners.set(name, listener),
  };
  let saved;
  const context = {
    document: { querySelector: () => control },
    localStorage: { setItem: (key, value) => (saved = [key, value]) },
    location: {
      href: "https://example.test/en/library?q=effect&show=read",
      search: "?q=effect&show=read",
    },
    URL,
  };

  vm.runInNewContext(inlineScript(html), context);
  assert.equal(saved, undefined, "opening an explicit localized URL must not change preference");

  listeners.get("click")();

  assert.deepEqual(saved, ["site-language", "pt"]);
  assert.equal(control.href, "https://example.test/pt/library?q=effect&show=read");
});
