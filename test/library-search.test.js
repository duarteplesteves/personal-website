import { readFile } from "node:fs/promises";
import vm from "node:vm";
import assert from "node:assert/strict";
import test from "node:test";

const readLibraryScript = () => readFile("dist/assets/library.js", "utf8");

const element = (properties = {}) => {
  const listeners = {};
  return {
    value: "",
    hidden: false,
    textContent: "",
    dataset: {},
    focused: false,
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
    focus() {
      this.focused = true;
    },
    dispatch(type) {
      listeners[type]?.();
    },
    ...properties,
  };
};

const runLibraryScript = (script, books, search = "") => {
  const items = books.map((book, index) => {
    const data = typeof book === "string" ? { search: book, title: book } : book;
    return element({
      dataset: {
        views: "",
        authorSort: data.title,
        bookId: String(index),
        ...data,
      },
    });
  });
  const controls = element({ hidden: true });
  const input = element();
  const clear = element();
  const count = element({
    dataset: {
      resultCountLabel: "{count} Books",
      matchingResultCountLabel: "{matching} of {total} Books",
    },
  });
  const announcement = element();
  const empty = element({ hidden: true });
  const list = element({
    order: [],
    querySelectorAll: () => items,
    append(...ordered) {
      this.order = ordered;
    },
  });
  const showChoices = ["all", "read", "favorites", "next-reads", "in-collection"].map((value) =>
    element({ value, checked: value === "all" }),
  );
  const orderChoices = ["title", "author"].map((value) =>
    element({ value, checked: value === "title" }),
  );

  const selectors = {
    "[data-library-controls]": controls,
    "[data-library-search]": input,
    "[data-library-clear]": clear,
    "[data-result-count]": count,
    "[data-library-announcement]": announcement,
    "[data-book-list]": list,
    "[data-library-empty]": empty,
  };

  const history = [];
  const location = { href: `https://example.test/en/library${search}`, search };
  vm.runInNewContext(script, {
    document: {
      documentElement: { lang: "en-GB" },
      querySelector: (selector) => selectors[selector] ?? null,
      querySelectorAll: (selector) =>
        selector === 'input[name="library-show"]' ? showChoices : orderChoices,
    },
    location,
    history: {
      replaceState(_state, _unused, url) {
        const destination = new URL(url, location.href);
        location.href = destination.toString();
        location.search = destination.search;
        history.push(destination.search);
      },
    },
    URL,
    URLSearchParams,
    setTimeout,
    clearTimeout,
  });

  return {
    history,
    location,
    controls,
    input,
    clear,
    count,
    announcement,
    empty,
    items,
    list,
    showChoices,
    orderChoices,
  };
};

test("search reveals controls, normalizes case, diacritics, and punctuation, and requires every token", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(script, [
    "The Brothers Karamazov Fyodor Dostoevsky",
    "Cien Años de Soledad Gabriel García Márquez",
    "Tender Is the Night—A Romance F. Scott Fitzgerald",
    "A Study in Scarlet Arthur Conan Doyle",
  ]);

  assert.equal(env.controls.hidden, false, "enhancement reveals the search controls");
  assert.equal(env.count.textContent, "4 Books");

  env.input.value = "dostoevsky";
  env.input.dispatch("input");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [false, true, true, true],
  );
  assert.equal(env.count.textContent, "1 of 4 Books");

  env.input.value = "FYODOR DOSTOEVSKY";
  env.input.dispatch("input");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [false, true, true, true],
  );

  env.input.value = "cien anos";
  env.input.dispatch("input");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [true, false, true, true],
  );

  env.input.value = "tender is the night";
  env.input.dispatch("input");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [true, true, false, true],
  );

  env.input.value = "dostoevsky garcia";
  env.input.dispatch("input");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [true, true, true, true],
  );
  assert.equal(env.count.textContent, "0 of 4 Books");
  assert.equal(env.empty.hidden, false);
});

test("search matches an ASCII query against Polish ł", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(script, ["Solaris Stanisław Lem"]);

  env.input.value = "stanislaw";
  env.input.dispatch("input");

  assert.equal(env.items[0].hidden, false);
});

test("clear restores the full listing and returns focus to the search control", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(script, [
    "A Study in Scarlet Arthur Conan Doyle",
    "Solaris Stanisław Lem",
  ]);

  env.input.value = "scarlet";
  env.input.dispatch("input");
  assert.equal(env.count.textContent, "1 of 2 Books");
  assert.equal(env.empty.hidden, true);
  await new Promise((resolve) => setTimeout(resolve, 350));
  assert.equal(env.announcement.textContent, "1 of 2 Books");

  env.clear.dispatch("click");

  assert.equal(env.input.value, "");
  assert.equal(env.count.textContent, "2 Books");
  assert.equal(env.empty.hidden, true);
  assert.equal(env.input.focused, true);
  await new Promise((resolve) => setTimeout(resolve, 350));
  assert.equal(env.announcement.textContent, "2 Books");
});

