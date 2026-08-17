export const homePublication = [
  {
    page: "home",
    siteLanguage: "en",
    documentLanguage: "en-GB",
    pathname: "/en",
    outputPath: "en/index.html",
  },
  {
    page: "home",
    siteLanguage: "pt",
    documentLanguage: "pt-PT",
    pathname: "/pt",
    outputPath: "pt/index.html",
  },
] as const;

export type HomePublication = (typeof homePublication)[number];
export type SiteLanguage = HomePublication["siteLanguage"];
