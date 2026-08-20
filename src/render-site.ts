import { prerender } from "octane/static";
import { Home } from "./home.tsrx";
import { languageControlEnhancement, rootLanguageResolver } from "./inline-enhancements.ts";
import { Library } from "./library.tsrx";
import type { HomePageData, LibraryPageData, PageData, RootPageData } from "./page-data-schema.ts";
import type { Publication } from "./publication.ts";
import { Root } from "./root.tsrx";
import { siteStyles } from "./site-styles.ts";

const htmlDocument = (
  language: string,
  rendered: Awaited<ReturnType<typeof prerender>>,
  enhancement: string,
) =>
  `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${rendered.head ?? ""}${rendered.css}<style>${siteStyles}</style></head><body>${rendered.html}<script>${enhancement}</script></body></html>`;

async function renderHome(content: HomePageData, publication: Publication) {
  const rendered = await prerender(Home, { content }, { headChannel: "separate" });
  return htmlDocument(publication.documentLanguage, rendered, languageControlEnhancement);
}

async function renderLibrary(content: LibraryPageData, publication: Publication) {
  const rendered = await prerender(Library, { content }, { headChannel: "separate" });
  return htmlDocument(publication.documentLanguage, rendered, languageControlEnhancement);
}

export async function renderPage(content: PageData, publication: Publication) {
  return content.page === "home"
    ? renderHome(content, publication)
    : renderLibrary(content, publication);
}

export async function renderRoot(content: RootPageData) {
  const rendered = await prerender(Root, { content }, { headChannel: "separate" });
  return htmlDocument("en", rendered, rootLanguageResolver(content.homePathnames));
}