test("search announcements are polite and debounced", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(script, [
    "A Study in Scarlet Arthur Conan Doyle",
    "Solaris Stanisław Lem",
  ]);

  env.input.value = "scarlet";
  env.input.dispatch("input");
  env.input.value = "solaris";
  env.input.dispatch("input");

  assert.equal(env.announcement.textContent, "", "announcement is deferred while typing");

  await new Promise((resolve) => setTimeout(resolve, 350));
  assert.equal(env.announcement.textContent, "1 of 2 Books");
});

const choose = (choices, value) => {
  for (const choice of choices) choice.checked = choice.value === value;
  choices.find((choice) => choice.checked)?.dispatch("change");
};

test("Show combines with search and All directly restores the complete catalog", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(script, [
    { search: "Alpha Ada", title: "Alpha", authorSort: "Ada", bookId: "1", views: "read" },
    {
      search: "Beta Bob",
      title: "Beta",
      authorSort: "Bob",
      bookId: "2",
      views: "favorites",
    },
    {
      search: "Gamma Ada",
      title: "Gamma",
      authorSort: "Ada",
      bookId: "3",
      views: "read favorites",
    },
  ]);

  const favorites = env.showChoices.find((choice) => choice.value === "favorites");
  favorites.focused = true;
  choose(env.showChoices, "favorites");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [true, false, false],
  );
  assert.equal(env.count.textContent, "2 of 3 Books");
  assert.equal(favorites.focused, true, "updating results retains radio focus");

  env.input.value = "gamma";
  env.input.dispatch("input");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [true, true, false],
  );
  assert.equal(env.count.textContent, "1 of 3 Books");

  env.input.value = "";
  choose(env.showChoices, "all");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [false, false, false],
  );
  assert.equal(env.count.textContent, "3 Books");
});

test("readable URL state restores controls and unsupported or default values are omitted", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(
    script,
    [
      { search: "Alpha Ada", title: "Alpha", authorSort: "Ada", views: "read" },
      { search: "Beta Bob", title: "Beta", authorSort: "Bob" },
    ],
    "?q=Alpha%20Ada&show=read&order=author&unsupported=value",
  );

  assert.equal(env.input.value, "Alpha Ada");
  assert.equal(env.showChoices.find((choice) => choice.checked)?.value, "read");
  assert.equal(env.orderChoices.find((choice) => choice.checked)?.value, "author");
  assert.equal(env.location.search, "?q=Alpha+Ada&show=read&order=author");
  assert.deepEqual(
    env.items.map((item) => item.hidden),
    [false, true],
  );

  const defaults = runLibraryScript(script, ["Alpha"], "?q=&show=all&order=title");
  assert.equal(defaults.location.search, "");
});

test("live Library changes replace the current history entry", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(script, [
    { search: "Alpha Ada", title: "Alpha", authorSort: "Ada", views: "favorites" },
  ]);

  env.input.value = "Alpha Ada";
  env.input.dispatch("input");
  choose(env.showChoices, "favorites");
  choose(env.orderChoices, "author");
  env.clear.dispatch("click");

  assert.deepEqual(env.history.slice(-4), [
    "?q=Alpha+Ada",
    "?q=Alpha+Ada&show=favorites",
    "?q=Alpha+Ada&show=favorites&order=author",
    "?show=favorites&order=author",
  ]);
});

test("Order by uses locale collation and deterministic title, author, and identifier ties", async () => {
  const script = await readLibraryScript();
  const env = runLibraryScript(script, [
    { search: "Zulu Able", title: "Zulu", authorSort: "Able", bookId: "3" },
    { search: "Alpha Zed", title: "Alpha", authorSort: "Zed", bookId: "2" },
    { search: "Alpha Able", title: "Alpha", authorSort: "Able", bookId: "1" },
    { search: "Alpha Able", title: "Alpha", authorSort: "Able", bookId: "0" },
  ]);

  assert.deepEqual(
    env.list.order.map((item) => item.dataset.bookId),
    ["0", "1", "2", "3"],
  );

  choose(env.orderChoices, "author");
  assert.deepEqual(
    env.list.order.map((item) => item.dataset.bookId),
    ["0", "1", "3", "2"],
  );

  choose(env.orderChoices, "title");
  assert.deepEqual(
    env.list.order.map((item) => item.dataset.bookId),
    ["0", "1", "2", "3"],
  );
});
