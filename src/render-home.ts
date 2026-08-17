import { prerender } from "octane/static";
import { Home } from "./home.tsrx";
import type { HomeContent } from "./home-content.ts";
import type { HomePublication } from "./publication.ts";

export async function renderHome(content: HomeContent, publication: HomePublication) {
  const props = {
    content,
    siteLanguage: publication.siteLanguage,
  } satisfies Parameters<typeof Home>[0];
  const { html, head, css } = await prerender(Home, props, { headChannel: "separate" });
  return `<!doctype html><html lang="${publication.documentLanguage}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head ?? ""}${css}</head><body>${html}</body></html>`;
}
