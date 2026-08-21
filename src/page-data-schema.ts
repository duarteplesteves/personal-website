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
});

export const LibraryPageDataSchema = Schema.Struct({
  page: Schema.Literal("library"),
  title: Schema.NonEmptyString,
  heading: Schema.NonEmptyString,
  introduction: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  books: Schema.Array(PublicBookSchema),
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
});

export type HomePageData = typeof HomePageDataSchema.Type;
export type LibraryPageData = typeof LibraryPageDataSchema.Type;
export type PageData = typeof PageDataSchema.Type;
export type RootPageData = typeof RootPageDataSchema.Type;
