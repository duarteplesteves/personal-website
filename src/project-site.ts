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

const formatExperienceDate = (date: string, siteLanguage: "en" | "pt") =>
  new Intl.DateTimeFormat(siteLanguage === "en" ? "en-GB" : "pt-PT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}-01T00:00:00Z`));

const deriveReadingStatus = (
  completionCount: number,
  active: boolean,
  wantToRead: boolean,
): "unread" | "wantToRead" | "reading" | "read" => {
  if (completionCount > 0) return "read";
  if (active) return "reading";
  return wantToRead ? "wantToRead" : "unread";
};

const projectBooks = (library: LibraryContent, siteLanguage?: "en" | "pt") => {
  const readingsByBook = Map.groupBy(library.readings ?? [], (reading) => reading.bookId);
  return library.books.map((book) => {
    const readings = readingsByBook.get(book.id) ?? [];
    const completionCount = readings.filter((reading) => reading.state === "completed").length;
    const active = readings.some((reading) => reading.state === "active");
    const reflections = (library.reflections ?? [])
      .filter((reflection) => reflection.bookId === book.id)
      .toSorted((left, right) => left.id.localeCompare(right.id));
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
      ...(siteLanguage !== undefined && reflections.length > 0
        ? { reflections: reflections.map((reflection) => reflection.text[siteLanguage]) }
        : {}),
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
    work: {
      workingOn: {
        heading: home.work.workingOn.heading[siteLanguage],
        items: home.work.workingOn.items.map((item) => ({
          title: item.title[siteLanguage],
          description: item.description[siteLanguage],
        })),
      },
      selected: {
        heading: home.work.selected.heading[siteLanguage],
        items: home.work.selected.items.map((item) => ({
          title: item.title[siteLanguage],
          context: item.context[siteLanguage],
          description: item.description[siteLanguage],
        })),
      },
      experience: {
        heading: home.work.experience.heading[siteLanguage],
        items: home.work.experience.items
          .toSorted((left, right) => {
            const stintEnd = (entry: (typeof home.work.experience.items)[number]) =>
              entry.roles.some((role) => role.current)
                ? "9999"
                : (entry.roles
                    .map((role) => role.endedOn ?? "")
                    .toSorted()
                    .at(-1) ?? "");
            return stintEnd(right).localeCompare(stintEnd(left));
          })
          .map((entry) => ({
            company: entry.company,
            roles: entry.roles.map((role) => ({
              title: role.title[siteLanguage],
              dates: `${formatExperienceDate(role.startedOn, siteLanguage)}–${role.current ? home.work.experience.present[siteLanguage] : formatExperienceDate(role.endedOn ?? role.startedOn, siteLanguage)}`,
            })),
            description: entry.description[siteLanguage],
          })),
      },
    },
    setup: {
      heading: home.setup.heading[siteLanguage],
      updated: home.setup.updated[siteLanguage],
      items: home.setup.items.map((item) => item[siteLanguage]),
    },
    contact: {
      heading: home.contact.heading[siteLanguage],
      links: home.contact.links.map((link) => ({
        label: link.label[siteLanguage],
        href: link.href.href,
      })),
    },
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
): LibraryPageData => {
  const { siteLanguage } = publication;
  const text = site.library;
  const collator = new Intl.Collator(siteLanguage === "en" ? "en-GB" : "pt-PT");
  const books = projectBooks(library, siteLanguage)
    .map((book) => {
      const active = book.readingStatus === "reading" || book.rereading;
      const parts = [
        book.favorite && text.favorite[siteLanguage],
        active && text.currentlyReading[siteLanguage],
        book.rereading && text.rereading[siteLanguage],
        !active &&
          book.completionCount > 1 &&
          text.readTimes[siteLanguage].replace("{count}", String(book.completionCount)),
        book.inCollection && text.inCollection[siteLanguage],
        book.nextRead && text.nextReads[siteLanguage],
      ].filter((part): part is string => typeof part === "string");
      return parts.length > 0 ? { ...book, relationship: parts.join(" · ") } : book;
    })
    .toSorted(
      (left, right) =>
        collator.compare(left.title, right.title) ||
        collator.compare(left.authors[0].sortValue, right.authors[0].sortValue) ||
        left.id.localeCompare(right.id),
    );
  const currentlyReading = books
    .filter((book) => book.readingStatus === "reading" || book.rereading)
    .map(({ id, title, authors }) => ({ id, title, authors }));
  return {
    page: "library",
    title: `${text.heading[siteLanguage]} — ${site.root.title}`,
    heading: text.heading[siteLanguage],
    introduction: text.introduction[siteLanguage],
    description: text.description[siteLanguage],
    books,
    ...(currentlyReading.length > 0 ? { currentlyReading } : {}),
    currentlyReadingLabel: text.currentlyReading[siteLanguage],
    searchLabel: text.searchLabel[siteLanguage],
    searchPlaceholder: text.searchPlaceholder[siteLanguage],
    clearSearchLabel: text.clearSearchLabel[siteLanguage],
    showLabel: text.showLabel[siteLanguage],
    allBooksLabel: text.allBooksLabel[siteLanguage],
    readLabel: text.readLabel[siteLanguage],
    favoritesLabel: text.favorites[siteLanguage],
    nextReadsLabel: text.nextReads[siteLanguage],
    inCollectionLabel: text.inCollection[siteLanguage],
    orderByLabel: text.orderByLabel[siteLanguage],
    titleOrderLabel: text.titleOrderLabel[siteLanguage],
    authorOrderLabel: text.authorOrderLabel[siteLanguage],
    resultCountLabel: text.resultCountLabel[siteLanguage],
    matchingResultCountLabel: text.matchingResultCountLabel[siteLanguage],
    emptyStateLabel: text.emptyStateLabel[siteLanguage],
    navigation: projectNavigation(site, publication),
  };
};

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
