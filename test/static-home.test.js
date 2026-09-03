import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

const homes = [
  [
    "en",
    "Much of what I do starts with curiosity. I build software for the challenge of turning ideas into useful things, and read because books keep changing how I see the world.",
  ],
  [
    "pt",
    "Grande parte do que faço nasce da curiosidade. Crio software pelo desafio de transformar ideias em coisas úteis e leio porque os livros continuam a mudar a forma como vejo o mundo.",
  ],
];

for (const [siteLanguage, introduction] of homes) {
  test(`/${siteLanguage} is a static Home artifact in the selected Site language`, async () => {
    const html = await readFile(`dist/${siteLanguage}/index.html`, "utf8");
    assert.match(html, new RegExp(`<html lang="${siteLanguage === "en" ? "en-GB" : "pt-PT"}">`));
    assert.match(html, /<h1>Duarte Esteves<\/h1>/);
    assert.ok(html.includes(introduction));
    assert.equal(html.match(/<script>(?!\{)/g)?.length, 1);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
  });
}

test("localized Home artifacts include Setup and tools and direct contact destinations", async () => {
  const localizedContent = {
    en: { setup: "Setup and tools", updated: "Updated September 2026" },
    pt: { setup: "Configuração e ferramentas", updated: "Atualizado em setembro de 2026" },
  };

  for (const siteLanguage of ["en", "pt"]) {
    const html = await readFile(`dist/${siteLanguage}/index.html`, "utf8");
    const expected = localizedContent[siteLanguage];

    assert.match(html, new RegExp(`<h2[^>]*>${expected.setup}</h2>`));
    assert.ok(html.includes(expected.updated));
    for (const tool of ["MacBook Pro M5 Pro", "Zed", "Ghostty", "Herdr", "Pi"]) {
      assert.ok(html.includes(`<li>${tool}</li>`), `${siteLanguage} Home must include ${tool}`);
    }
    assert.match(html, /<li>Agent resources<\/li>|<li>Recursos para agentes<\/li>/);
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
      mafaldaNutri: "Mafalda Esteves Nutrição",
      selectedTitles: [
        "This site",
        "Identity-provider operations platform",
        "Pixelmatters website",
        "Intellectual-property platform",
      ],
      betterScheduleState: "scheduling rules that were harder to express than they should be",
      mafaldaNutriState: "pre-production",
      selectedPoints: [
        "I wanted a small, quiet place for my work, books, and other curiosities.",
        "I worked on interfaces for identity-provider operations",
        "pages that rarely share the same shape",
        "I joined this project knowing almost nothing about intellectual property.",
      ],
      technologies: [
        "Technologies: TypeScript, Temporal, fast-check",
        "Technologies: Next.js, Elysia, Prisma, Neon, Better Auth",
        "Technologies: Octane, Effect, Vite",
        "Technologies: TanStack, Tailwind CSS, WorkOS",
        "Technologies: Next.js, Payload CMS, Tailwind CSS, Motion",
        "Technologies: Next.js, Ant Design, Tailwind CSS",
      ],
      pixelmattersLink: "Visit the Pixelmatters website",
    },
    pt: {
      workingOn: "A trabalhar em",
      selectedWork: "Projetos selecionados",
      betterSchedule: "Better Schedule",
      mafaldaNutri: "Mafalda Esteves Nutrição",
      selectedTitles: [
        "Este site",
        "Plataforma de operações de fornecedores de identidade",
        "Site da Pixelmatters",
        "Plataforma de propriedade intelectual",
      ],
      betterScheduleState: "regras de horários e marcações mais difíceis de exprimir do que deviam",
      mafaldaNutriState: "pré-produção",
      selectedPoints: [
        "Queria um lugar pequeno e tranquilo para o meu trabalho, os meus livros e outras curiosidades.",
        "Trabalhei em interfaces para operações de fornecedores de identidade",
        "páginas que raramente têm a mesma forma",
        "Entrei neste projeto sem saber quase nada sobre propriedade intelectual.",
      ],
      technologies: [
        "Tecnologias: TypeScript, Temporal, fast-check",
        "Tecnologias: Next.js, Elysia, Prisma, Neon, Better Auth",
        "Tecnologias: Octane, Effect, Vite",
        "Tecnologias: TanStack, Tailwind CSS, WorkOS",
        "Tecnologias: Next.js, Payload CMS, Tailwind CSS, Motion",
        "Tecnologias: Next.js, Ant Design, Tailwind CSS",
      ],
      pixelmattersLink: "Visitar o site da Pixelmatters",
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
    for (const point of expected.selectedPoints) {
      assert.ok(html.includes(point));
    }
    for (const technologies of expected.technologies) {
      assert.ok(html.includes(technologies));
    }
    assert.ok(
      html.includes(`<a href="https://www.pixelmatters.com/">${expected.pixelmattersLink}</a>`),
    );
  }
});

test("localized Home artifacts present derived Experience without résumé treatment", async () => {
  const localizedContent = {
    en: {
      heading: "Experience",
      entries: [
        ["Pixelmatters", "Frontend Engineer", "September 2025–present"],
        ["BEAM – Managed IT Solutions", "Frontend Engineer", "June 2024–September 2025"],
        ["Bliss Applications", "Frontend Engineer", "June 2022–January 2024"],
      ],
    },
    pt: {
      heading: "Experiência",
      entries: [
        ["Pixelmatters", "Engenheiro frontend", "setembro de 2025–presente"],
        ["BEAM – Managed IT Solutions", "Engenheiro frontend", "junho de 2024–setembro de 2025"],
        ["Bliss Applications", "Engenheiro frontend", "junho de 2022–janeiro de 2024"],
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
    en: "Software, work, books, and tools from Duarte Esteves.",
    pt: "Software, trabalho, livros e ferramentas de Duarte Esteves.",
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
