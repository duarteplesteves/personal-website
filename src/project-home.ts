import type { HomeContent } from "./home-content.ts";
import type { HomePageData } from "./page-data-schema.ts";
import type { SiteLanguage } from "./publication.ts";

export const projectHome = (content: HomeContent, siteLanguage: SiteLanguage): HomePageData => ({
  title: content.title,
  introduction: content.introduction[siteLanguage],
  description: content.description[siteLanguage],
});
