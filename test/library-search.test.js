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

const runLibraryScript = (script, searchTexts) => {
  const items = searchTexts.map((search) => element({ dataset: { search } }));
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
  const list = element({ querySelectorAll: () => items });

  const selectors = {
    "[data-library-controls]": controls,
    "[data-library-search]": input,
    "[data-library-clear]": clear,
    "[data-result-count]": count,
    "[data-library-announcement]": announcement,
    "[data-book-list]": list,
    "[data-library-empty]": empty,
  };

  vm.runInNewContext(script, {
    document: { querySelector: (selector) => selectors[selector] ?? null },
    setTimeout,
    clearTimeout,
  });

  return { controls, input, clear, count, announcement, empty, items };
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

  env.clear.dispatch("click");

  assert.equal(env.input.value, "");
  assert.equal(env.count.textContent, "2 Books");
  assert.equal(env.empty.hidden, true);
  assert.equal(env.input.focused, true);
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
