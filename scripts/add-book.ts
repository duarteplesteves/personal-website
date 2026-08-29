import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { Console, Effect, FileSystem, Predicate, Schema } from "effect";
import { createInterface } from "node:readline/promises";
import { parse, stringify } from "yaml";
import { makeIdentifier } from "../src/repository/identifier.ts";
import { loadLibrary } from "../src/repository/load-library.ts";

class AddBookError extends Schema.TaggedError<AddBookError>()("AddBookError", {
  message: Schema.String,
}) {}

const program = Effect.gen(function* () {
  const input = createInterface({ input: process.stdin });
  const lines = input[Symbol.asyncIterator]();
  const ask = async (prompt: string) => {
    process.stdout.write(prompt);
    return ((await lines.next()).value ?? "").trim();
  };
  const answers = yield* Effect.tryPromise({
    try: async () => {
      const title = await ask("Title: ");
      const author = await ask("Author: ");
      const sort = (await ask(`Author sort value: [${author}] `)) || author;
      const accepted = (await ask("Create Book? [y/N] ")).toLowerCase();
      return { title, author, sort, accepted: accepted === "y" || accepted === "yes" };
    },
    catch: (cause) =>
      new AddBookError({ message: `Could not read Book details: ${String(cause)}` }),
  }).pipe(Effect.ensuring(Effect.sync(() => input.close())));

  if (!answers.title || !answers.author)
    return yield* new AddBookError({ message: "Title and author are required" });
  if (!answers.accepted) return yield* Console.log("Declined; no changes written");

  const fs = yield* FileSystem.FileSystem;
  const source = "content/library.yaml";
  const catalog: unknown = parse(yield* fs.readFileString(source));
  if (!Predicate.isObject(catalog) || !Array.isArray(catalog.books))
    return yield* new AddBookError({ message: "Library books must be an array" });
  const id = makeIdentifier();
  catalog.books.push({
    id,
    title: answers.title,
    authors: [{ displayName: answers.author, sortValue: answers.sort }],
  });
  const temporary = `${source}.add-book-${process.pid}`;
  yield* fs.writeFileString(temporary, stringify(catalog));
  const checked = yield* Effect.result(loadLibrary(temporary));
  if (checked._tag === "Failure") {
    yield* fs.remove(temporary);
    return yield* new AddBookError({ message: checked.failure.message });
  }
  yield* fs.rename(temporary, source);
  yield* Console.log(`Created Book ${id}`);
}).pipe(
  Effect.tapError((error) => Console.error(error.message)),
  Effect.provide(NodeFileSystem.layer),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
