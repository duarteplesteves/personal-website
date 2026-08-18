import type { HomePageData, LibraryPageData, PageData, RootPageData } from "./page-data-schema.ts";
import { findPublication, type Publication, type SiteLanguage } from "./publication.ts";
import type { HomeContent } from "./repository/home-content.ts";
import type { SiteContent } from "./repository/site-content.ts";

const alternateLanguage = (siteLanguage: SiteLanguage): SiteLanguage =>
  siteLanguage === "en" ? "pt" : "en";

const projectNavigation = (site: SiteContent, publication: Publication) => {
  const { siteLanguage } = publication;
  const alternate = alternateLanguage(siteLanguage);
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
    equivalentPathname: publication.equivalentPathname,
    alternateDocumentLanguage: alternate === "en" ? "en-GB" : "pt-PT",
    alternateSiteLanguage: alternate,
  } as const;
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

export const projectLibrary = (site: SiteContent, publication: Publication): LibraryPageData => ({
  page: "library",
  title: `${site.library.heading[publication.siteLanguage]} — Duarte Esteves`,
  heading: site.library.heading[publication.siteLanguage],
  introduction: site.library.introduction[publication.siteLanguage],
  description: site.library.description[publication.siteLanguage],
  navigation: projectNavigation(site, publication),
});

export const projectPage = (
  home: HomeContent,
  site: SiteContent,
  publication: Publication,
): PageData =>
  publication.page === "home"
    ? projectHome(home, site, publication)
    : projectLibrary(site, publication);

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
