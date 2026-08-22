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

test("localized Home artifacts include Setup and tools and direct contact destinations", async () => {
  const localizedContent = {
    en: { setup: "Setup and tools", updated: "Updated February 2026" },
    pt: { setup: "Configuração e ferramentas", updated: "Atualizado em fevereiro de 2026" },
  };

  for (const siteLanguage of ["en", "pt"]) {
    const html = await readFile(`dist/${siteLanguage}/index.html`, "utf8");
    const expected = localizedContent[siteLanguage];

    assert.match(html, new RegExp(`<h2[^>]*>${expected.setup}</h2>`));
    assert.ok(html.includes(expected.updated));
    for (const tool of ["MacBook Pro M5 Pro", "Zed", "Ghostty", "Herdr", "Pi"]) {
      assert.ok(html.includes(`<li>${tool}</li>`), `${siteLanguage} Home must include ${tool}`);
    }
    assert.match(
      html,
      /<li>Agent-workflow resources<\/li>|<li>Recursos para fluxos de trabalho com agentes<\/li>/,
    );
    assert.match(html, /href="mailto:duarteplesteves@gmail.com"[^>]*>Email<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/duarteplesteves"[^>]*>GitHub<\/a>/);
    assert.match(
      html,
      /href="https:\/\/www\.linkedin\.com\/in\/duarteplesteves"[^>]*>LinkedIn<\/a>/,
    );
    assert.doesNotMatch(html, /<img\b/i);
  }
});

test("localized Home artifacts present active and selected work honestly", async () => {
  const localizedContent = {
    en: {
      workingOn: "Working on",
      selectedWork: "Selected work",
      betterSchedule: "Better Schedule",
      mafaldaNutri: "Mafalda Nutri",
      selectedTitles: [
        "This personal home",
        "Identity-provider operations platform",
        "Pixelmatters website",
        "Intellectual-property platform",
      ],
      betterScheduleState: "Private, unpublished",
      mafaldaNutriState: "pre-production",
    },
    pt: {
      workingOn: "A trabalhar em",
      selectedWork: "Trabalho selecionado",
      betterSchedule: "Better Schedule",
      mafaldaNutri: "Mafalda Nutri",
      selectedTitles: [
        "Esta casa pessoal",
        "Plataforma de operações de fornecedores de identidade",
        "Website da Pixelmatters",
        "Plataforma de propriedade intelectual",
      ],
      betterScheduleState: "privado e não publicado",
      mafaldaNutriState: "pré-produção",
    },
  };

  for (const siteLanguage of ["en", "pt"]) {
    const html = await readFile(`dist/${siteLanguage}/index.html`, "utf8");
    const expected = localizedContent[siteLanguage];

    assert.match(html, new RegExp(`<h2[^>]*>${expected.workingOn}</h2>`));
    assert.match(html, new RegExp(`<h2[^>]*>${expected.selectedWork}</h2>`));
    assert.ok(html.includes(expected.betterScheduleState));
    assert.ok(html.includes(expected.mafaldaNutriState));
    for (const title of [
      expected.betterSchedule,
      expected.mafaldaNutri,
      ...expected.selectedTitles,
    ]) {
      assert.match(html, new RegExp(`<h3>${title}</h3>`));
      assert.doesNotMatch(html, new RegExp(`<h3><a[^>]*>${title}</a></h3>`));
    }
  }
});

test("localized Home artifacts present derived Experience without résumé treatment", async () => {
  const localizedContent = {
    en: {
      heading: "Experience",
      entries: [
        ["Pixelmatters", "Frontend Engineer", "September 2025–present"],
        ["BEAM – Managed IT Solutions", "Frontend Developer", "June 2024–September 2025"],
        ["Bliss Applications", "Frontend Developer", "June 2022–January 2024"],
      ],
    },
    pt: {
      heading: "Experiência",
      entries: [
        ["Pixelmatters", "Engenheiro de Frontend", "setembro de 2025–presente"],
        [
          "BEAM – Managed IT Solutions",
          "Desenvolvedor de Frontend",
          "junho de 2024–setembro de 2025",
        ],
        ["Bliss Applications", "Desenvolvedor de Frontend", "junho de 2022–janeiro de 2024"],
      ],
    },
  };

  for (const siteLanguage of ["en", "pt"]) {
    const html = await readFile(`dist/${siteLanguage}/index.html`, "utf8");
    const expected = localizedContent[siteLanguage];

    assert.match(html, new RegExp(`<h2[^>]*>${expected.heading}</h2>`));
    for (const [company, role, dates] of expected.entries) {
      assert.match(html, new RegExp(`<h3>${company}</h3>`));
      assert.ok(html.includes(role));
      assert.ok(html.includes(dates));
    }
    assert.ok(html.indexOf("Pixelmatters") < html.indexOf("BEAM – Managed IT Solutions"));
    assert.ok(html.indexOf("BEAM – Managed IT Solutions") < html.indexOf("Bliss Applications"));
  }
});

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
