import { Effect, Schema } from "effect";
import { PageDataSchema, RootPageDataSchema } from "./page-data-schema.ts";
import { projectPage, projectRoot } from "./project-site.ts";
import { sitePublication } from "./publication.ts";
import { loadCatalog } from "./repository/catalog.ts";

/** Compile authored content into the typed pages needed to render the site. */
export const compileSite = Effect.fn("compileSite")(function* () {
  const { home, library, site } = yield* loadCatalog();
  const pages = yield* Effect.forEach(sitePublication, (publication) =>
    Schema.decodeUnknownEffect(PageDataSchema, {
      errors: "all",
      onExcessProperty: "error",
    })(projectPage(home, library, site, publication)).pipe(
      Effect.map((data) => ({ publication, data })),
    ),
  );
  const root = yield* Schema.decodeUnknownEffect(RootPageDataSchema, {
    errors: "all",
    onExcessProperty: "error",
  })(projectRoot(site));

  return { pages, root };
});
