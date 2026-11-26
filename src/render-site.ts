import { renderToStaticMarkup } from "octane/server";
import { Discovery, type DiscoveryProps } from "./discovery.tsrx";
import { Home } from "./home.tsrx";
import { languageControlEnhancement, rootLanguageResolver } from "./inline-enhancements.ts";
import { Library } from "./library.tsrx";
import type { HomePageData, LibraryPageData, PageData, RootPageData } from "./page-data-schema.ts";
import {
  equivalentPublication,
  findPublication,
  productionOrigin,
  type Publication,
  type SiteLanguage,
} from "./publication.ts";
import { Root } from "./root.tsrx";

const absolute = (pathname: string) => `${productionOrigin}${pathname}`;

/** Render discovery metadata through Octane so authored values are escaped. */
const discoveryHead = (props: DiscoveryProps) =>
  renderToStaticMarkup(Discovery, props, { headChannel: "separate" }).head ?? "";

const localizedDiscovery = (content: PageData, publication: Publication) => {
  const equivalent = equivalentPublication(publication);
  const english = findPublication(publication.page, "en");
  const portuguese = findPublication(publication.page, "pt");
  const structuredData =
    publication.page === "home"
      ? `<script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: absolute(publication.pathname),
          mainEntity: {
            "@type": "Person",
            name: "Duarte Esteves",
            url: absolute(publication.pathname),
            sameAs: [
              "https://github.com/duarteplesteves",
              "https://www.linkedin.com/in/duarteplesteves",
            ],
          },
        })}</script>`
      : "";
  return `${discoveryHead({
    title: content.title,
    description: content.description,
    pathname: publication.pathname,
    imageAlt: content.socialPreviewImageAlt,
    alternates: [
      { hreflang: "en-GB", pathname: english.pathname },
      { hreflang: "pt-PT", pathname: portuguese.pathname },
      ...(publication.page === "home" ? [{ hreflang: "x-default", pathname: "/" }] : []),
    ],
    locale: publication.documentLanguage,
    alternateLocale: equivalent.documentLanguage,
  })}${structuredData}`;
};

const htmlDocument = (
  language: string,
  rendered: ReturnType<typeof renderToStaticMarkup>,
  enhancement: string,
  discovery: string,
  browserModule?: string,
) =>
  `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3ED%3C/text%3E%3C/svg%3E">${rendered.head ?? ""}${discovery}${rendered.css}${browserModule === undefined ? "" : '<script>document.documentElement.classList.add("enhanced")</script>'}<link rel="stylesheet" href="/assets/site.css"></head><body>${rendered.html}<script>${enhancement}</script>${browserModule === undefined ? "" : `<script type="module" src="${browserModule}"></script>`}</body></html>`;

function renderHome(content: HomePageData, publication: Publication) {
  const rendered = renderToStaticMarkup(Home, { content }, { headChannel: "separate" });
  return htmlDocument(
    publication.documentLanguage,
    rendered,
    languageControlEnhancement,
    localizedDiscovery(content, publication),
  );
}

function renderLibrary(content: LibraryPageData, publication: Publication) {
  const rendered = renderToStaticMarkup(Library, { content }, { headChannel: "separate" });
  return htmlDocument(
    publication.documentLanguage,
    rendered,
    languageControlEnhancement,
    localizedDiscovery(content, publication),
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
  const discovery = `${discoveryHead({
    title: content.title,
    description: content.description,
    pathname: "/",
    imageAlt: content.socialPreviewImageAlt.en,
    alternates: [
      { hreflang: "en-GB", pathname: content.homePathnames.en },
      { hreflang: "pt-PT", pathname: content.homePathnames.pt },
      { hreflang: "x-default", pathname: "/" },
    ],
  })}<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Duarte Esteves", url: absolute("/") })}</script>`;
  return htmlDocument("en", rendered, rootLanguageResolver(content.homePathnames), discovery);
}

/** Render the bilingual fallback or a Site-language missing page. */
export function renderMissing(content: RootPageData, siteLanguage?: SiteLanguage) {
  const bilingual = siteLanguage === undefined;
  const title = bilingual
    ? `${content.missingPage.heading.pt} · ${content.missingPage.heading.en}`
    : content.missingPage.title[siteLanguage];
  const body = bilingual
    ? `<main><h1><span lang="pt-PT">${content.missingPage.heading.pt}</span> · <span lang="en-GB">${content.missingPage.heading.en}</span></h1><p lang="pt-PT">${content.missingPage.description.pt} <a href="${content.homePathnames.pt}">${content.missingPage.homeLabel.pt}</a></p><p lang="en-GB">${content.missingPage.description.en} <a href="${content.homePathnames.en}">${content.missingPage.homeLabel.en}</a></p></main>`
    : `<main><h1>${content.missingPage.heading[siteLanguage]}</h1><p>${content.missingPage.description[siteLanguage]}</p><a href="${content.homePathnames[siteLanguage]}">${content.missingPage.homeLabel[siteLanguage]}</a></main>`;
  return `<!doctype html><html lang="${bilingual ? "en" : findPublication("home", siteLanguage).documentLanguage}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="robots" content="noindex, follow"><link rel="stylesheet" href="/assets/site.css"></head><body>${body}</body></html>`;
}
