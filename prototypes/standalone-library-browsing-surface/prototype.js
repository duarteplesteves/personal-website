/* PROTOTYPE ONLY — dependency-free, disposable, and intentionally not production architecture. */

const variants = [
  { key: "A", name: "Continuous index" },
  { key: "B", name: "Browsing rail" },
  { key: "C", name: "Alphabetical register" },
];

const copy = {
  en: {
    documentTitle: "Duarte Esteves — Library prototype",
    skip: "Skip to content",
    nav: { home: "Home", library: "Library" },
    title: "Library",
    introduction: "Books I have read, am reading, or want to keep close. This is one evolving Library rather than a set of shelves, with short Reflections only when I have something worth adding.",
    current: "Currently reading",
    controls: "Browse the Library",
    search: "Search",
    searchPlaceholder: "Title, alternate title, or author",
    clearSearch: "Clear search",
    show: "Show",
    order: "Order by",
    views: { all: "All", read: "Read", favorites: "Favorites", next: "Next reads", collection: "In collection" },
    orders: { title: "Title", author: "Author" },
    books: "Books",
    book: "Book",
    relationships: { reading: "Currently reading", read: "Read", readTwice: "Read twice", favorite: "Favorite", next: "Next read", collection: "In collection" },
    noResults: ({ view, query }) => query
      ? `No Books${view === "all" ? "" : ` in ${copy.en.views[view]}`} match “${query}”.`
      : `There are no Books in ${copy.en.views[view]}.`,
    showAll: "Show all Books",
    prototypeNote: "* Representative Reflection or relationship state used to stress-test the layout; not publication content.",
    locale: "Português",
    count: (shown, total, narrowed) => `${narrowed ? `${shown} of ` : ""}${total} ${total === 1 ? "Book" : "Books"}`,
  },
  pt: {
    documentTitle: "Duarte Esteves — protótipo da Biblioteca",
    skip: "Saltar para o conteúdo",
    nav: { home: "Início", library: "Biblioteca" },
    title: "Biblioteca",
    introduction: "Livros que li, que estou a ler ou que quero manter por perto. Esta é uma Biblioteca em evolução, não um conjunto de estantes, com pequenas Reflexões apenas quando tenho algo que vale a pena acrescentar.",
    current: "A ler atualmente",
    controls: "Explorar a Biblioteca",
    search: "Pesquisar",
    searchPlaceholder: "Título, título alternativo ou autor",
    clearSearch: "Limpar pesquisa",
    show: "Mostrar",
    order: "Ordenar por",
    views: { all: "Todos", read: "Lidos", favorites: "Favoritos", next: "Próximas leituras", collection: "Na coleção" },
    orders: { title: "Título", author: "Autor" },
    books: "Livros",
    book: "Livro",
    relationships: { reading: "A ler atualmente", read: "Lido", readTwice: "Lido duas vezes", favorite: "Favorito", next: "Próxima leitura", collection: "Na coleção" },
    noResults: ({ view, query }) => query
      ? `Nenhum Livro${view === "all" ? "" : ` em ${copy.pt.views[view]}`} corresponde a “${query}”.`
      : `Não há Livros em ${copy.pt.views[view]}.`,
    showAll: "Mostrar todos os Livros",
    prototypeNote: "* Reflexão ou relação representativa para testar o limite do layout; não é conteúdo para publicação.",
    locale: "English",
    count: (shown, total, narrowed) => `${narrowed ? `${shown} de ` : ""}${total} ${total === 1 ? "Livro" : "Livros"}`,
  },
};

const alternateTitles = {
  "A Metamorfose": ["Metamorphosis", "Die Verwandlung"],
  "Crime e Castigo": ["Crime and Punishment", "Prestupleniye i nakazaniye"],
  "O Som e a Fúria": ["The Sound and the Fury"],
  "Ensaio Sobre a Cegueira": ["Blindness"],
};

