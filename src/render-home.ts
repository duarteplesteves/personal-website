import { createElement } from "octane/server";
import { renderToStaticMarkup } from "octane/server";
import type { HomeContent, SiteLanguage } from "./home-content.ts";

const documentLanguages = { en: "en-GB", pt: "pt-PT" } as const;

type HomeProps = { content: HomeContent; locale: SiteLanguage };

export function renderHome(content: HomeContent, locale: SiteLanguage) {
  const { html, css } = renderToStaticMarkup(Home, { content, locale });
  return `<!doctype html><html lang="${documentLanguages[locale]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${hoistDescription(content.description[locale])}<title>${content.title}</title>${css}</head><body>${html}</body></html>`;
}

function Home({ content, locale }: HomeProps) {
  return createElement(
    "main",
    undefined,
    createElement("h1", undefined, content.title),
    createElement("p", undefined, content.introduction[locale]),
  );
}

/**
 * Octane 0.1.37 drops component metadata from clean static output. Keep this
 * workaround at the document boundary. Remove it when the regression test
 * passes with metadata rendered by Octane.
 */
function hoistDescription(description: string) {
  const escaped = description
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `<meta name="description" content="${escaped}" data-octane-hoisted>`;
}
