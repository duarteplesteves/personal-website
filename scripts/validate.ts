import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { selectCatalogEntries, validateCatalog } from "../src/validate-catalog.ts";

const program = selectCatalogEntries(process.argv.slice(2)).pipe(
  Effect.flatMap(validateCatalog),
  Effect.flatMap((count) =>
    Console.log(`Validated ${count} authored content source${count === 1 ? "" : "s"}`),
  ),
  Effect.tapError((error) => Console.error(error.message)),
  Effect.provide(NodeFileSystem.layer),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
