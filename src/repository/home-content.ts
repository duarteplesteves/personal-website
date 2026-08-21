import { Schema } from "effect";
import { SafeUrl } from "./authored-fields.ts";
import { EquivalentTranslationSchema } from "./equivalent-translation.ts";

export const HomeContentSchema = Schema.Struct({
  title: Schema.NonEmptyString,
  introduction: EquivalentTranslationSchema,
  description: EquivalentTranslationSchema,
  setup: Schema.Struct({
    heading: EquivalentTranslationSchema,
    updated: EquivalentTranslationSchema,
    items: Schema.NonEmptyArray(EquivalentTranslationSchema),
  }),
  contact: Schema.Struct({
    heading: EquivalentTranslationSchema,
    links: Schema.NonEmptyArray(
      Schema.Struct({ label: EquivalentTranslationSchema, href: SafeUrl }),
    ),
  }),
});

export type HomeContent = typeof HomeContentSchema.Type;
