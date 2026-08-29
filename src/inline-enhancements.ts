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
