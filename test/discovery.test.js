import { readFile, stat } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

const origin = "https://duarteesteves.com";
const routes = [
  ["", "en", "Duarte Esteves", "/", "The name Duarte Esteves on a warm, off-white background."],
  [
    "en",
    "en-GB",
    "Duarte Esteves",
    "/en",
    "The name Duarte Esteves on a warm, off-white background.",
  ],
  [
    "pt",
    "pt-PT",
    "Duarte Esteves",
    "/pt",
    "O nome Duarte Esteves sobre um fundo claro, de tom quente.",
  ],
  [
    "en/library",
    "en-GB",
    "Library — Duarte Esteves",
    "/en/library",
    "The name Duarte Esteves on a warm, off-white background.",
  ],
  [
    "pt/library",
    "pt-PT",
    "Biblioteca — Duarte Esteves",
    "/pt/library",
    "O nome Duarte Esteves sobre um fundo claro, de tom quente.",
  ],
];

for (const [directory, language, title, pathname, imageAlt] of routes) {
  test(`${pathname} publishes absolute discovery metadata`, async () => {
    const html = await readFile(`dist/${directory ? `${directory}/` : ""}index.html`, "utf8");
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    assert.match(html, new RegExp(`<html lang="${language}">`));
    assert.ok(head.includes(`<title>${title}</title>`));
    assert.ok(head.includes(`<link rel="canonical" href="${origin}${pathname}">`));
    assert.ok(head.includes(`<meta property="og:url" content="${origin}${pathname}">`));
    assert.ok(head.includes(`<meta property="og:type" content="website">`));
    assert.ok(
      head.includes(`<meta property="og:image" content="${origin}/assets/social-preview.png">`),
    );
    assert.ok(head.includes(`<meta property="og:image:type" content="image/png">`));
    assert.ok(head.includes(`<meta property="og:image:width" content="1200">`));
    assert.ok(head.includes(`<meta property="og:image:height" content="630">`));
    assert.ok(head.includes(`<meta property="og:image:alt" content="${imageAlt}">`));
    assert.ok(head.includes(`<meta name="twitter:card" content="summary_large_image">`));
    assert.ok(
      head.includes(`<meta name="twitter:image" content="${origin}/assets/social-preview.png">`),
    );
    assert.ok(head.includes(`<meta name="twitter:image:alt" content="${imageAlt}">`));
  });
}

test("the Search Console verification file is published at the root", async () => {
  assert.equal(
    await readFile("dist/googled085d2f70d727b28.html", "utf8"),
    "google-site-verification: googled085d2f70d727b28.html",
  );
});

test("the social-preview asset is a 1200×630 PNG", async () => {
  const image = await readFile("dist/assets/social-preview.png");
  assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test("localized routes publish reciprocal language alternates", async () => {
  for (const route of ["en", "pt", "en/library", "pt/library"]) {
    const html = await readFile(`dist/${route}/index.html`, "utf8");
    assert.ok(
      html.includes(
        `<link rel="alternate" hreflang="en-GB" href="${origin}/${route.includes("library") ? "en/library" : "en"}">`,
      ),
    );
    assert.ok(
      html.includes(
        `<link rel="alternate" hreflang="pt-PT" href="${origin}/${route.includes("library") ? "pt/library" : "pt"}">`,
      ),
    );
    if (route.includes("library")) assert.doesNotMatch(html, /hreflang="x-default"/);
    else assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${origin}/">`));
  }
});

test("root, sitemap, and robots use only clean configured routes", async () => {
  const root = await readFile("dist/index.html", "utf8");
  assert.ok(root.includes(`<link rel="alternate" hreflang="x-default" href="${origin}/">`));
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  for (const [, , , pathname] of routes)
    assert.ok(sitemap.includes(`<loc>${origin}${pathname}</loc>`));
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 5);
  assert.doesNotMatch(sitemap, /lastmod|<loc>[^<]*\?/);
  assert.equal(
    await readFile("dist/robots.txt", "utf8"),
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  );
});

test("missing pages are localized, noindex, and excluded from discovery metadata", async () => {
  for (const [file, language, text] of [
    ["dist/en/404.html", "en-GB", "Page not found"],
    ["dist/pt/404.html", "pt-PT", "Página não encontrada"],
    ["dist/404.html", "en", "Página não encontrada · Page not found"],
  ]) {
    assert.equal((await stat(file)).isFile(), true);
    const html = await readFile(file, "utf8");
    assert.match(html, new RegExp(`<html lang="${language}">`));
    assert.ok(html.includes(text));
    assert.ok(html.includes(`<meta name="robots" content="noindex, follow">`));
    assert.doesNotMatch(
      html,
      /rel="canonical"|rel="alternate"|property="og:|name="twitter:|application\/ld\+json/,
    );
  }
  assert.equal(
    await readFile("dist/_redirects", "utf8"),
    "/en/* /en/404.html 404\n/pt/* /pt/404.html 404\n/* /404.html 404\n",
  );
});

test("Cloudflare Pages configures security and cache headers", async () => {
  assert.equal(
    await readFile("dist/_headers", "utf8"),
    "/*\n  Permissions-Policy: camera=(), geolocation=(), microphone=()\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n\n/assets/*\n  Cache-Control: public, max-age=86400\n",
  );
});
