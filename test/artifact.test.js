import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import test from "node:test";

const publicRoutes = ["/", "/en", "/pt", "/en/library", "/pt/library"];

const artifactFile = async (pathname) => {
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const candidate = cleanPath === "" ? "dist/index.html" : `dist/${cleanPath}`;
  try {
    return (await stat(candidate)).isDirectory() ? `${candidate}/index.html` : candidate;
  } catch {
    const language = cleanPath.split("/")[0];
    return language === "en" || language === "pt" ? `dist/${language}/404.html` : "dist/404.html";
  }
};

const server = http.createServer(async (request, response) => {
  const file = await artifactFile(new URL(request.url ?? "/", "http://localhost").pathname);
  const missing = file.endsWith("404.html");
  response.writeHead(missing ? 404 : 200, {
    "content-type": file.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8",
  });
  response.end(await readFile(file));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
assert.notEqual(address, null);
assert.equal(typeof address, "object");
const origin = `http://127.0.0.1:${address.port}`;
test.after(() => server.close());

const get = (path) => fetch(`${origin}${path}`);

test("the production artifact serves every public route as complete source HTML without JavaScript", async () => {
  for (const route of publicRoutes) {
    const response = await get(route);
    const html = await response.text();
    assert.equal(response.status, 200, route);
    assert.match(html, /^<!doctype html><html lang="[^"]+">/i, route);
    assert.match(html, /<title>[^<]+<\/title>/, route);
    assert.match(html, /<main(?:\s|>)/, route);
    assert.match(html, /<h1(?:\s|>)/, route);
    assert.doesNotMatch(html, /data-octane/i, route);
  }
});

test("query strings fall back to the static route and referenced assets are available", async () => {
  const response = await get("/en/library?q=effect&show=read");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<cite>O Som e a Fúria<\/cite>/);

  for (const source of [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="(\/[^"?#]+)"/g)].map(
    ([, source]) => source,
  )) {
    assert.equal((await get(source)).status, 200, source);
  }
});

test("all internal document links resolve", async () => {
  for (const route of publicRoutes) {
    const html = await (await get(route)).text();
    const links = [...html.matchAll(/href="(\/[^"#?]*)/g)].map(([, href]) => href);
    for (const link of links) assert.equal((await get(link)).status, 200, `${route} -> ${link}`);
  }
});

test("documents retain accessibility basics", async () => {
  for (const route of publicRoutes) {
    const html = await (await get(route)).text();
    assert.match(html, /<html lang="[^"]+">/, route);
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, route);
    if (route !== "/") assert.match(html, /<nav[^>]+aria-label="[^"]+"/, route);
  }

  const library = await (await get("/en/library")).text();
  assert.match(library, /<label for="library-search">/);
  assert.equal((library.match(/<fieldset>/g) ?? []).length, 2);
  assert.equal((library.match(/<legend>/g) ?? []).length, 2);
});

test("browser code stays within the static enhancement boundary", async () => {
  const browserCode = await readFile("dist/assets/library.js", "utf8");
  assert.ok(Buffer.byteLength(browserCode) < 5_000, "Library enhancement must remain below 5 kB");
  assert.doesNotMatch(browserCode, /\b(?:effect|yaml|node:|octane)\b/i);
});

test("documents request no analytics, visitor statistics, error monitoring, or query collection", async () => {
  for (const route of publicRoutes) {
    const html = await (await get(route)).text();
    assert.match(html, /<link rel="icon" href="data:image\/svg\+xml,/);
    assert.doesNotMatch(
      html,
      /google-analytics|googletagmanager|plausible|posthog|sentry|segment|mixpanel|sendBeacon|XMLHttpRequest|\bfetch\s*\(/i,
      route,
    );
    assert.doesNotMatch(html, /<script[^>]+src="(?:https?:)?\/\//i, route);
  }
});

test("missing routes return localized HTTP 404 responses", async () => {
  for (const [route, text] of [
    ["/missing", "Page not found"],
    ["/en/missing", "Page not found"],
    ["/pt/missing", "Página não encontrada"],
  ]) {
    const response = await get(route);
    const html = await response.text();
    assert.equal(response.status, 404, route);
    assert.ok(html.includes(text), route);
    assert.match(html, /<meta name="robots" content="noindex, follow">/, route);
  }
});
