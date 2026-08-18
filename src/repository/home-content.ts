import { Schema } from "effect";

const EquivalentTranslation = Schema.Struct({
  en: Schema.NonEmptyString.pipe(
    Schema.annotateKey({ messageMissingKey: "Missing English Equivalent translation" }),
  ),
  pt: Schema.NonEmptyString.pipe(
    Schema.annotateKey({ messageMissingKey: "Missing Portuguese Equivalent translation" }),
  ),
});

export const HomeContentSchema = Schema.Struct({
  title: Schema.NonEmptyString,
  introduction: EquivalentTranslation,
  description: EquivalentTranslation,
});

export type HomeContent = typeof HomeContentSchema.Type;
