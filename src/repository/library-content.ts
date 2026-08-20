import { Schema } from "effect";
import { IsoPartialDate } from "./authored-fields.ts";

const DurableIdentifierSchema = Schema.String.pipe(Schema.check(Schema.isUUID(7)));

const AuthorCreditSchema = Schema.Struct({
  displayName: Schema.NonEmptyString,
  sortValue: Schema.NonEmptyString,
});

const BookSchema = Schema.Struct({
  id: DurableIdentifierSchema,
  title: Schema.NonEmptyString,
  authors: Schema.NonEmptyArray(AuthorCreditSchema),
  alternateTitles: Schema.optionalKey(Schema.Array(Schema.NonEmptyString)),
});

const Bcp47LanguageSchema = Schema.NonEmptyString.pipe(
  Schema.check(
    Schema.makeFilter(
      (value) => {
        try {
          new Intl.Locale(value);
          return true;
        } catch {
          return false;
        }
      },
      { expected: "a BCP 47 language tag" },
    ),
  ),
);

const PositiveIntegerSchema = Schema.Int.pipe(Schema.check(Schema.isGreaterThan(0)));

const EditionSchema = Schema.Struct({
  id: DurableIdentifierSchema,
  bookId: DurableIdentifierSchema,
  title: Schema.NonEmptyString,
  language: Bcp47LanguageSchema,
  format: Schema.Literals(["hardcover", "paperback", "ebook", "audiobook"]),
  publisher: Schema.optionalKey(Schema.NonEmptyString),
  publicationDate: Schema.optionalKey(IsoPartialDate),
  isbn: Schema.optionalKey(Schema.NonEmptyString),
  contributors: Schema.optionalKey(
    Schema.Array(
      Schema.Struct({
        displayName: Schema.NonEmptyString,
        role: Schema.NonEmptyString,
      }),
    ),
  ),
  pageCount: Schema.optionalKey(PositiveIntegerSchema),
  durationMinutes: Schema.optionalKey(PositiveIntegerSchema),
  inCollection: Schema.optionalKey(Schema.Boolean),
}).check(
  Schema.makeFilter((edition) => {
    const issues: Array<Schema.FilterIssue> = [];
    if (edition.pageCount !== undefined && edition.format === "audiobook") {
      issues.push({
        path: ["pageCount"],
        issue: "page count is only valid for print or ebook Editions",
      });
    }
    if (edition.durationMinutes !== undefined && edition.format !== "audiobook") {
      issues.push({
        path: ["durationMinutes"],
        issue: "duration is only valid for audiobook Editions",
      });
    }
    return issues;
  }),
);

export const LibraryContentSchema = Schema.Struct({
  books: Schema.Array(BookSchema),
  editions: Schema.optionalKey(Schema.Array(EditionSchema)),
}).check(
  Schema.makeFilter((library) => {
    const bookIds = new Set(library.books.map((book) => book.id));
    const seen = new Set<string>();
    const issues: Array<Schema.FilterIssue> = [];

    for (const [recordType, records] of [
      ["books", library.books],
      ["editions", library.editions ?? []],
    ] as const) {
      records.forEach((record, index) => {
        if (seen.has(record.id)) {
          issues.push({ path: [recordType, index, "id"], issue: "duplicate durable identifier" });
        }
        seen.add(record.id);
      });
    }
    library.editions?.forEach((edition, index) => {
      if (!bookIds.has(edition.bookId)) {
        issues.push({
          path: ["editions", index, "bookId"],
          issue: "referenced Book does not exist",
        });
      }
    });
    return issues;
  }),
);

export type LibraryContent = typeof LibraryContentSchema.Type;
