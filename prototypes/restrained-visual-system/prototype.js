/* PROTOTYPE ONLY — intentionally dependency-free and disposable. */

const variants = [
  { key: "A", name: "Editorial index" },
  { key: "B", name: "Split narrative" },
  { key: "C", name: "Personal ledger" },
];

const copy = {
  en: {
    documentTitle: "Duarte Esteves — personal home prototype",
    skip: "Skip to content",
    prototypeEyebrow: "Visual-system prototype · representative content",
    nav: { home: "Home", library: "Library" },
    intro: "I’m Duarte, a software engineer curious about ideas, problems, and the many shapes a thoughtful solution can take.",
    introAside: "I work through software, read across disciplines, and keep this small corner of the web as a record of what currently holds my attention.",
    workingOn: "Working on",
    workingIntro: "Independent work that is active, useful, and still taking shape.",
    selectedWork: "Selected Work",
    selectedIntro: "A few problems I can discuss honestly, focused on my contribution rather than project theatre.",
    experience: "Experience",
    experienceIntro: "Company contexts and responsibilities, kept concise where the useful story belongs above.",
    library: "From the Library",
    libraryIntro: "A small view of present reading, enduring taste, and future curiosity.",
    viewLibrary: "Browse the complete Library",
    currentlyReading: "Currently reading",
    favourites: "Favorites",
    nextReads: "Next reads",
    setup: "Setup and tools",
    setupIntro: "A dated snapshot of what I currently rely on—not a recommendation list.",
    updated: "Updated August 2026",
    setupGroup: "Setup",
    toolsGroup: "Tools",
    contact: "Elsewhere",
    contactIntro: "The simplest way to reach me is email. You can also find my code and work history elsewhere.",
    sampleNote: "Representative prototype copy; book choices and summaries are not publication claims.",
    work: [
      { name: "Better Schedule", meta: "Independent · in progress", text: "Exploring a calmer way to understand and adjust changing schedules." },
      { name: "Mafalda Nutri", meta: "Independent · pre-production", text: "A focused workflow for preparing bilingual nutrition plans from consultation notes." },
    ],
    selected: [
      { name: "Identity operations platform", meta: "Pixelmatters · client anonymised", text: "Helped shape and deliver an internal platform for high-stakes identity-provider operations, balancing complex workflows with safe, legible interfaces." },
      { name: "Pixelmatters website", meta: "Pixelmatters · public work", text: "Contributed engineering craft to public-facing pages where performance, editorial flexibility, and close design collaboration mattered." },
      { name: "Intellectual-property platform", meta: "BEAM · client anonymised", text: "Worked within a team on a greenfield product, turning an unfamiliar domain into maintainable product flows without overstating certainty." },
    ],
    experienceItems: [
      { company: "Pixelmatters", period: "Current chapter", role: "Software engineering across product and public web work." },
      { company: "BEAM — Managed IT Solutions", period: "Earlier chapter", role: "Product engineering in greenfield and client contexts." },
      { company: "Bliss Applications", period: "First chapter", role: "Software delivery for complex digital commerce and event experiences." },
    ],
    shelves: [
      { label: "Currently reading", books: ["The Beginning of Infinity — David Deutsch"] },
      { label: "Favorites", books: ["The Timeless Way of Building — Christopher Alexander", "How to Take Smart Notes — Sönke Ahrens", "The Design of Everyday Things — Don Norman"] },
      { label: "Next reads", books: ["Finite and Infinite Games — James P. Carse", "The WEIRDest People in the World — Joseph Henrich"] },
    ],
    setupItems: ["MacBook Pro M5 Pro", "Zed", "Ghostty"],
    toolItems: ["Herdr", "Pi", "Agent workflow resources"],
    links: ["Email", "GitHub", "LinkedIn"],
    labels: { context: "Context", contribution: "Contribution", status: "Status", chapter: "Chapter" },
  },
  pt: {
    documentTitle: "Duarte Esteves — protótipo da casa pessoal",
    skip: "Saltar para o conteúdo",
    prototypeEyebrow: "Protótipo do sistema visual · conteúdo representativo",
    nav: { home: "Início", library: "Biblioteca" },
    intro: "Sou o Duarte, engenheiro de software curioso sobre ideias, problemas e as muitas formas que uma solução cuidada pode assumir.",
    introAside: "Trabalho através de software, leio sobre várias disciplinas e mantenho este pequeno canto da web como registo do que prende a minha atenção neste momento.",
    workingOn: "Em curso",
    workingIntro: "Trabalho independente que está ativo, é útil e continua a ganhar forma.",
    selectedWork: "Trabalho selecionado",
    selectedIntro: "Alguns problemas sobre os quais posso falar com honestidade, centrados no meu contributo e não no espetáculo do projeto.",
    experience: "Experiência",
    experienceIntro: "Contextos e responsabilidades em empresas, de forma concisa quando a história útil já está acima.",
    library: "Da Biblioteca",
    libraryIntro: "Um pequeno retrato das leituras atuais, dos gostos duradouros e da curiosidade futura.",
    viewLibrary: "Explorar a Biblioteca completa",
    currentlyReading: "A ler",
    favourites: "Favoritos",
    nextReads: "Próximas leituras",
    setup: "Setup e ferramentas",
    setupIntro: "Um retrato datado daquilo em que me apoio atualmente — não uma lista de recomendações.",
    updated: "Atualizado em agosto de 2026",
    setupGroup: "Setup",
    toolsGroup: "Ferramentas",
    contact: "Noutros lugares",
    contactIntro: "A forma mais simples de falar comigo é por email. O meu código e percurso profissional também estão disponíveis noutros lugares.",
    sampleNote: "Texto representativo para o protótipo; os livros e resumos não são afirmações para publicação.",
    work: [
      { name: "Better Schedule", meta: "Independente · em curso", text: "A explorar uma forma mais calma de compreender e ajustar horários em mudança." },
      { name: "Mafalda Nutri", meta: "Independente · pré-produção", text: "Um fluxo focado na preparação de planos alimentares bilingues a partir de notas de consulta." },
    ],
    selected: [
      { name: "Plataforma de operações de identidade", meta: "Pixelmatters · cliente anonimizado", text: "Ajudei a definir e entregar uma plataforma interna para operações críticas com fornecedores de identidade, equilibrando fluxos complexos com interfaces seguras e legíveis." },
      { name: "Website da Pixelmatters", meta: "Pixelmatters · trabalho público", text: "Contribuí com engenharia cuidada para páginas públicas onde o desempenho, a flexibilidade editorial e a colaboração próxima com design eram essenciais." },
      { name: "Plataforma de propriedade intelectual", meta: "BEAM · cliente anonimizado", text: "Trabalhei em equipa num produto de raiz, transformando um domínio desconhecido em fluxos sustentáveis sem exagerar certezas." },
    ],
    experienceItems: [
      { company: "Pixelmatters", period: "Capítulo atual", role: "Engenharia de software em produto e experiências web públicas." },
      { company: "BEAM — Managed IT Solutions", period: "Capítulo anterior", role: "Engenharia de produto em contextos de raiz e de cliente." },
      { company: "Bliss Applications", period: "Primeiro capítulo", role: "Entrega de software para comércio digital complexo e experiências de eventos." },
    ],
    shelves: [
      { label: "A ler", books: ["The Beginning of Infinity — David Deutsch"] },
      { label: "Favoritos", books: ["The Timeless Way of Building — Christopher Alexander", "How to Take Smart Notes — Sönke Ahrens", "The Design of Everyday Things — Don Norman"] },
      { label: "Próximas leituras", books: ["Finite and Infinite Games — James P. Carse", "The WEIRDest People in the World — Joseph Henrich"] },
    ],
    setupItems: ["MacBook Pro M5 Pro", "Zed", "Ghostty"],
    toolItems: ["Herdr", "Pi", "Recursos para fluxos com agentes"],
    links: ["Email", "GitHub", "LinkedIn"],
    labels: { context: "Contexto", contribution: "Contributo", status: "Estado", chapter: "Capítulo" },
  },
};

