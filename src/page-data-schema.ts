import { Schema } from "effect";

export const HomePageDataSchema = Schema.Struct({
  title: Schema.NonEmptyString,
  introduction: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
});
