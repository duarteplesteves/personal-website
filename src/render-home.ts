import { createElement } from "octane/server";
import { renderToStaticMarkup } from "octane/server";
import type { HomeContent, SiteLanguage } from "./home-content.ts";

const documentLanguages = { en: "en-GB", pt: "pt-PT" } as const;

type HomeProps = { content: HomeContent; locale: SiteLanguage };

function Home({ content, locale }: HomeProps) {
  return createElement(
    "main",
    undefined,
    createElement("h1", undefined, content.title),
    createElement("p", undefined, content.introduction[locale]),
  );
}

/**
 * Octane 0.1.37 does not reliably retain component-authored metadata while
 * producing a clean static document. Keep the workaround at this publication
 * boundary: render page content with Octane, then hoist the localized metadata
 * into the document shell. Remove this function when an Octane upgrade passes
 * test/static-home.test.js without it. See GitHub issue #35.
 */
function hoistLocalizedMetadata(description: string) {
  const escaped = description
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `<meta name="description" content="${escaped}" data-octane-metadata-workaround="35">`;
}

export function renderHome(content: HomeContent, locale: SiteLanguage) {
  const { html, css } = renderToStaticMarkup(Home, { content, locale });
  return `<!doctype html><html lang="${documentLanguages[locale]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${hoistLocalizedMetadata(content.description[locale])}<title>${content.title}</title>${css}</head><body>${html}</body></html>`;
}
