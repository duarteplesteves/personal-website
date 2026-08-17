import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { authoredCatalogSources, validateCatalog } from "../src/validate-catalog.ts";

const requestedSources = process.argv.slice(2);
const sources = requestedSources.length === 0 ? authoredCatalogSources : requestedSources;

const program = validateCatalog(sources).pipe(
  Effect.flatMap((count) =>
    Console.log(`Validated ${count} authored content source${count === 1 ? "" : "s"}`),
  ),
  Effect.tapError((error) => Console.error(error.message)),
  Effect.provide(NodeFileSystem.layer),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
