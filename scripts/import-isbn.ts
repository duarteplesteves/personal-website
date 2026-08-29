import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, FileSystem, Predicate, Schema } from "effect";
import { createInterface } from "node:readline/promises";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { parse, stringify } from "yaml";
import { loadLibrary } from "../src/repository/load-library.ts";
import { makeIdentifier } from "../src/repository/identifier.ts";
import { InvalidIsbn, parseIsbn } from "../src/repository/isbn.ts";

class ImportError extends Schema.TaggedError<ImportError>()("ImportError", {
  message: Schema.String,
}) {}

type Fields = {
  readonly title?: string;
  readonly publisher?: string;
  readonly publicationDate?: string;
  readonly pageCount?: number;
};
type Candidate = { readonly provider: string; readonly isbn: string; readonly fields: Fields };

const option = (name: string) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
};
const text = (value: unknown) =>
  Predicate.isString(value) && value.trim() ? value.trim() : undefined;
const firstText = (value: unknown) => (Array.isArray(value) ? text(value[0]) : text(value));

const openLibraryCandidateFrom = (value: unknown): Candidate | undefined => {
  if (!Predicate.isObject(value)) return undefined;
  const records = value.records;
  if (Array.isArray(records)) return openLibraryCandidateFrom(records[0]);
  const isbn = firstText(value.isbn ?? value.ISBN ?? value.isbn_13 ?? value.isbn_10);
  if (!isbn) return undefined;
  const pages = value.number_of_pages ?? value.pageCount;
  return {
    provider: "Open Library",
    isbn: isbn.replace(/[\s-]/g, ""),
    fields: {
      title: text(value.title),
      publisher: firstText(value.publisher ?? value.publishers),
      publicationDate: text(value.publicationDate ?? value.publish_date ?? value.publishDate),
      pageCount:
        Predicate.isNumber(pages) && Number.isInteger(pages) && pages > 0 ? pages : undefined,
    },
  };
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
});

const xmlText = (value: unknown) =>
  text(Predicate.isObject(value) && "#text" in value ? value["#text"] : value);

