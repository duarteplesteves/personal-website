import { Effect } from "effect";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { loadHome } from "../src/load-home.ts";
import { renderHome } from "../src/render-home.ts";
import type { SiteLanguage } from "../src/home-content.ts";

const output = "dist";
const staging = ".dist-temporary";
const locales: readonly SiteLanguage[] = ["en", "pt"];

const program = loadHome("content/home.json").pipe(
  Effect.tap(() =>
    Effect.tryPromise({
      try: () => rm(staging, { recursive: true, force: true }),
      catch: (error) => new Error(`Could not clean temporary output: ${String(error)}`),
    }),
  ),
  Effect.flatMap((content) =>
    Effect.all(
      locales.map((locale) =>
        writePage(`${staging}/${locale}/index.html`, renderHome(content, locale)),
      ),
      { concurrency: "unbounded" },
    ),
  ),
  Effect.flatMap(() =>
    Effect.tryPromise({
      try: async () => {
        await rm(output, { recursive: true, force: true });
        await rename(staging, output);
      },
      catch: (error) => new Error(`Could not publish static files: ${String(error)}`),
    }),
  ),
);

const writePage = (path: string, html: string) =>
  Effect.tryPromise({
    try: async () => {
      await mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
      await writeFile(path, html, "utf8");
    },
    catch: (error) => new Error(`Could not write ${path}: ${String(error)}`),
  });

Effect.runPromise(program).catch(async (error) => {
  await rm(staging, { recursive: true, force: true });
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
