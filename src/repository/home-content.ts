import { Schema } from "effect";
import { SafeUrl } from "./authored-fields.ts";
import { EquivalentTranslationSchema } from "./equivalent-translation.ts";

const WorkingOnEntrySchema = Schema.Struct({
  title: EquivalentTranslationSchema,
  description: EquivalentTranslationSchema,
});

const SelectedWorkEntrySchema = Schema.Struct({
  title: EquivalentTranslationSchema,
  context: EquivalentTranslationSchema,
  description: EquivalentTranslationSchema,
});

/** Authored content for the Home document. */
export const HomeContentSchema = Schema.Struct({
  title: Schema.NonEmptyString,
  introduction: EquivalentTranslationSchema,
  description: EquivalentTranslationSchema,
  work: Schema.Struct({
    workingOn: Schema.Struct({
      heading: EquivalentTranslationSchema,
      items: Schema.NonEmptyArray(WorkingOnEntrySchema),
    }),
    selected: Schema.Struct({
      heading: EquivalentTranslationSchema,
      items: Schema.NonEmptyArray(SelectedWorkEntrySchema),
    }),
  }),
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

/** Parsed Home content. */
export type HomeContent = typeof HomeContentSchema.Type;
