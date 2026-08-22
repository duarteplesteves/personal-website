import { Schema } from "effect";
import { EquivalentTranslationSchema } from "./equivalent-translation.ts";

export const SiteContentSchema = Schema.Struct({
  navigation: Schema.Struct({
    home: EquivalentTranslationSchema,
    library: EquivalentTranslationSchema,
    primaryLabel: EquivalentTranslationSchema,
    skipLabel: EquivalentTranslationSchema,
    currentLanguageLabel: EquivalentTranslationSchema,
    switchLanguageLabel: EquivalentTranslationSchema,
  }),
  languages: Schema.Struct({
    en: Schema.NonEmptyString,
    pt: Schema.NonEmptyString,
  }),
  root: Schema.Struct({
    title: Schema.NonEmptyString,
    description: Schema.NonEmptyString,
    heading: EquivalentTranslationSchema,
    introduction: EquivalentTranslationSchema,
  }),
  library: Schema.Struct({
    heading: EquivalentTranslationSchema,
    description: EquivalentTranslationSchema,
    introduction: EquivalentTranslationSchema,
    currentlyReading: EquivalentTranslationSchema,
    favorite: EquivalentTranslationSchema,
    rereading: EquivalentTranslationSchema,
    readTimes: EquivalentTranslationSchema,
    inCollection: EquivalentTranslationSchema,
    favorites: EquivalentTranslationSchema,
    nextReads: EquivalentTranslationSchema,
    viewLibrary: EquivalentTranslationSchema,
  }),
});

export type SiteContent = typeof SiteContentSchema.Type;
