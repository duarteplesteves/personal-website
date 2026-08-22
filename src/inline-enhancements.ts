export const rootLanguageResolver = (homePathnames: {
  readonly en: string;
  readonly pt: string;
}) => `(() => {
  const destinations = ${JSON.stringify(homePathnames)};
  const supported = new Set(Object.keys(destinations));
  let saved;
  try { saved = localStorage.getItem("site-language"); } catch {}
  if (supported.has(saved)) {
    location.replace(destinations[saved]);
    return;
  }
  const preferences = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];
  for (const preference of preferences) {
    const language = String(preference || "").toLowerCase().split("-")[0];
    if (supported.has(language)) {
      location.replace(destinations[language]);
      return;
    }
  }
  location.replace(destinations.en);
})();`;

export const languageControlEnhancement = `(() => {
  const control = document.querySelector("[data-language-control]");
  if (!control) return;
  control.addEventListener("click", () => {
    try { localStorage.setItem("site-language", control.dataset.siteLanguage); } catch {}
    const destination = new URL(control.href, location.href);
    destination.search = location.search;
    control.href = destination.toString();
  });
})();`;

export const libraryEnhancement = `(() => {
  const controls = document.querySelector("[data-library-controls]");
  const input = document.querySelector("[data-library-search]");
  const clear = document.querySelector("[data-library-clear]");
  const count = document.querySelector("[data-result-count]");
  const announcement = document.querySelector("[data-library-announcement]");
  const list = document.querySelector("[data-book-list]");
  const empty = document.querySelector("[data-library-empty]");
  if (!(controls && input && clear && count && announcement && list && empty)) return;

  const totalLabel = count.dataset.resultCountLabel;
  const matchingLabel = count.dataset.matchingResultCountLabel;
  const items = Array.from(list.querySelectorAll("[data-search]"));
  const total = items.length;

  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/\\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^\\p{L}\\p{N}]+/gu, " ")
      .replace(/\\s+/g, " ")
      .trim();

  const tokensOf = (value) => normalize(value).split(" ").filter(Boolean);

  let timer;

  const update = () => {
    const tokens = tokensOf(input.value);
    let matching = 0;
    for (const item of items) {
      const haystack = normalize(item.dataset.search || "");
      const matches = tokens.every((token) => haystack.includes(token));
      item.hidden = !matches;
      if (matches) matching += 1;
    }
    count.textContent =
      tokens.length === 0
        ? totalLabel.replace("{count}", String(total))
        : matchingLabel
            .replace("{matching}", String(matching))
            .replace("{total}", String(total));
    empty.hidden = !(tokens.length > 0 && matching === 0);
  };

  const announce = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      announcement.textContent = count.textContent;
    }, 300);
  };

  input.addEventListener("input", () => {
    update();
    announce();
  });
  input.addEventListener("search", () => {
    update();
    announce();
  });
  clear.addEventListener("click", () => {
    input.value = "";
    update();
    input.focus();
  });

  controls.hidden = false;
  update();
})();`;
