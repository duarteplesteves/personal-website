import { Schema } from "effect";
import { IsoPartialDate, SafeUrl } from "./authored-fields.ts";
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

const ExperienceMonthSchema = IsoPartialDate.pipe(Schema.check(Schema.isPattern(/^\d{4}-\d{2}$/)));

const ExperienceEntrySchema = Schema.Struct({
  company: Schema.NonEmptyString,
  roles: Schema.NonEmptyArray(
    Schema.Struct({
      title: EquivalentTranslationSchema,
      startedOn: ExperienceMonthSchema,
      endedOn: Schema.optionalKey(ExperienceMonthSchema),
      current: Schema.Boolean,
    }),
  ),
  description: EquivalentTranslationSchema,
}).check(
  Schema.makeFilter((entry) => {
    const issues: Array<Schema.FilterIssue> = [];
    entry.roles.forEach((role, index) => {
      if (role.current && role.endedOn !== undefined) {
        issues.push({
          path: ["roles", index, "endedOn"],
          issue: "current role cannot have an end date",
        });
      }
      if (!role.current && role.endedOn === undefined) {
        issues.push({
          path: ["roles", index, "endedOn"],
          issue: "former role requires an end date",
        });
      }
      if (role.endedOn !== undefined && role.startedOn > role.endedOn) {
        issues.push({
          path: ["roles", index, "endedOn"],
          issue: "end date must not precede start date",
        });
      }
    });
    return issues.length === 0 ? true : issues;
  }),
);

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
    experience: Schema.Struct({
      heading: EquivalentTranslationSchema,
      present: EquivalentTranslationSchema,
      items: Schema.NonEmptyArray(ExperienceEntrySchema),
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
