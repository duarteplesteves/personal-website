import { prerender } from "octane/static";
import { Home } from "./home.tsrx";
import type { HomeContent, SiteLanguage } from "./home-content.ts";

const documentLanguages = { en: "en-GB", pt: "pt-PT" } as const;

export async function renderHome(content: HomeContent, locale: SiteLanguage) {
  const props = { content, locale } satisfies Parameters<typeof Home>[0];
  const { html, head, css } = await prerender(Home, props, { headChannel: "separate" });
  return `<!doctype html><html lang="${documentLanguages[locale]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head ?? ""}${css}</head><body>${html}</body></html>`;
}
