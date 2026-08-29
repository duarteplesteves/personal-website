import { renderToStaticMarkup } from "octane/server";
import { Home } from "./home.tsrx";
import { languageControlEnhancement, rootLanguageResolver } from "./inline-enhancements.ts";
import { Library } from "./library.tsrx";
import type { HomePageData, LibraryPageData, PageData, RootPageData } from "./page-data-schema.ts";
import type { Publication } from "./publication.ts";
import { Root } from "./root.tsrx";
import { siteStyles } from "./site-styles.ts";

const htmlDocument = (
  language: string,
  rendered: ReturnType<typeof renderToStaticMarkup>,
  enhancement: string,
  browserModule?: string,
) =>
  `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${rendered.head ?? ""}${rendered.css}<style>${siteStyles}</style></head><body>${rendered.html}<script>${enhancement}</script>${browserModule === undefined ? "" : `<script type="module" src="${browserModule}"></script>`}</body></html>`;

function renderHome(content: HomePageData, publication: Publication) {
  const rendered = renderToStaticMarkup(Home, { content }, { headChannel: "separate" });
  return htmlDocument(publication.documentLanguage, rendered, languageControlEnhancement);
}

function renderLibrary(content: LibraryPageData, publication: Publication) {
  const rendered = renderToStaticMarkup(Library, { content }, { headChannel: "separate" });
  return htmlDocument(
    publication.documentLanguage,
    rendered,
    languageControlEnhancement,
    "/assets/library.js",
  );
}

export function renderPage(content: PageData, publication: Publication) {
  return content.page === "home"
    ? renderHome(content, publication)
    : renderLibrary(content, publication);
}

export function renderRoot(content: RootPageData) {
  const rendered = renderToStaticMarkup(Root, { content }, { headChannel: "separate" });
  return htmlDocument("en", rendered, rootLanguageResolver(content.homePathnames));
}
