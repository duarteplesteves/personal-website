export type SiteLanguage = "en" | "pt";
export type Page = "home" | "library";

export interface Publication {
  readonly page: Page;
  readonly siteLanguage: SiteLanguage;
  readonly documentLanguage: "en-GB" | "pt-PT";
  readonly pathname: string;
  readonly outputPath: string;
}

export const sitePublication: ReadonlyArray<Publication> = [
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
  {
    page: "library",
    siteLanguage: "en",
    documentLanguage: "en-GB",
    pathname: "/en/library",
    outputPath: "en/library/index.html",
  },
  {
    page: "library",
    siteLanguage: "pt",
    documentLanguage: "pt-PT",
    pathname: "/pt/library",
    outputPath: "pt/library/index.html",
  },
];

export const generatedRootPath = "root.json";

export const generatedPagePath = (publication: Publication) =>
  `${publication.siteLanguage}/${publication.page}.json`;

export const findPublication = (page: Page, siteLanguage: SiteLanguage): Publication => {
  const publication = sitePublication.find(
    (candidate) => candidate.page === page && candidate.siteLanguage === siteLanguage,
  );
  if (publication === undefined) {
    throw new Error(`Missing publication for ${siteLanguage} ${page}`);
  }
  return publication;
};

export const equivalentPublication = (publication: Publication): Publication =>
  findPublication(publication.page, publication.siteLanguage === "en" ? "pt" : "en");
