import type { HomePageData, LibraryPageData, PageData, RootPageData } from "./page-data-schema.ts";
import { equivalentPublication, findPublication, type Publication } from "./publication.ts";
import type { HomeContent } from "./repository/home-content.ts";
import type { LibraryContent } from "./repository/library-content.ts";
import type { SiteContent } from "./repository/site-content.ts";

const projectNavigation = (site: SiteContent, publication: Publication) => {
  const { siteLanguage } = publication;
  const equivalent = equivalentPublication(publication);
  const alternate = equivalent.siteLanguage;
  return {
    homeLabel: site.navigation.home[siteLanguage],
    homePathname: findPublication("home", siteLanguage).pathname,
    libraryLabel: site.navigation.library[siteLanguage],
    libraryPathname: findPublication("library", siteLanguage).pathname,
    primaryLabel: site.navigation.primaryLabel[siteLanguage],
    skipLabel: site.navigation.skipLabel[siteLanguage],
    currentLanguageLabel: site.navigation.currentLanguageLabel[siteLanguage],
    currentLanguageName: site.languages[siteLanguage],
    alternateLanguageName: site.languages[alternate],
    switchLanguageLabel: site.navigation.switchLanguageLabel[siteLanguage],
    equivalentPathname: equivalent.pathname,
    alternateDocumentLanguage: equivalent.documentLanguage,
    alternateSiteLanguage: alternate,
  };
};

export const projectHome = (
  home: HomeContent,
  site: SiteContent,
  publication: Publication,
): HomePageData => ({
  page: "home",
  title: home.title,
  introduction: home.introduction[publication.siteLanguage],
  description: home.description[publication.siteLanguage],
  navigation: projectNavigation(site, publication),
});

export const projectLibrary = (
  library: LibraryContent,
  site: SiteContent,
  publication: Publication,
): LibraryPageData => ({
  page: "library",
  title: `${site.library.heading[publication.siteLanguage]} — ${site.root.title}`,
  heading: site.library.heading[publication.siteLanguage],
  introduction: site.library.introduction[publication.siteLanguage],
  description: site.library.description[publication.siteLanguage],
  books: library.books.map((book) => ({ ...book, alternateTitles: book.alternateTitles ?? [] })),
  navigation: projectNavigation(site, publication),
});

export const projectPage = (
  home: HomeContent,
  library: LibraryContent,
  site: SiteContent,
  publication: Publication,
): PageData =>
  publication.page === "home"
    ? projectHome(home, site, publication)
    : projectLibrary(library, site, publication);

export const projectRoot = (site: SiteContent): RootPageData => ({
  title: site.root.title,
  description: site.root.description,
  heading: site.root.heading,
  introduction: site.root.introduction,
  languages: site.languages,
  homePathnames: {
    en: findPublication("home", "en").pathname,
    pt: findPublication("home", "pt").pathname,
  },
});