function currentState() {
  const params = new URLSearchParams(window.location.search);
  const requestedVariant = (params.get("variant") || "A").toUpperCase();
  return {
    variant: variants.some(({ key }) => key === requestedVariant) ? requestedVariant : "A",
    lang: params.get("lang") === "pt" ? "pt" : "en",
  };
}

function updateState(next) {
  const params = new URLSearchParams(window.location.search);
  params.set("variant", next.variant);
  params.set("lang", next.lang);
  window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
  render();
}

function localeControl(lang) {
  const next = lang === "en" ? "pt" : "en";
  const label = lang === "en" ? "Português" : "English";
  return `<button class="locale-control" type="button" data-language="${next}">${label}</button>`;
}

function headerNavigation(t, lang, className = "site-header") {
  return `
    <header class="${className}">
      <a class="identity" href="#top" aria-label="Duarte Esteves — ${t.nav.home}">Duarte Esteves</a>
      <nav aria-label="Primary navigation">
        <a href="#top" aria-current="page">${t.nav.home}</a>
        <a href="#library">${t.nav.library}</a>
        ${localeControl(lang)}
      </nav>
    </header>`;
}

function workingRows(t, mode = "rows") {
  return t.work.map((item, index) => `
    <article class="work-item ${mode}">
      <div class="item-heading"><span class="item-index">0${index + 1}</span><h3>${item.name}</h3></div>
      <p class="item-meta">${item.meta}</p>
      <p>${item.text}</p>
    </article>`).join("");
}

