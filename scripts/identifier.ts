import { NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import { makeIdentifier } from "../src/repository/identifier.ts";

NodeRuntime.runMain(Effect.sync(makeIdentifier).pipe(Effect.flatMap(Console.log)), {
  disableErrorReporting: true,
});