const bnpCandidateFrom = (body: string): Candidate | undefined => {
  if (/<!DOCTYPE/i.test(body)) throw new Error("DOCTYPE is not allowed");
  const checked = XMLValidator.validate(body);
  if (checked !== true) throw new Error(checked.err.msg);
  const document: unknown = xmlParser.parse(body);
  if (!Predicate.isObject(document)) throw new Error("Expected an XML document");
  if (Predicate.isObject(document["urn-response"]) && document["urn-response"].error !== undefined)
    return undefined;
  const collection = document.modsCollection;
  const mods = Predicate.isObject(collection) ? collection.mods : undefined;
  if (!Predicate.isObject(mods)) throw new Error("Expected a MODS record");
  const identifiers = Array.isArray(mods.identifier) ? mods.identifier : [mods.identifier];
  const isbnValue = identifiers.find(
    (identifier) => Predicate.isObject(identifier) && identifier.type === "isbn",
  );
  const isbn = xmlText(isbnValue)?.replace(/[\s-]/g, "");
  if (!isbn) throw new Error("Expected a MODS ISBN identifier");
  const parsedIsbn = parseIsbn(isbn);
  if (parsedIsbn instanceof InvalidIsbn) throw new Error(parsedIsbn.message);
  const titleInfo = mods.titleInfo;
  const title = Predicate.isObject(titleInfo)
    ? xmlText(titleInfo.title)?.replace(/[\u0098\u009c]|&#x(?:98|9c);/gi, "")
    : undefined;
  const subtitle = Predicate.isObject(titleInfo) ? xmlText(titleInfo.subtitle) : undefined;
  const origin = mods.originInfo;
  const physical = mods.physicalDescription;
  const extent = Predicate.isObject(physical) ? xmlText(physical.extent) : undefined;
  const pages = extent?.match(/^(\d+)\s+p\./)?.[1];
  return {
    provider: "BNP",
    isbn: parsedIsbn,
    fields: {
      title: title ? `${title}${subtitle ? `: ${subtitle}` : ""}` : undefined,
      publisher: Predicate.isObject(origin) ? xmlText(origin.publisher) : undefined,
      publicationDate: Predicate.isObject(origin) ? xmlText(origin.dateIssued) : undefined,
      pageCount: pages ? Number(pages) : undefined,
    },
  };
};

const confirm = Effect.fn("confirm")(function* () {
  const input = createInterface({ input: process.stdin, output: process.stdout });
  const answer = yield* Effect.tryPromise({
    try: () => input.question("Accept this Edition? [y/N] "),
    catch: (cause) => new ImportError({ message: `Could not read confirmation: ${String(cause)}` }),
  }).pipe(
    Effect.catchTag("ImportError", () => Effect.succeed("")),
    Effect.ensuring(Effect.sync(() => input.close())),
  );
  return answer.trim().toLowerCase() === "y" || answer.trim().toLowerCase() === "yes";
});

const request = Effect.fn("request")(function* (
  provider: string,
  template: string,
  isbn: string,
  decode: (body: string) => Candidate | undefined,
) {
  const url = template.replace("{isbn}", encodeURIComponent(isbn));
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = yield* Effect.result(
      Effect.tryPromise({
        try: () => fetch(url, { signal: AbortSignal.timeout(2_500) }),
        catch: (cause) =>
          new ImportError({ message: `${provider} temporary failure: ${String(cause)}` }),
      }),
    );
    if (result._tag === "Success") {
      if (result.success.status === 404) return undefined;
      if (result.success.ok) {
        const body = yield* Effect.tryPromise({
          try: () => result.success.text(),
          catch: (cause) =>
            new ImportError({ message: `${provider} malformed response: ${String(cause)}` }),
        });
        return yield* Effect.try({
          try: () => decode(body),
          catch: (cause) =>
            new ImportError({ message: `${provider} malformed response: ${String(cause)}` }),
        });
      }
      if (result.success.status < 500)
        return yield* new ImportError({
          message: `${provider} failed with HTTP ${result.success.status}`,
        });
    }
  }
  return yield* new ImportError({ message: `${provider} temporary failure after 2 attempts` });
});