function selectedRows(t, mode = "rows") {
  return t.selected.map((item, index) => `
    <a class="selected-item ${mode}" href="#selected-work" aria-label="${item.name}">
      <span class="item-index">0${index + 1}</span>
      <span class="selected-copy"><strong>${item.name}</strong><span>${item.text}</span></span>
      <span class="item-meta">${item.meta}</span>
      <span class="link-arrow" aria-hidden="true">↗</span>
    </a>`).join("");
}

function experienceRows(t) {
  return t.experienceItems.map((item) => `
    <article class="experience-item">
      <p class="item-meta">${item.period}</p>
      <h3>${item.company}</h3>
      <p>${item.role}</p>
    </article>`).join("");
}

function shelfGroups(t) {
  return t.shelves.map((shelf) => `
    <section class="shelf">
      <h3>${shelf.label}</h3>
      <ul>${shelf.books.map((book) => `<li><a href="#library">${book}</a></li>`).join("")}</ul>
    </section>`).join("");
}

function setupGroups(t) {
  return `
    <div class="setup-group"><h3>${t.setupGroup}</h3><p>${t.setupItems.join(" · ")}</p></div>
    <div class="setup-group"><h3>${t.toolsGroup}</h3><p>${t.toolItems.join(" · ")}</p></div>`;
}

function footer(t) {
  return `
    <footer id="contact">
      <div><p class="section-label">${t.contact}</p><p>${t.contactIntro}</p></div>
      <nav aria-label="Contact links">${t.links.map((link) => `<a href="#contact">${link}<span aria-hidden="true">↗</span></a>`).join("")}</nav>
    </footer>`;
}

