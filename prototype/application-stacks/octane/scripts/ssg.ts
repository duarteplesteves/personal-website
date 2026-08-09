import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { prerender } from 'octane/static';
import { App } from '../src/App.tsrx';
import { books, copy, locales } from '../../shared/content.ts';
import type { Locale } from '../../shared/content.ts';

const output = resolve(import.meta.dirname, '../dist');
await copyFile(resolve(output, 'assets/entry-client.css'), resolve(output, 'assets/client.css'));
const routes = locales.flatMap((lang) => [
  `/${lang}/`,
  `/${lang}/library/`,
  ...books.map((book) => `/${lang}/library/${book.slug}/`)
]);

async function emit(path: string, lang: Locale) {
  const rendered = await prerender(App, { lang, path }, { headChannel: 'separate' });
  const document = `<!doctype html><html lang="${copy[lang].htmlLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${rendered.head ?? ''}${rendered.css}<link rel="stylesheet" href="/assets/client.css"></head><body><div id="root">${rendered.html}</div><script type="module" src="/assets/client.js"></script></body></html>`;
  const file = resolve(output, path.slice(1), 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, document);
}

for (const path of routes) await emit(path, path.startsWith('/pt/') ? 'pt' : 'en');
await emit('/404/', 'en');

const urls = routes.map((path) => `<url><loc>https://duarte.example${path}</loc></url>`).join('');
await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
await writeFile(resolve(output, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://duarte.example/sitemap.xml\n');

const cssPath = resolve(output, 'assets/client.css');
try { await readFile(cssPath); } catch { throw new Error(`Vite did not emit ${cssPath}`); }
console.log(`Octane SSG emitted ${routes.length + 1} HTML routes.`);
