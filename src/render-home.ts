import { prerender } from "octane/static";
import { Home } from "./home.tsrx";
import type { HomePageData } from "./page-data.ts";
import type { HomePublication } from "./publication.ts";

export async function renderHome(content: HomePageData, publication: HomePublication) {
  const props = { content } satisfies Parameters<typeof Home>[0];
  const { html, head, css } = await prerender(Home, props, { headChannel: "separate" });
  return `<!doctype html><html lang="${publication.documentLanguage}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head ?? ""}${css}</head><body>${html}</body></html>`;
}