function renderVariantA(t, lang) {
  return `
    <div class="variant variant-a" id="top">
      ${headerNavigation(t, lang)}
      <main id="main">
        <header class="intro">
          <p class="prototype-eyebrow">${t.prototypeEyebrow}</p>
          <h1>${t.intro}</h1>
          <p>${t.introAside}</p>
        </header>

        <section id="working-on" class="section-block">
          <div class="section-heading"><h2>${t.workingOn}</h2><p>${t.workingIntro}</p></div>
          <div class="content-list">${workingRows(t)}</div>
        </section>

        <section id="selected-work" class="section-block">
          <div class="section-heading"><h2>${t.selectedWork}</h2><p>${t.selectedIntro}</p></div>
          <div class="content-list">${selectedRows(t)}</div>
        </section>

        <section id="experience" class="section-block">
          <div class="section-heading"><h2>${t.experience}</h2><p>${t.experienceIntro}</p></div>
          <div class="experience-list">${experienceRows(t)}</div>
        </section>

        <section id="library" class="section-block library-block">
          <div class="section-heading"><h2>${t.library}</h2><p>${t.libraryIntro}</p></div>
          <div class="shelf-list">${shelfGroups(t)}</div>
          <a class="text-link" href="#library">${t.viewLibrary}<span aria-hidden="true"> →</span></a>
          <p class="sample-note">${t.sampleNote}</p>
        </section>

        <section id="setup" class="section-block setup-block">
          <div class="section-heading"><h2>${t.setup}</h2><p>${t.setupIntro}</p><p class="item-meta">${t.updated}</p></div>
          <div class="setup-list">${setupGroups(t)}</div>
        </section>
      </main>
      ${footer(t)}
    </div>`;
}

function renderVariantB(t, lang) {
  return `
    <div class="variant variant-b" id="top">
      <aside class="side-rail">
        <a class="identity" href="#top">Duarte<br />Esteves</a>
        <nav aria-label="Section navigation">
          <a href="#working-on">${t.workingOn}</a>
          <a href="#selected-work">${t.selectedWork}</a>
          <a href="#experience">${t.experience}</a>
          <a href="#library">${t.nav.library}</a>
          <a href="#setup">${t.setup}</a>
        </nav>
        ${localeControl(lang)}
      </aside>

      <div class="narrative-pane">
        <main id="main">
          <header class="intro">
            <p class="prototype-eyebrow">${t.prototypeEyebrow}</p>
            <h1>${t.intro}</h1>
            <p>${t.introAside}</p>
          </header>

          <section id="working-on" class="split-section active-work">
            <header><p class="section-number">01</p><h2>${t.workingOn}</h2><p>${t.workingIntro}</p></header>
            <div>${workingRows(t, "panels")}</div>
          </section>

          <section id="selected-work" class="split-section selected-feature">
            <header><p class="section-number">02</p><h2>${t.selectedWork}</h2><p>${t.selectedIntro}</p></header>
            <div>${selectedRows(t, "features")}</div>
          </section>

          <section id="experience" class="split-section experience-feature">
            <header><p class="section-number">03</p><h2>${t.experience}</h2><p>${t.experienceIntro}</p></header>
            <div class="experience-list">${experienceRows(t)}</div>
          </section>

          <section id="library" class="library-feature">
            <header><p class="section-number">04</p><h2>${t.library}</h2><p>${t.libraryIntro}</p></header>
            <div class="shelf-list">${shelfGroups(t)}</div>
            <a class="text-link" href="#library">${t.viewLibrary}<span aria-hidden="true"> →</span></a>
            <p class="sample-note">${t.sampleNote}</p>
          </section>

          <section id="setup" class="split-section setup-feature">
            <header><p class="section-number">05</p><h2>${t.setup}</h2><p>${t.setupIntro}</p><p class="item-meta">${t.updated}</p></header>
            <div class="setup-list">${setupGroups(t)}</div>
          </section>
        </main>
        ${footer(t)}
      </div>
    </div>`;
}

