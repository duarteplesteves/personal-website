import { Schema } from "effect";

export const EquivalentTranslationSchema = Schema.Struct({
  en: Schema.NonEmptyString.pipe(
    Schema.annotateKey({ messageMissingKey: "Missing English Equivalent translation" }),
  ),
  pt: Schema.NonEmptyString.pipe(
    Schema.annotateKey({ messageMissingKey: "Missing Portuguese Equivalent translation" }),
  ),
});
