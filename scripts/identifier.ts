import { NodeRuntime } from "@effect/platform-node";
import { randomBytes } from "node:crypto";
import { Console, DateTime, Effect } from "effect";

const toHex = (byte: number) => byte.toString(16).padStart(2, "0");

const identifier = Effect.gen(function* () {
  const now = yield* DateTime.now;
  const timestamp = now.epochMilliseconds;
  const random = yield* Effect.sync(() => randomBytes(10));
  const bytes = new Uint8Array(16);

  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Math.floor(timestamp / 2 ** (8 * (5 - index))) & 0xff;
  }
  bytes[6] = 0x70 | (random[0] & 0x0f);
  bytes[7] = random[1];
  bytes[8] = 0x80 | (random[2] & 0x3f);
  bytes.set(random.subarray(3), 9);

  const value = Array.from(bytes, toHex).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
});

NodeRuntime.runMain(identifier.pipe(Effect.flatMap(Console.log)), {
  disableErrorReporting: true,
});
