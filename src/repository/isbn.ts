import { Schema } from "effect";

/** A normalized ISBN-13. */
const Isbn13Schema = Schema.String.pipe(Schema.brand("Isbn13"));
export type Isbn13 = typeof Isbn13Schema.Type;

/** The supplied value is not a valid ISBN-10 or ISBN-13. */
export class InvalidIsbn extends Schema.TaggedError<InvalidIsbn>()("InvalidIsbn", {
  message: Schema.String,
}) {}

const checksum13 = (value: string) =>
  value
    .split("")
    .slice(0, 12)
    .reduce((sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);

/** Normalize an ISBN-10 or ISBN-13 and verify its checksum. */
export const parseIsbn = (input: string): Isbn13 | InvalidIsbn => {
  const value = input.replace(/[\s-]/g, "").toUpperCase();
  if (/^\d{9}[\dX]$/.test(value)) {
    const sum = value
      .split("")
      .reduce(
        (total, digit, index) => total + (digit === "X" ? 10 : Number(digit)) * (10 - index),
        0,
      );
    if (sum % 11 !== 0) return new InvalidIsbn({ message: "Invalid ISBN-10 checksum" });
    const base = `978${value.slice(0, 9)}`;
    return Schema.decodeUnknownSync(Isbn13Schema)(`${base}${(10 - (checksum13(base) % 10)) % 10}`);
  }
  if (!/^\d{13}$/.test(value) || (10 - (checksum13(value) % 10)) % 10 !== Number(value[12]))
    return new InvalidIsbn({ message: "Invalid ISBN-13 checksum" });
  return Schema.decodeUnknownSync(Isbn13Schema)(value);
};