const program = Effect.gen(function* () {
  const parsed = parseIsbn(process.argv[2] ?? "");
  if (parsed instanceof InvalidIsbn) return yield* parsed;
  const fs = yield* FileSystem.FileSystem;
  const source = "content/library.yaml";
  const original = yield* fs.readFileString(source);
  const catalog: unknown = parse(original);
  if (!Predicate.isObject(catalog))
    return yield* new ImportError({ message: "Library must be a YAML object" });
  if (catalog.editions === undefined) catalog.editions = [];
  if (!Array.isArray(catalog.editions))
    return yield* new ImportError({ message: "Library editions must be an array" });

  const editionId = option("--edition");
  const editionIndex = editionId
    ? catalog.editions.findIndex(
        (edition) => Predicate.isObject(edition) && edition.id === editionId,
      )
    : -1;
  if (editionId && editionIndex < 0)
    return yield* new ImportError({ message: `Edition ${editionId} does not exist` });
  const existing = editionIndex < 0 ? undefined : catalog.editions[editionIndex];
  const bookId =
    option("--book") ?? (Predicate.isObject(existing) ? text(existing.bookId) : undefined);
  const language =
    option("--language") ?? (Predicate.isObject(existing) ? text(existing.language) : undefined);
  const format =
    option("--format") ?? (Predicate.isObject(existing) ? text(existing.format) : undefined);
  if (!bookId || !language || !format)
    return yield* new ImportError({
      message:
        "Usage: import-isbn ISBN (--edition ID | --book ID --language TAG --format FORMAT) [--accept]",
    });

  const bnpUrl =
    process.env.ISBN_BNP_URL ?? "https://urn.bnportugal.gov.pt/isbn/mods/xml?id={isbn}";
  const openUrl = process.env.ISBN_OPEN_LIBRARY_URL ?? "https://openlibrary.org/isbn/{isbn}.json";
  const bnp = yield* request("BNP", bnpUrl, parsed, bnpCandidateFrom).pipe(
    Effect.catchTag("ImportError", (error) =>
      Console.error(error.message).pipe(Effect.as(undefined)),
    ),
  );
  const open = yield* request("Open Library", openUrl, parsed, (body) =>
    openLibraryCandidateFrom(JSON.parse(body)),
  ).pipe(
    Effect.catchTag("ImportError", (error) =>
      Console.error(error.message).pipe(Effect.as(undefined)),
    ),
  );
  for (const candidate of [bnp, open]) {
    if (candidate !== undefined && candidate.isbn !== parsed)
      yield* Console.error(
        `${candidate.provider} identifier mismatch: expected ${parsed}, received ${candidate.isbn}`,
      );
  }
  const candidates = [bnp, open].filter(
    (candidate): candidate is Candidate => candidate !== undefined && candidate.isbn === parsed,
  );
  if (candidates.length === 0)
    return yield* new ImportError({
      message: "No provider returned a candidate with the requested identifier",
    });

  const fields = ["title", "publisher", "publicationDate", "pageCount"] as const;
  const corrections = {
    title: option("--title"),
    publisher: option("--publisher"),
    publicationDate: option("--publication-date"),
    pageCount: option("--page-count"),
  };
  const chosen: Record<string, string | number> = {};
  for (const field of fields) {
    const values = candidates.flatMap((candidate) =>
      candidate.fields[field] === undefined
        ? []
        : [{ provider: candidate.provider, value: candidate.fields[field] }],
    );
    const conflict = values.length > 1 && new Set(values.map(({ value }) => value)).size > 1;
    if (conflict)
      yield* Console.log(
        `${field}: CONFLICT ${values.map(({ provider, value }) => `${value} (${provider})`).join(" / ")}`,
      );
    const correction = corrections[field];
    if (correction !== undefined) {
      chosen[field] = field === "pageCount" ? Number(correction) : correction;
      yield* Console.log(`${field}: ${correction} (manual correction)`);
      continue;
    }
    if (conflict && !language.toLowerCase().startsWith("pt"))
      return yield* new ImportError({
        message: `Resolve the ${field} conflict with --${field === "publicationDate" ? "publication-date" : field === "pageCount" ? "page-count" : field}`,
      });
    const preferred = values.find(({ provider }) => provider === "BNP") ?? values[0];
    if (preferred) {
      chosen[field] = preferred.value;
      yield* Console.log(`${field}: ${preferred.value} (${preferred.provider})`);
    }
  }
  if (!process.argv.includes("--accept") && !(yield* confirm())) {
    yield* Console.log("Declined; no changes written");
    return;
  }
  if (!chosen.title)
    return yield* new ImportError({ message: "The reviewed Edition requires a title" });

  const edition = {
    ...(Predicate.isObject(existing) ? existing : {}),
    id: editionId ?? makeIdentifier(),
    bookId,
    title: chosen.title,
    language,
    format,
    isbn: parsed,
    ...(chosen.publisher ? { publisher: chosen.publisher } : {}),
    ...(chosen.publicationDate ? { publicationDate: chosen.publicationDate } : {}),
    ...(chosen.pageCount ? { pageCount: chosen.pageCount } : {}),
  };
  if (editionIndex < 0) catalog.editions.push(edition);
  else catalog.editions[editionIndex] = edition;
  const temporary = `${source}.isbn-import-${process.pid}`;
  yield* fs.writeFileString(temporary, stringify(catalog));
  const validated = yield* Effect.result(loadLibrary(temporary));
  if (validated._tag === "Failure") {
    yield* fs.remove(temporary);
    return yield* new ImportError({ message: validated.failure.message });
  }
  yield* fs.rename(temporary, source);
  yield* Console.log(`Accepted reviewed Edition into ${source}`);
}).pipe(
  Effect.tapError((error) => Console.error(error.message)),
  Effect.provide(NodeFileSystem.layer),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
