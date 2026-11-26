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

test("localized Home artifacts present one ordered Work section", async () => {
  const localizedContent = {
    en: {
      heading: "Work",
      formerHeadings: /^(Working on|Selected work)$/,
      experienceHeading: "Experience",
      detailedEntryTitles: [
        "This site",
        "Identity-provider operations platform",
        "Pixelmatters website",
        "Intellectual-property platform",
      ],
      fastiSummary:
        "I’m building fasti, an open-source TypeScript library for adding bookings to an application. It finds available times and handles booking, rescheduling and cancellation using the application’s own database.",
      fastiLink: "View fasti on GitHub",
      mafaldaSummary:
        "I designed and built this private platform for a nutrition practice, from the interface to the database. The team uses it to manage patient records, write clinical notes and book appointments.",
      detailedEntryPoints: [
        "I wanted a small, quiet place for my work, books, and other curiosities.",
        "I worked on interfaces for identity-provider operations",
        "pages that rarely share the same shape",
        "I joined this project knowing almost nothing about intellectual property.",
      ],
      technologies: [
        "Technologies: Octane, Effect, Vite",
        "Technologies: TanStack, Tailwind CSS, WorkOS",
        "Technologies: Next.js, Payload CMS, Tailwind CSS, Motion",
        "Technologies: Next.js, Ant Design, Tailwind CSS",
      ],
      pixelmattersLink: "Visit the Pixelmatters website",
    },
    pt: {
      heading: "Trabalho",
      formerHeadings: /^(A trabalhar em|Projetos selecionados)$/,
      experienceHeading: "Experiência",
      detailedEntryTitles: [
        "Este site",
        "Plataforma de operações de fornecedores de identidade",
        "Site da Pixelmatters",
        "Plataforma de propriedade intelectual",
      ],
      fastiSummary:
        "Estou a desenvolver o fasti, uma biblioteca de código aberto em TypeScript para integrar marcações numa aplicação. Permite consultar a disponibilidade, fazer e remarcar marcações ou cancelá-las, usando a base de dados da própria aplicação.",
      fastiLink: "Ver o fasti no GitHub",
      mafaldaSummary:
        "Concebi e desenvolvi esta plataforma privada para uma prática de nutrição, da interface à base de dados. A equipa usa-a no dia a dia para gerir fichas de pacientes, registar notas clínicas e marcar consultas.",
      detailedEntryPoints: [
        "Queria um lugar pequeno e tranquilo para o meu trabalho, os meus livros e outras curiosidades.",
        "Trabalhei em interfaces para operações de fornecedores de identidade",
        "páginas que raramente têm a mesma forma",
        "Entrei neste projeto sem saber quase nada sobre propriedade intelectual.",
      ],
      technologies: [
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

    const headings = [...html.matchAll(/<h2\b[^>]*>(.*?)<\/h2>/g)].map((match) => match[1]);
    assert.equal(headings.filter((heading) => heading === expected.heading).length, 1);
    assert.ok(headings.every((heading) => !expected.formerHeadings.test(heading)));
    assert.equal(headings[headings.indexOf(expected.heading) + 1], expected.experienceHeading);

    const work = html.match(
      new RegExp(`<section\\b[^>]*>\\s*<h2\\b[^>]*>${expected.heading}</h2>[\\s\\S]*?</section>`),
    )?.[0];
    assert.ok(work, `${siteLanguage} Home must have a Work section`);
    assert.doesNotMatch(
      work,
      /<(?:template|noscript|script)\b|<[^>]+\s(?:hidden|inert)(?=[\s=>])/i,
    );
    const titles = ["fasti", "Mafalda Esteves Nutrição", ...expected.detailedEntryTitles];
    assert.deepEqual(
      [...work.matchAll(/<h3\b[^>]*>(.*?)<\/h3>/g)].map((match) => match[1]),
      titles,
    );
    const homeEntryHeadings = [...html.matchAll(/<h3\b[^>]*>(.*?)<\/h3>/g)].map(
      (match) => match[1],
    );
    assert.deepEqual(
      homeEntryHeadings.filter((heading) => titles.includes(heading)),
      titles,
    );

    const [fasti, mafalda] = [...work.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(
      (match) => match[1],
    );
    const fastiLink = `<a href="https://github.com/duarteplesteves/fasti">${expected.fastiLink}</a>`;
    const paragraphs = (entry) =>
      [...entry.matchAll(/<p\b[^>]*>(.*?)<\/p>/g)].map((match) => match[1]);
    assert.deepEqual(paragraphs(fasti), [expected.fastiSummary, fastiLink]);
    assert.deepEqual(paragraphs(mafalda), [expected.mafaldaSummary]);
    assert.doesNotMatch(mafalda, /<a\b/);
    for (const point of expected.detailedEntryPoints) {
      assert.ok(work.includes(point));
    }
    for (const technologies of expected.technologies) {
      assert.ok(work.includes(technologies));
    }
    assert.ok(
      work.includes(`<a href="https://www.pixelmatters.com/">${expected.pixelmattersLink}</a>`),
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
