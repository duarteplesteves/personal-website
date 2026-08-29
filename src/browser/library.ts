const enhanceLibrary = () => {
  const controls = document.querySelector<HTMLElement>("[data-library-controls]");
  const input = document.querySelector<HTMLInputElement>("[data-library-search]");
  const clear = document.querySelector<HTMLButtonElement>("[data-library-clear]");
  const count = document.querySelector<HTMLElement>("[data-result-count]");
  const announcement = document.querySelector<HTMLElement>("[data-library-announcement]");
  const list = document.querySelector<HTMLOListElement>("[data-book-list]");
  const empty = document.querySelector<HTMLElement>("[data-library-empty]");
  const showChoices = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="library-show"]'),
  );
  const orderChoices = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="library-order"]'),
  );
  if (
    controls === null ||
    input === null ||
    clear === null ||
    count === null ||
    announcement === null ||
    list === null ||
    empty === null ||
    showChoices.length === 0 ||
    orderChoices.length === 0
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
  const collator = new Intl.Collator(document.documentElement.lang);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const replaceUrl = () => {
    const parameters = new URLSearchParams();
    if (input.value !== "") parameters.set("q", input.value);
    const show = showChoices.find((choice) => choice.checked)?.value;
    const order = orderChoices.find((choice) => choice.checked)?.value;
    if (show !== undefined && show !== "all") parameters.set("show", show);
    if (order !== undefined && order !== "title") parameters.set("order", order);
    const query = parameters.toString();
    history.replaceState(null, "", query === "" ? location.href.split("?")[0] : `?${query}`);
  };

  const update = () => {
    const tokens = tokensOf(input.value);
    const show = showChoices.find((choice) => choice.checked)?.value ?? "all";
    const order = orderChoices.find((choice) => choice.checked)?.value ?? "title";
    let matching = 0;
    for (const item of items) {
      const haystack = normalize(item.dataset.search ?? "");
      const matchesSearch = tokens.every((token) => haystack.includes(token));
      const matchesShow = show === "all" || (item.dataset.views ?? "").split(" ").includes(show);
      item.hidden = !(matchesSearch && matchesShow);
      if (!item.hidden) matching += 1;
    }
    items.sort((left, right) => {
      const title = collator.compare(left.dataset.title ?? "", right.dataset.title ?? "");
      const author = collator.compare(
        left.dataset.authorSort ?? "",
        right.dataset.authorSort ?? "",
      );
      const id = (left.dataset.bookId ?? "").localeCompare(right.dataset.bookId ?? "");
      return order === "author" ? author || title || id : title || author || id;
    });
    list.append(...items);
    count.textContent =
      tokens.length === 0 && show === "all"
        ? totalLabel.replace("{count}", String(total))
        : matchingLabel.replace("{matching}", String(matching)).replace("{total}", String(total));
    empty.hidden = matching > 0;
  };

  const announce = (delay = 0) => {
    clearTimeout(timer);
    if (delay === 0) {
      announcement.textContent = count.textContent;
      return;
    }
    timer = setTimeout(() => {
      announcement.textContent = count.textContent;
    }, delay);
  };

  input.addEventListener("input", () => {
    update();
    replaceUrl();
    announce(300);
  });
  input.addEventListener("search", () => {
    update();
    replaceUrl();
    announce(300);
  });
  clear.addEventListener("click", () => {
    input.value = "";
    update();
    replaceUrl();
    announce();
    input.focus();
  });
  for (const choice of [...showChoices, ...orderChoices]) {
    choice.addEventListener("change", () => {
      update();
      replaceUrl();
      announce();
    });
  }

  const parameters = new URLSearchParams(location.search);
  input.value = parameters.get("q") ?? "";
  const show = showChoices.find((choice) => choice.value === parameters.get("show"));
  if (show !== undefined && show.value !== "all") {
    for (const choice of showChoices) choice.checked = choice === show;
  }
  const order = orderChoices.find((choice) => choice.value === parameters.get("order"));
  if (order !== undefined && order.value !== "title") {
    for (const choice of orderChoices) choice.checked = choice === order;
  }

  controls.hidden = false;
  update();
  replaceUrl();
};

enhanceLibrary();