const reflections = {
  "A Máquina de Fazer Espanhóis": {
    date: "2025",
    en: "A representative note about the tension between belonging and losing oneself inside the stories a country tells. Long enough to test how a Reflection changes the rhythm of an otherwise compact record without making every Book look unfinished.",
    pt: "Uma nota representativa sobre a tensão entre pertencer e perdermo-nos dentro das histórias que um país conta. É deliberadamente longa para testar como uma Reflexão altera o ritmo de um registo compacto sem fazer com que todos os outros Livros pareçam incompletos.",
  },
  "Crime e Castigo": {
    date: "2024",
    en: "A short representative Reflection about self-justification and consequence.",
    pt: "Uma Reflexão breve e representativa sobre autojustificação e consequência.",
  },
  "Design as Art": {
    date: "2023",
    en: "Representative note: useful objects reveal the values behind their making.",
    pt: "Nota representativa: os objetos úteis revelam os valores por detrás da sua criação.",
  },
  "O pintor debaixo do lava-loiças": {
    date: "2025",
    en: "A representative response that runs longer in English to test unequal Equivalent translations and the point at which an inline note begins to compete with the title-and-author scan.",
    pt: "Uma resposta representativa para testar traduções Equivalentes com comprimentos diferentes.",
  },
};

const representativeStates = {
  // The launch intake currently has no bare Book, so one record is deliberately made bare for the layout question.
  "A Condição Humana": { collection_status: "not_in_collection", reading_status: "unread", prototypeState: true },
  // The intake does not carry read counts; this state exercises the agreed derived-label shape.
  "Crime e Castigo": { readTwice: true, prototypeState: true },
};

let catalog = [];
let announcementTimer;

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function firstAuthorSort(authors) {
  // Visual-only stand-in. Production receives the already-decided explicit author sort value.
  const first = authors.split("|")[0].trim();
  const parts = first.split(/\s+/);
  return parts.length > 1 ? `${parts.at(-1)}, ${parts.slice(0, -1).join(" ")}` : first;
}

function preparedCatalog(rows) {
  return rows.map((row, index) => {
    const state = representativeStates[row.book_title] ?? {};
    return {
      ...row,
      ...state,
      id: `book-${index + 1}`,
      alternateTitles: alternateTitles[row.book_title] ?? [],
      authorSort: firstAuthorSort(row.authors),
      reflection: reflections[row.book_title] ?? null,
    };
  });
}

function currentState() {
  const params = new URLSearchParams(window.location.search);
  const requestedVariant = (params.get("variant") || "A").toUpperCase();
  const requestedView = params.get("show") || "all";
  const requestedOrder = params.get("order") || "title";
  return {
    variant: variants.some(({ key }) => key === requestedVariant) ? requestedVariant : "A",
    lang: params.get("lang") === "pt" ? "pt" : "en",
    query: params.get("q") || "",
    view: ["all", "read", "favorites", "next", "collection"].includes(requestedView) ? requestedView : "all",
    order: ["title", "author"].includes(requestedOrder) ? requestedOrder : "title",
  };
}

