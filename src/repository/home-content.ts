import { Schema } from "effect";
import { IsoPartialDate, SafeUrl } from "./authored-fields.ts";
import { EquivalentTranslationSchema } from "./equivalent-translation.ts";

const workEntryFields = {
  title: EquivalentTranslationSchema,
  link: Schema.optionalKey(SafeUrl),
};

const WorkEntrySchema = Schema.Union([
  Schema.Struct({ ...workEntryFields, description: EquivalentTranslationSchema }),
  Schema.Struct({
    ...workEntryFields,
    points: Schema.NonEmptyArray(EquivalentTranslationSchema),
    technologies: Schema.NonEmptyArray(Schema.NonEmptyString),
  }),
]);

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
    heading: EquivalentTranslationSchema,
    technologiesLabel: EquivalentTranslationSchema,
    items: Schema.NonEmptyArray(WorkEntrySchema),
    experience: Schema.Struct({
      heading: EquivalentTranslationSchema,
      present: EquivalentTranslationSchema,
      items: Schema.NonEmptyArray(ExperienceEntrySchema),
    }),
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
