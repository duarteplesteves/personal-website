import { randomBytes } from "node:crypto";

/** Create a UUIDv7 durable identifier. */
export const makeIdentifier = () => {
  const bytes = randomBytes(16);
  const timestamp = Date.now();
  for (let index = 5; index >= 0; index -= 1)
    bytes[index] = Math.floor(timestamp / 2 ** (8 * (5 - index))) & 0xff;
  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  bytes[8] = 0x80 | (bytes[8] & 0x3f);
  const value = bytes.toString("hex");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};