function updateState(next, focus = null) {
  const params = new URLSearchParams();
  params.set("variant", next.variant);
  params.set("lang", next.lang);
  if (next.query) params.set("q", next.query);
  if (next.view !== "all") params.set("show", next.view);
  if (next.order !== "title") params.set("order", next.order);
  window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}${window.location.hash}`);
  render(focus);
}

function localeControl(t, state) {
  const next = state.lang === "en" ? "pt" : "en";
  return `<button class="locale-control" type="button" data-language="${next}">${t.locale}</button>`;
}

function header(t, state) {
  return `<header class="site-header">
    <nav aria-label="Primary navigation">
      <a href="#">${t.nav.home}</a>
      <a href="#main" aria-current="page">${t.nav.library}</a>
    </nav>
    ${localeControl(t, state)}
  </header>`;
}

function marker(book) {
  return book.prototypeState
    ? `<sup class="prototype-marker" aria-hidden="true">*</sup><span class="sr-status"> Prototype stress state</span>`
    : "";
}

function relationshipLabels(book, t) {
  const labels = [];
  if (book.reading_status === "reading") labels.push(t.relationships.reading);
  if (book.reading_status === "read") labels.push(book.readTwice ? `${t.relationships.readTwice}*` : t.relationships.read);
  if (book.favorite === "yes") labels.push(t.relationships.favorite);
  if (book.next_read === "yes") labels.push(t.relationships.next);
  if (book.collection_status === "in_collection") labels.push(t.relationships.collection);
  return labels;
}

function relationshipLine(book, t) {
  const labels = relationshipLabels(book, t);
  return labels.length ? `<p class="relationship-line">${labels.map(escapeHTML).join(" · ")}</p>` : "";
}

function reflectionMarkup(book, state) {
  if (!book.reflection) return "";
  const reflection = escapeHTML(book.reflection[state.lang]);
  return `<blockquote class="reflection"><span>${reflection}</span><sup class="prototype-marker" aria-hidden="true">*</sup><span class="reflection-date">${escapeHTML(book.reflection.date)}</span></blockquote>`;
}

function bookRecord(book, t, state, mode = "stacked") {
  if (mode === "register") {
    return `<li class="book-record">
      <div class="record-title"><h3>${escapeHTML(book.book_title)}${marker(book)}</h3><p class="authors">${escapeHTML(book.authors)}</p></div>
      <div class="record-relationship">${relationshipLine(book, t)}</div>
      ${reflectionMarkup(book, state)}
    </li>`;
  }
  if (mode === "single-line") {
    const relationships = relationshipLabels(book, t);
    return `<li class="book-record compact-book-record">
      <div class="compact-book-line">
        <h3>${escapeHTML(book.book_title)}${marker(book)}</h3><span class="compact-authors"> — ${escapeHTML(book.authors)}</span>${relationships.length ? `<span class="compact-relationships"> · ${relationships.map(escapeHTML).join(" · ")}</span>` : ""}
      </div>
      ${reflectionMarkup(book, state)}
    </li>`;
  }
  return `<li class="book-record">
    <h3>${escapeHTML(book.book_title)}${marker(book)}</h3>
    <p class="authors">${escapeHTML(book.authors)}</p>
    ${relationshipLine(book, t)}
    ${reflectionMarkup(book, state)}
  </li>`;
}

function availableViews() {
  return [
    ["all", true],
    ["read", catalog.some((book) => book.reading_status === "read")],
    ["favorites", catalog.some((book) => book.favorite === "yes")],
    ["next", catalog.some((book) => book.next_read === "yes")],
    ["collection", catalog.some((book) => book.collection_status === "in_collection")],
  ].filter(([, available]) => available).map(([key]) => key);
}

function controlMarkup(t, state) {
  const views = availableViews();
  const view = views.includes(state.view) ? state.view : "all";
  const viewChoices = views.map((key) => `<label class="choice">
    <input id="show-${key}" type="radio" name="show" value="${key}"${view === key ? " checked" : ""} />
    <span>${t.views[key]}</span>
  </label>`).join("");
  const orderChoices = ["title", "author"].map((key) => `<label class="choice">
    <input id="order-${key}" type="radio" name="order" value="${key}"${state.order === key ? " checked" : ""} />
    <span>${t.orders[key]}</span>
  </label>`).join("");

  return `<form class="browser-controls" aria-label="${t.controls}">
    <div class="search-and-groups">
      <div class="search-field">
        <label for="library-search">${t.search}</label>
        <div class="search-input-wrap">
          <input id="library-search" type="search" name="q" value="${escapeHTML(state.query)}" placeholder="${t.searchPlaceholder}" autocomplete="off" />
          <button class="clear-search" type="button" data-clear-search aria-label="${t.clearSearch}"${state.query ? "" : " hidden"}>×</button>
        </div>
      </div>
      <div class="control-groups">
        <fieldset class="choice-group"><legend>${t.show}</legend><div class="choices">${viewChoices}</div></fieldset>
        <fieldset class="choice-group"><legend>${t.order}</legend><div class="choices">${orderChoices}</div></fieldset>
      </div>
    </div>
  </form>`;
}

function currentReadingMarkup(t) {
  const current = catalog.filter((book) => book.reading_status === "reading");
  if (!current.length) return "";
  return `<section class="current-reading" aria-labelledby="current-heading">
    <h2 id="current-heading">${t.current}</h2>
    ${current.map((book) => `<article class="current-book"><h3>${escapeHTML(book.book_title)}</h3><p>${escapeHTML(book.authors)}</p>${relationshipLine(book, t)}</article>`).join("")}
  </section>`;
}

function filteredBooks(state, lang) {
  const tokens = normalize(state.query).split(/\s+/).filter(Boolean);
  const viewMatches = {
    all: () => true,
    read: (book) => book.reading_status === "read",
    favorites: (book) => book.favorite === "yes",
    next: (book) => book.next_read === "yes",
    collection: (book) => book.collection_status === "in_collection",
  };
  const collator = new Intl.Collator(lang === "pt" ? "pt-PT" : "en-GB", { sensitivity: "base", numeric: true });
  return catalog
    .filter(viewMatches[state.view] ?? viewMatches.all)
    .filter((book) => {
      const searchable = normalize([book.book_title, ...book.alternateTitles, book.authors].join(" "));
      return tokens.every((token) => searchable.includes(token));
    })
    .sort((a, b) => {
      if (state.order === "author") {
        return collator.compare(a.authorSort, b.authorSort) || collator.compare(a.book_title, b.book_title) || a.id.localeCompare(b.id);
      }
      return collator.compare(a.book_title, b.book_title) || collator.compare(a.authorSort, b.authorSort) || a.id.localeCompare(b.id);
    });
}

function resultsHeading(t, state, shown) {
  const narrowed = Boolean(state.query || state.view !== "all");
  return `<header class="results-heading"><h2 id="books-heading">${t.books}</h2><p class="result-count">${t.count(shown, catalog.length, narrowed)}</p></header>`;
}

function emptyMarkup(t, state) {
  return `<div class="empty-state">
    <p>${escapeHTML(t.noResults({ view: state.view, query: state.query }))}</p>
    <div class="empty-actions">
      ${state.query ? `<button type="button" class="text-button" data-clear-search>${t.clearSearch}</button>` : ""}
      ${state.view !== "all" ? `<button type="button" class="text-button" data-show-all>${t.showAll}</button>` : ""}
    </div>
  </div>`;
}

function flatResultsMarkup(t, state, books, recordMode = "stacked") {
  return `<section class="library-results" aria-labelledby="books-heading">
    ${resultsHeading(t, state, books.length)}
    ${books.length ? `<ol class="book-list">${books.map((book) => bookRecord(book, t, state, recordMode)).join("")}</ol>` : emptyMarkup(t, state)}
    <p class="prototype-note">${t.prototypeNote}</p>
  </section>`;
}

function firstGroupCharacter(book, state) {
  const source = state.order === "author" ? book.authorSort : book.book_title;
  const character = normalize(source).charAt(0).toLocaleUpperCase();
  return /\p{L}|\p{N}/u.test(character) ? character : "#";
}

function groupedResultsMarkup(t, state, books) {
  const groups = new Map();
  books.forEach((book) => {
    const key = firstGroupCharacter(book, state);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(book);
  });
  const groupMarkup = [...groups].map(([key, group]) => `<section class="letter-group" aria-label="${escapeHTML(key)}">
    <p class="letter-heading" aria-hidden="true">${escapeHTML(key)}</p>
    <ol class="book-list">${group.map((book) => bookRecord(book, t, state, "register")).join("")}</ol>
  </section>`).join("");
  return `<section class="library-results" aria-labelledby="books-heading">
    ${resultsHeading(t, state, books.length)}
    ${books.length ? groupMarkup : emptyMarkup(t, state)}
    <p class="prototype-note">${t.prototypeNote}</p>
  </section>`;
}

function introduction(t) {
  return `<div><p class="eyebrow">Duarte Esteves</p><h1>${t.title}</h1><p>${t.introduction}</p></div>`;
}

function renderVariantA(t, state, books) {
  return `<div class="site-shell variant-a">
    ${header(t, state)}
    <main id="main">
      <header class="library-intro">${introduction(t)}</header>
      ${currentReadingMarkup(t)}
      ${controlMarkup(t, state)}
      ${flatResultsMarkup(t, state, books, "single-line")}
    </main>
  </div>`;
}

function renderVariantB(t, state, books) {
  return `<div class="site-shell variant-b">
    ${header(t, state)}
    <main id="main">
      <header class="library-intro">${introduction(t)}</header>
      <div class="library-workspace">
        <aside class="browsing-rail">
          ${currentReadingMarkup(t)}
          ${controlMarkup(t, state)}
        </aside>
        ${flatResultsMarkup(t, state, books)}
      </div>
    </main>
  </div>`;
}

function renderVariantC(t, state, books) {
  return `<div class="site-shell variant-c">
    ${header(t, state)}
    <main id="main">
      <header class="library-intro">${introduction(t)}${currentReadingMarkup(t)}</header>
      ${controlMarkup(t, state)}
      ${groupedResultsMarkup(t, state, books)}
    </main>
  </div>`;
}

function announce(message, immediate = false) {
  window.clearTimeout(announcementTimer);
  announcementTimer = window.setTimeout(() => {
    document.getElementById("results-status").textContent = message;
  }, immediate ? 0 : 350);
}

function render(focus = null) {
  const state = currentState();
  const t = copy[state.lang];
  const views = availableViews();
  if (!views.includes(state.view)) state.view = "all";
  const books = filteredBooks(state, state.lang);
  const renderers = { A: renderVariantA, B: renderVariantB, C: renderVariantC };

  document.documentElement.lang = state.lang === "pt" ? "pt-PT" : "en-GB";
  document.title = t.documentTitle;
  document.querySelector(".skip-link").textContent = t.skip;
  document.getElementById("prototype").innerHTML = renderers[state.variant](t, state, books);

  const variant = variants.find(({ key }) => key === state.variant);
  const route = state.lang === "pt" ? "/pt/biblioteca" : "/en/library";
  document.getElementById("variant-state").innerHTML = `<strong>${variant.key} — ${variant.name}</strong><span>${route} · PROTOTYPE</span>`;

  if (focus) {
    const element = document.getElementById(focus.id);
    element?.focus({ preventScroll: true });
    if (element && focus.selection != null && "setSelectionRange" in element) element.setSelectionRange(focus.selection, focus.selection);
  }
  announce(t.count(books.length, catalog.length, Boolean(state.query || state.view !== "all")), focus?.id !== "library-search");
}

function cycle(direction) {
  const state = currentState();
  const index = variants.findIndex(({ key }) => key === state.variant);
  const delta = direction === "next" ? 1 : -1;
  const next = variants[(index + delta + variants.length) % variants.length];
  updateState({ ...state, variant: next.key });
}

document.addEventListener("submit", (event) => event.preventDefault());

document.addEventListener("input", (event) => {
  if (event.target.id !== "library-search") return;
  const selection = event.target.selectionStart;
  updateState({ ...currentState(), query: event.target.value }, { id: "library-search", selection });
});

document.addEventListener("change", (event) => {
  if (event.target.name === "show") updateState({ ...currentState(), view: event.target.value }, { id: event.target.id });
  if (event.target.name === "order") updateState({ ...currentState(), order: event.target.value }, { id: event.target.id });
});

document.addEventListener("click", (event) => {
  const directionButton = event.target.closest("[data-direction]");
  if (directionButton) cycle(directionButton.dataset.direction);

  const languageButton = event.target.closest("[data-language]");
  if (languageButton) updateState({ ...currentState(), lang: languageButton.dataset.language });

  if (event.target.closest("[data-clear-search]")) updateState({ ...currentState(), query: "" }, { id: "library-search", selection: 0 });
  if (event.target.closest("[data-show-all]")) updateState({ ...currentState(), view: "all" }, { id: "show-all" });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (event.target.matches("input, textarea, select, [contenteditable]")) return;
  event.preventDefault();
  cycle(event.key === "ArrowRight" ? "next" : "previous");
});

window.addEventListener("popstate", () => render());

fetch("./catalog.json")
  .then((response) => response.json())
  .then((rows) => {
    catalog = preparedCatalog(rows);
    render();
  })
  .catch((error) => {
    document.getElementById("prototype").innerHTML = `<main id="main"><p>Prototype catalog failed to load: ${escapeHTML(error.message)}</p></main>`;
  });
