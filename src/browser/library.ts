const enhanceLibrary = () => {
  const controls = document.querySelector<HTMLElement>("[data-library-controls]");
  const input = document.querySelector<HTMLInputElement>("[data-library-search]");
  const clear = document.querySelector<HTMLButtonElement>("[data-library-clear]");
  const count = document.querySelector<HTMLElement>("[data-result-count]");
  const announcement = document.querySelector<HTMLElement>("[data-library-announcement]");
  const list = document.querySelector<HTMLOListElement>("[data-book-list]");
  const empty = document.querySelector<HTMLElement>("[data-library-empty]");
  if (
    controls === null ||
    input === null ||
    clear === null ||
    count === null ||
    announcement === null ||
    list === null ||
    empty === null
  )
    return;

  const totalLabel = count.dataset.resultCountLabel;
  const matchingLabel = count.dataset.matchingResultCountLabel;
  if (totalLabel === undefined || matchingLabel === undefined) return;

  const items = Array.from(list.querySelectorAll<HTMLElement>("[data-search]"));
  const total = items.length;
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replaceAll("ł", "l")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  const tokensOf = (value: string) => normalize(value).split(" ").filter(Boolean);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const update = () => {
    const tokens = tokensOf(input.value);
    let matching = 0;
    for (const item of items) {
      const haystack = normalize(item.dataset.search ?? "");
      const matches = tokens.every((token) => haystack.includes(token));
      item.hidden = !matches;
      if (matches) matching += 1;
    }
    count.textContent =
      tokens.length === 0
        ? totalLabel.replace("{count}", String(total))
        : matchingLabel.replace("{matching}", String(matching)).replace("{total}", String(total));
    empty.hidden = tokens.length === 0 || matching > 0;
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
};

enhanceLibrary();
