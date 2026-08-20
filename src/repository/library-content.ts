import { Schema } from "effect";

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

const EditionSchema = Schema.Struct({
  id: DurableIdentifierSchema,
  bookId: DurableIdentifierSchema,
  title: Schema.NonEmptyString,
  language: Schema.NonEmptyString,
  format: Schema.Literals(["hardcover", "paperback", "ebook", "audiobook"]),
});

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
