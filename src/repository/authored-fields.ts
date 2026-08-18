import { DateTime, Option, Schema } from "effect";

const isoPartialDatePattern = /^\d{4}(?:-\d{2}(?:-\d{2})?)?$/;

export const IsoPartialDate = Schema.String.pipe(
  Schema.check(
    Schema.makeFilter(
      (value) => {
        if (!isoPartialDatePattern.test(value)) return false;
        const parsed = Option.getOrUndefined(DateTime.make(value));
        return parsed !== undefined && DateTime.formatIsoDate(parsed).startsWith(value);
      },
      { expected: "a valid ISO partial date (YYYY, YYYY-MM, or YYYY-MM-DD)" },
    ),
  ),
);

export const SafeUrl = Schema.URLFromString.pipe(
  Schema.check(
    Schema.makeFilter(
      (url) => {
        if (url.protocol !== "https:" && url.protocol !== "mailto:") return false;
        if (url.username !== "" || url.password !== "") return false;
        return !/%0a|%0d/i.test(url.href);
      },
      { expected: "a well-formed https or mailto URL without credentials" },
    ),
  ),
);
