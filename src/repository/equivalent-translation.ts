import { Schema } from "effect";

/** Build an Equivalent translation schema for a text schema. */
export const makeEquivalentTranslationSchema = <S extends Schema.Top>(text: S) =>
  Schema.Struct({
    en: text.pipe(
      Schema.annotateKey({ messageMissingKey: "Missing English Equivalent translation" }),
    ),
    pt: text.pipe(
      Schema.annotateKey({ messageMissingKey: "Missing Portuguese Equivalent translation" }),
    ),
  });

/** A required non-empty English and Portuguese Equivalent translation. */
export const EquivalentTranslationSchema = makeEquivalentTranslationSchema(Schema.NonEmptyString);