function renderVariantC(t, lang) {
  const libraryRows = t.shelves.map((shelf, index) => `
    <div class="ledger-row shelf-row">
      <span class="ledger-code">L${index + 1}</span>
      <h3>${shelf.label}</h3>
      <ul>${shelf.books.map((book) => `<li><a href="#library">${book}</a></li>`).join("")}</ul>
    </div>`).join("");
  const workRows = t.work.map((item, index) => `
    <div class="ledger-row">
      <span class="ledger-code">W${index + 1}</span>
      <div><h3>${item.name}</h3><p class="item-meta">${item.meta}</p></div>
      <p>${item.text}</p>
      <span class="status-dot">●</span>
    </div>`).join("");
  const selected = t.selected.map((item, index) => `
    <a class="ledger-row" href="#selected-work">
      <span class="ledger-code">S${index + 1}</span>
      <div><h3>${item.name}</h3><p class="item-meta">${item.meta}</p></div>
      <p>${item.text}</p>
      <span aria-hidden="true">↗</span>
    </a>`).join("");
  const experience = t.experienceItems.map((item, index) => `
    <div class="ledger-row">
      <span class="ledger-code">E${index + 1}</span>
      <div><h3>${item.company}</h3><p class="item-meta">${item.period}</p></div>
      <p>${item.role}</p>
      <span>—</span>
    </div>`).join("");

  return `
    <div class="variant variant-c" id="top">
      <header class="ledger-header">
        <a class="identity" href="#top">D/E</a>
        <p>Duarte Esteves<br /><span>Personal home / 2026</span></p>
        <nav aria-label="Primary navigation"><a href="#top" aria-current="page">${t.nav.home}</a><a href="#library">${t.nav.library}</a>${localeControl(lang)}</nav>
      </header>
      <main id="main">
        <header class="ledger-intro">
          <p class="prototype-eyebrow">${t.prototypeEyebrow}</p>
          <h1>${t.intro}</h1>
          <p>${t.introAside}</p>
        </header>

        <section id="working-on" class="ledger-section">
          <header><span>01</span><h2>${t.workingOn}</h2><p>${t.workingIntro}</p></header>
          ${workRows}
        </section>

        <section id="selected-work" class="ledger-section">
          <header><span>02</span><h2>${t.selectedWork}</h2><p>${t.selectedIntro}</p></header>
          ${selected}
        </section>

        <section id="experience" class="ledger-section">
          <header><span>03</span><h2>${t.experience}</h2><p>${t.experienceIntro}</p></header>
          ${experience}
        </section>

        <section id="library" class="ledger-section ledger-library">
          <header><span>04</span><h2>${t.library}</h2><p>${t.libraryIntro}</p></header>
          ${libraryRows}
          <div class="ledger-action"><a href="#library">${t.viewLibrary} ↗</a><small>${t.sampleNote}</small></div>
        </section>

        <section id="setup" class="ledger-section ledger-setup">
          <header><span>05</span><h2>${t.setup}</h2><p>${t.updated}</p></header>
          <div class="ledger-row"><span class="ledger-code">H1</span><h3>${t.setupGroup}</h3><p>${t.setupItems.join(" / ")}</p><span>—</span></div>
          <div class="ledger-row"><span class="ledger-code">T1</span><h3>${t.toolsGroup}</h3><p>${t.toolItems.join(" / ")}</p><span>—</span></div>
        </section>
      </main>
      ${footer(t)}
    </div>`;
}

function render() {
  const state = currentState();
  const t = copy[state.lang];
  const renderers = { A: renderVariantA, B: renderVariantB, C: renderVariantC };
  document.documentElement.lang = state.lang === "pt" ? "pt-PT" : "en-GB";
  document.title = t.documentTitle;
  document.querySelector(".skip-link").textContent = t.skip;
  document.getElementById("prototype").innerHTML = renderers[state.variant](t, state.lang);

  const variant = variants.find(({ key }) => key === state.variant);
  const route = state.lang === "pt" ? "/pt" : "/en";
  document.getElementById("variant-state").innerHTML = `<strong>${variant.key} — ${variant.name}</strong><span>${route} · PROTOTYPE</span>`;
}

function cycle(direction) {
  const state = currentState();
  const index = variants.findIndex(({ key }) => key === state.variant);
  const delta = direction === "next" ? 1 : -1;
  const next = variants[(index + delta + variants.length) % variants.length];
  updateState({ ...state, variant: next.key });
}

document.addEventListener("click", (event) => {
  const directionButton = event.target.closest("[data-direction]");
  if (directionButton) cycle(directionButton.dataset.direction);

  const languageButton = event.target.closest("[data-language]");
  if (languageButton) updateState({ ...currentState(), lang: languageButton.dataset.language });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (event.target.matches("input, textarea, [contenteditable]")) return;
  event.preventDefault();
  cycle(event.key === "ArrowRight" ? "next" : "previous");
});

window.addEventListener("popstate", render);
render();
