import { Schema } from "effect";
import { EquivalentTranslationSchema } from "./equivalent-translation.ts";

export const HomeContentSchema = Schema.Struct({
  title: Schema.NonEmptyString,
  introduction: EquivalentTranslationSchema,
  description: EquivalentTranslationSchema,
});

export type HomeContent = typeof HomeContentSchema.Type;
