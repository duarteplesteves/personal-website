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

const deriveReadingStatus = (
  completionCount: number,
  active: boolean,
  wantToRead: boolean,
): "unread" | "wantToRead" | "reading" | "read" => {
  if (completionCount > 0) return "read";
  if (active) return "reading";
  return wantToRead ? "wantToRead" : "unread";
};

const projectBooks = (library: LibraryContent) => {
  const readingsByBook = Map.groupBy(library.readings ?? [], (reading) => reading.bookId);
  return library.books.map((book) => {
    const readings = readingsByBook.get(book.id) ?? [];
    const completionCount = readings.filter((reading) => reading.state === "completed").length;
    const active = readings.some((reading) => reading.state === "active");
    return {
      ...book,
      alternateTitles: book.alternateTitles ?? [],
      inCollection:
        library.editions?.some(
          (edition) => edition.bookId === book.id && edition.inCollection === true,
        ) ?? false,
      readingStatus: deriveReadingStatus(
        completionCount,
        active,
        Boolean(library.wantToRead?.includes(book.id) || library.nextReads?.includes(book.id)),
      ),
      completionCount,
      rereading: active && completionCount > 0,
      favorite: library.favorites?.includes(book.id) ?? false,
      nextRead: library.nextReads?.includes(book.id) ?? false,
    };
  });
};

export const projectHome = (
  home: HomeContent,
  library: LibraryContent,
  site: SiteContent,
  publication: Publication,
): HomePageData => {
  const { siteLanguage } = publication;
  const books = projectBooks(library);
  const identities = (selected: typeof books) =>
    selected.map(({ id, title, authors }) => ({ id, title, authors }));
  const currentlyReading = identities(
    books.filter((book) => book.readingStatus === "reading" || book.rereading),
  );
  const favorites = identities(books.filter((book) => book.favorite));
  const nextReads = identities(books.filter((book) => book.nextRead));
  return {
    page: "home",
    title: home.title,
    introduction: home.introduction[siteLanguage],
    description: home.description[siteLanguage],
    libraryPreview: {
      heading: site.library.heading[siteLanguage],
      currentlyReadingLabel: site.library.currentlyReading[siteLanguage],
      favoritesLabel: site.library.favorites[siteLanguage],
      nextReadsLabel: site.library.nextReads[siteLanguage],
      libraryLabel: site.library.viewLibrary[siteLanguage],
      libraryPathname: findPublication("library", siteLanguage).pathname,
      ...(currentlyReading.length > 0 ? { currentlyReading } : {}),
      ...(favorites.length > 0 ? { favorites } : {}),
      ...(nextReads.length > 0 ? { nextReads } : {}),
    },
    navigation: projectNavigation(site, publication),
  };
};

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
  books: projectBooks(library),
  navigation: projectNavigation(site, publication),
});

export const projectPage = (
  home: HomeContent,
  library: LibraryContent,
  site: SiteContent,
  publication: Publication,
): PageData =>
  publication.page === "home"
    ? projectHome(home, library, site, publication)
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
