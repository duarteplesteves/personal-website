import { Schema } from "effect";

const EquivalentTranslation = Schema.Struct({
  en: Schema.NonEmptyString,
  pt: Schema.NonEmptyString,
});

export const HomeContentSchema = Schema.Struct({
  title: Schema.NonEmptyString,
  introduction: EquivalentTranslation,
  description: EquivalentTranslation,
});

export type HomeContent = typeof HomeContentSchema.Type;
