import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const outputs = {
  'Next.js + React': resolve(root, 'next-react/out'),
  'Next.js + TSRX': resolve(root, 'next-tsrx/out'),
  Octane: resolve(root, 'octane/dist')
};
const slugs = ['the-design-of-everyday-things', 'the-beginning-of-infinity', 'the-scout-mindset', 'thinking-in-systems', 'a-philosophy-of-software-design', 'the-order-of-time'];
const routes = ['en', 'pt'].flatMap((lang) => [
  `${lang}/index.html`,
  `${lang}/library/index.html`,
  ...slugs.map((slug) => `${lang}/library/${slug}/index.html`)
]);

for (const [name, output] of Object.entries(outputs)) {
  for (const route of routes) await access(resolve(output, route));
  await access(resolve(output, 'robots.txt'));
  await access(resolve(output, 'sitemap.xml'));
  const english = await readFile(resolve(output, 'en/library/index.html'), 'utf8');
  const portuguese = await readFile(resolve(output, 'pt/library/index.html'), 'utf8');
  for (const [html, lang, canonical, alternate] of [
    [english, 'en-GB', 'https://duarte.example/en/library/', 'https://duarte.example/pt/library/'],
    [portuguese, 'pt-PT', 'https://duarte.example/pt/library/', 'https://duarte.example/en/library/']
  ]) {
    if (!html.includes(`lang="${lang}"`)) throw new Error(`${name}: missing ${lang}`);
    if (!html.includes(canonical)) throw new Error(`${name}: missing canonical ${canonical}`);
    if (!html.includes(alternate)) throw new Error(`${name}: missing alternate ${alternate}`);
    if (!html.includes('The Design of Everyday Things')) throw new Error(`${name}: no-JS Library content missing`);
    if (!html.includes('<main') || !html.includes('<h1')) throw new Error(`${name}: semantic structure missing`);
  }
  console.log(`✓ ${name}: ${routes.length} bilingual routes, metadata, semantics, and no-JS Library content`);
}
