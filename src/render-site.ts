import { prerender } from "octane/static";
import { Home } from "./home.tsrx";
import { languageControlEnhancement, rootLanguageResolver } from "./inline-enhancements.ts";
import { Library } from "./library.tsrx";
import type { HomePageData, LibraryPageData, RootPageData } from "./page-data-schema.ts";
import type { Publication } from "./publication.ts";
import { Root } from "./root.tsrx";
import { siteStyles } from "./site-styles.ts";

const document = (
  language: string,
  rendered: Awaited<ReturnType<typeof prerender>>,
  enhancement: string,
) =>
  `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${rendered.head ?? ""}${rendered.css}<style>${siteStyles}</style></head><body>${rendered.html}<script>${enhancement}</script></body></html>`;

export async function renderHome(content: HomePageData, publication: Publication) {
  const rendered = await prerender(Home, { content }, { headChannel: "separate" });
  return document(publication.documentLanguage, rendered, languageControlEnhancement);
}

export async function renderLibrary(content: LibraryPageData, publication: Publication) {
  const rendered = await prerender(Library, { content }, { headChannel: "separate" });
  return document(publication.documentLanguage, rendered, languageControlEnhancement);
}

export async function renderRoot(content: RootPageData) {
  const rendered = await prerender(Root, { content }, { headChannel: "separate" });
  return document("en", rendered, rootLanguageResolver(content.homePathnames));
}
