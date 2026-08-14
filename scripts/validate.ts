import { Console, Effect } from "effect";
import { loadHome } from "../src/load-home.ts";

const source = process.argv[2] ?? "content/home.json";

const program = loadHome(source).pipe(
  Effect.flatMap(() => Console.log(`Validated bilingual Home content: ${source}`)),
);

Effect.runPromise(program).catch((error) => {
  console.error(`Home validation failed in ${source}:\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
