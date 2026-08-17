import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { loadHome } from "../src/load-home.ts";

const source = process.argv[2] ?? "content/home.yaml";

const program = loadHome(source).pipe(
  Effect.flatMap(() => Console.log(`Validated bilingual Home content: ${source}`)),
  Effect.tapError((error) =>
    Console.error(
      `Home validation failed in ${source}:\n${error instanceof Error ? error.message : String(error)}`,
    ),
  ),
  Effect.provide(NodeFileSystem.layer),
);

NodeRuntime.runMain(program, { disableErrorReporting: true });
