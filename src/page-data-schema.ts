import { Schema } from "effect";

const NavigationDataSchema = Schema.Struct({
  homeLabel: Schema.NonEmptyString,
  homePathname: Schema.NonEmptyString,
  libraryLabel: Schema.NonEmptyString,
  libraryPathname: Schema.NonEmptyString,
  primaryLabel: Schema.NonEmptyString,
  skipLabel: Schema.NonEmptyString,
  currentLanguageLabel: Schema.NonEmptyString,
  currentLanguageName: Schema.NonEmptyString,
  alternateLanguageName: Schema.NonEmptyString,
  switchLanguageLabel: Schema.NonEmptyString,
  equivalentPathname: Schema.NonEmptyString,
  alternateDocumentLanguage: Schema.NonEmptyString,
  alternateSiteLanguage: Schema.Literals(["en", "pt"]),
});

const PublicBookIdentifierSchema = Schema.String.pipe(
  Schema.check(Schema.isUUID(7)),
  Schema.brand("BookIdentifier"),
);

const PublicBookIdentitySchema = Schema.Struct({
  id: PublicBookIdentifierSchema,
  title: Schema.NonEmptyString,
  authors: Schema.NonEmptyArray(
    Schema.Struct({ displayName: Schema.NonEmptyString, sortValue: Schema.NonEmptyString }),
  ),
});

export const HomePageDataSchema = Schema.Struct({
  page: Schema.Literal("home"),
  title: Schema.NonEmptyString,
  introduction: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  work: Schema.Struct({
    technologiesLabel: Schema.NonEmptyString,
    workingOn: Schema.Struct({
      heading: Schema.NonEmptyString,
      items: Schema.Array(
        Schema.Struct({
          title: Schema.NonEmptyString,
          description: Schema.NonEmptyString,
          technologies: Schema.Array(Schema.NonEmptyString),
        }),
      ),
    }),
    selected: Schema.Struct({
      heading: Schema.NonEmptyString,
      items: Schema.Array(
        Schema.Struct({
          title: Schema.NonEmptyString,
          context: Schema.NonEmptyString,
          points: Schema.Array(Schema.NonEmptyString),
          technologies: Schema.Array(Schema.NonEmptyString),
          link: Schema.optionalKey(
            Schema.Struct({ label: Schema.NonEmptyString, href: Schema.NonEmptyString }),
          ),
        }),
      ),
    }),
    experience: Schema.Struct({
      heading: Schema.NonEmptyString,
      items: Schema.Array(
        Schema.Struct({
          company: Schema.NonEmptyString,
          roles: Schema.Array(
            Schema.Struct({
              title: Schema.NonEmptyString,
              dates: Schema.NonEmptyString,
            }),
          ),
          description: Schema.NonEmptyString,
        }),
      ),
    }),
  }),
  setup: Schema.Struct({
    heading: Schema.NonEmptyString,
    updated: Schema.NonEmptyString,
    items: Schema.Array(Schema.NonEmptyString),
  }),
  contact: Schema.Struct({
    heading: Schema.NonEmptyString,
    links: Schema.Array(
      Schema.Struct({ label: Schema.NonEmptyString, href: Schema.NonEmptyString }),
    ),
  }),
  libraryPreview: Schema.Struct({
    heading: Schema.NonEmptyString,
    currentlyReadingLabel: Schema.NonEmptyString,
    favoritesLabel: Schema.NonEmptyString,
    nextReadsLabel: Schema.NonEmptyString,
    libraryLabel: Schema.NonEmptyString,
    libraryPathname: Schema.NonEmptyString,
    currentlyReading: Schema.optionalKey(Schema.Array(PublicBookIdentitySchema)),
    favorites: Schema.optionalKey(Schema.Array(PublicBookIdentitySchema)),
    nextReads: Schema.optionalKey(Schema.Array(PublicBookIdentitySchema)),
  }),
  socialPreviewImageAlt: Schema.NonEmptyString,
  navigation: NavigationDataSchema,
});

const PublicBookSchema = Schema.Struct({
  id: PublicBookIdentifierSchema,
  title: Schema.NonEmptyString,
  authors: Schema.NonEmptyArray(
    Schema.Struct({
      displayName: Schema.NonEmptyString,
      sortValue: Schema.NonEmptyString,
    }),
  ),
  alternateTitles: Schema.Array(Schema.NonEmptyString),
  inCollection: Schema.Boolean,
  readingStatus: Schema.Literals(["unread", "wantToRead", "reading", "read"]),
  completionCount: Schema.Int,
  rereading: Schema.Boolean,
  favorite: Schema.Boolean,
  nextRead: Schema.Boolean,
  relationship: Schema.optionalKey(Schema.NonEmptyString),
  reflections: Schema.optionalKey(Schema.Array(Schema.NonEmptyString)),
});

export const LibraryPageDataSchema = Schema.Struct({
  page: Schema.Literal("library"),
  title: Schema.NonEmptyString,
  heading: Schema.NonEmptyString,
  introduction: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  books: Schema.Array(PublicBookSchema),
  currentlyReading: Schema.optionalKey(Schema.Array(PublicBookIdentitySchema)),
  currentlyReadingLabel: Schema.NonEmptyString,
  searchLabel: Schema.NonEmptyString,
  searchPlaceholder: Schema.NonEmptyString,
  clearSearchLabel: Schema.NonEmptyString,
  showLabel: Schema.NonEmptyString,
  allBooksLabel: Schema.NonEmptyString,
  readLabel: Schema.NonEmptyString,
  favoritesLabel: Schema.NonEmptyString,
  nextReadsLabel: Schema.NonEmptyString,
  inCollectionLabel: Schema.NonEmptyString,
  orderByLabel: Schema.NonEmptyString,
  titleOrderLabel: Schema.NonEmptyString,
  authorOrderLabel: Schema.NonEmptyString,
  resultCountLabel: Schema.NonEmptyString,
  matchingResultCountLabel: Schema.NonEmptyString,
  emptyStateLabel: Schema.NonEmptyString,
  socialPreviewImageAlt: Schema.NonEmptyString,
  navigation: NavigationDataSchema,
});

export const PageDataSchema = Schema.Union([HomePageDataSchema, LibraryPageDataSchema]);

export const RootPageDataSchema = Schema.Struct({
  title: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  heading: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
  introduction: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
  languages: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
  homePathnames: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
  socialPreviewImageAlt: Schema.Struct({
    en: Schema.NonEmptyString,
    pt: Schema.NonEmptyString,
  }),
  missingPage: Schema.Struct({
    title: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
    heading: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
    description: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
    homeLabel: Schema.Struct({ en: Schema.NonEmptyString, pt: Schema.NonEmptyString }),
  }),
});

export type HomePageData = typeof HomePageDataSchema.Type;
export type LibraryPageData = typeof LibraryPageDataSchema.Type;
export type PageData = typeof PageDataSchema.Type;
export type RootPageData = typeof RootPageDataSchema.Type;
