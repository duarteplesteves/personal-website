import { Schema } from "effect";
import { IsoPartialDate } from "./authored-fields.ts";
import { EquivalentTranslationSchema } from "./equivalent-translation.ts";

const DurableIdentifierSchema = Schema.String.pipe(Schema.check(Schema.isUUID(7)));
const BookIdentifierSchema = DurableIdentifierSchema.pipe(Schema.brand("BookIdentifier"));
const EditionIdentifierSchema = DurableIdentifierSchema.pipe(Schema.brand("EditionIdentifier"));
const ReadingIdentifierSchema = DurableIdentifierSchema.pipe(Schema.brand("ReadingIdentifier"));
const ReflectionIdentifierSchema = DurableIdentifierSchema.pipe(
  Schema.brand("ReflectionIdentifier"),
);

const AuthorCreditSchema = Schema.Struct({
  displayName: Schema.NonEmptyString,
  sortValue: Schema.NonEmptyString,
});

const BookSchema = Schema.Struct({
  id: BookIdentifierSchema,
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

const EditionFields = {
  id: EditionIdentifierSchema,
  bookId: BookIdentifierSchema,
  title: Schema.NonEmptyString,
  language: Bcp47LanguageSchema,
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
  inCollection: Schema.optionalKey(Schema.Boolean),
};

const EditionSchema = Schema.Union([
  Schema.Struct({
    ...EditionFields,
    format: Schema.Literals(["hardcover", "paperback", "ebook"]),
    pageCount: Schema.optionalKey(PositiveIntegerSchema),
  }),
  Schema.Struct({
    ...EditionFields,
    format: Schema.Literal("audiobook"),
    durationMinutes: Schema.optionalKey(PositiveIntegerSchema),
  }),
]);

const ReadingSchema = Schema.Struct({
  id: ReadingIdentifierSchema,
  bookId: BookIdentifierSchema,
  editionIds: Schema.optionalKey(Schema.NonEmptyArray(EditionIdentifierSchema)),
  state: Schema.Literals(["active", "completed", "abandoned"]),
  startedOn: Schema.optionalKey(IsoPartialDate),
  endedOn: Schema.optionalKey(IsoPartialDate),
});

const ReflectionSchema = Schema.Struct({
  id: ReflectionIdentifierSchema,
  bookId: BookIdentifierSchema,
  readingId: Schema.optionalKey(ReadingIdentifierSchema),
  text: EquivalentTranslationSchema,
});

export const LibraryContentSchema = Schema.Struct({
  books: Schema.Array(BookSchema),
  editions: Schema.optionalKey(Schema.Array(EditionSchema)),
  readings: Schema.optionalKey(Schema.Array(ReadingSchema)),
  reflections: Schema.optionalKey(Schema.Array(ReflectionSchema)),
  wantToRead: Schema.optionalKey(Schema.Array(BookIdentifierSchema)),
  favorites: Schema.optionalKey(Schema.Array(BookIdentifierSchema)),
  nextReads: Schema.optionalKey(Schema.Array(BookIdentifierSchema)),
}).check(
  Schema.makeFilter((library) => {
    const bookIds = new Set(library.books.map((book) => book.id));
    const seen = new Set<string>();
    const issues: Array<Schema.FilterIssue> = [];

    for (const [recordType, records] of [
      ["books", library.books],
      ["editions", library.editions ?? []],
      ["readings", library.readings ?? []],
      ["reflections", library.reflections ?? []],
    ] as const) {
      records.forEach((record, index) => {
        if (seen.has(record.id)) {
          issues.push({ path: [recordType, index, "id"], issue: "duplicate durable identifier" });
        }
        seen.add(record.id);
      });
    }
    const editions = new Map((library.editions ?? []).map((edition) => [edition.id, edition]));
    library.editions?.forEach((edition, index) => {
      if (!bookIds.has(edition.bookId)) {
        issues.push({
          path: ["editions", index, "bookId"],
          issue: "referenced Book does not exist",
        });
      }
    });

    const activeByBook = new Map<string, number>();
    library.readings?.forEach((reading, index) => {
      if (!bookIds.has(reading.bookId)) {
        issues.push({
          path: ["readings", index, "bookId"],
          issue: "referenced Book does not exist",
        });
      }
      if (reading.state === "active") {
        activeByBook.set(reading.bookId, (activeByBook.get(reading.bookId) ?? 0) + 1);
        if (reading.endedOn !== undefined) {
          issues.push({
            path: ["readings", index, "endedOn"],
            issue: "active Reading cannot have an end date",
          });
        }
      }
      if (reading.startedOn && reading.endedOn && reading.startedOn > reading.endedOn) {
        issues.push({
          path: ["readings", index, "endedOn"],
          issue: "end date must not precede start date",
        });
      }
      reading.editionIds?.forEach((editionId, editionIndex) => {
        const edition = editions.get(editionId);
        if (!edition) {
          issues.push({
            path: ["readings", index, "editionIds", editionIndex],
            issue: "referenced Edition does not exist",
          });
        } else if (edition.bookId !== reading.bookId) {
          issues.push({
            path: ["readings", index, "editionIds", editionIndex],
            issue: "referenced Edition belongs to a different Book",
          });
        }
      });
    });
    const readings = new Map((library.readings ?? []).map((reading) => [reading.id, reading]));
    library.reflections?.forEach((reflection, index) => {
      if (!bookIds.has(reflection.bookId)) {
        issues.push({
          path: ["reflections", index, "bookId"],
          issue: "referenced Book does not exist",
        });
      }
      if (reflection.readingId !== undefined) {
        const reading = readings.get(reflection.readingId);
        if (!reading) {
          issues.push({
            path: ["reflections", index, "readingId"],
            issue: "referenced Reading does not exist",
          });
        } else if (reading.bookId !== reflection.bookId) {
          issues.push({
            path: ["reflections", index, "readingId"],
            issue: "referenced Reading belongs to a different Book",
          });
        }
      }
    });

    for (const [bookId, count] of activeByBook) {
      if (count > 1)
        issues.push({
          path: ["readings"],
          issue: `Book ${bookId} has more than one active Reading`,
        });
    }
    if (activeByBook.size > 3)
      issues.push({ path: ["readings"], issue: "at most three Books may have active Readings" });

    for (const [field, ids, limit] of [
      ["favorites", library.favorites ?? [], 5],
      ["nextReads", library.nextReads ?? [], 3],
      ["wantToRead", library.wantToRead ?? [], Number.POSITIVE_INFINITY],
    ] as const) {
      if (ids.length > limit)
        issues.push({ path: [field], issue: `at most ${limit} Books are allowed` });
      const unique = new Set(ids);
      if (unique.size !== ids.length)
        issues.push({ path: [field], issue: "duplicate Book reference" });
      ids.forEach((id, index) => {
        if (!bookIds.has(id))
          issues.push({ path: [field, index], issue: "referenced Book does not exist" });
      });
    }
    const readingsByBook = Map.groupBy(library.readings ?? [], (reading) => reading.bookId);
    library.wantToRead?.forEach((bookId, index) => {
      if (readingsByBook.get(bookId)?.some((reading) => reading.state !== "abandoned")) {
        issues.push({
          path: ["wantToRead", index],
          issue: "Want to read is only available before an active or completed Reading",
        });
      }
    });
    library.nextReads?.forEach((bookId, index) => {
      if (readingsByBook.get(bookId)?.some((reading) => reading.state !== "abandoned")) {
        issues.push({
          path: ["nextReads", index],
          issue: "Next reads Book cannot have an active or completed Reading",
        });
      }
    });
    return issues;
  }),
);

export type LibraryContent = typeof LibraryContentSchema.Type;
