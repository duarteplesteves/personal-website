import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

for (const siteLanguage of ["en", "pt"]) {
  test(`/${siteLanguage}/library lists all 152 Books once ordered by title without JavaScript`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    const listing = html.slice(html.indexOf('<ol class="book-list"'));
    const titles = [...listing.matchAll(/<li[^>]*><cite>([^<]+)<\/cite>/g)].map(
      (match) => match[1],
    );
    assert.equal(titles.length, 152);
    const collator = new Intl.Collator(siteLanguage === "en" ? "en-GB" : "pt-PT");
    assert.deepEqual(
      titles,
      titles.toSorted((a, b) => collator.compare(a, b)),
    );
    assert.doesNotMatch(html, /data-octane/i);
  });

  test(`/${siteLanguage}/library highlights Currently reading while keeping those Books in the listing`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    const heading = siteLanguage === "en" ? "Currently reading" : "A ler atualmente";
    assert.match(
      html,
      new RegExp(`<h2[^>]*>${heading}</h2>(?:(?!</section>).)*<cite>O Som e a Fúria</cite>`, "s"),
    );
    const listing = html.slice(html.indexOf('<ol class="book-list"'));
    assert.match(listing, /<cite>O Som e a Fúria<\/cite>/);
  });

  test(`/${siteLanguage}/library shows quiet relationship metadata on Book lines`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    const favorite = siteLanguage === "en" ? "Favorite" : "Favorito";
    const inCollection = siteLanguage === "en" ? "In collection" : "Na coleção";
    assert.match(html, new RegExp(`${favorite} · ${inCollection}`));
    assert.match(html, /class="relationship"/);
  });

  test(`/${siteLanguage}/library publishes each sparse Book once without JavaScript`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    const reflection =
      siteLanguage === "en"
        ? "Friendship gives ambition a human scale."
        : "A amizade dá uma escala humana à ambição.";
    assert.match(
      html,
      new RegExp(
        `<li[^>]*><cite>Ballad for Sophie</cite>(?:(?!</li>).)*<span>Juan Cavia, Filipe Melo</span>(?:(?!</li>).)*<blockquote>${reflection}</blockquote>`,
        "s",
      ),
    );
  });

  test(`/${siteLanguage}/library keeps search hidden without JavaScript and embeds searchable text`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    assert.match(html, /<section class="library-controls"[^>]*hidden/);
    assert.match(html, /<input type="search"[^>]*data-library-search/);
    assert.match(
      html,
      new RegExp(
        `<p class="result-count"[^>]*>${siteLanguage === "en" ? "152 Books" : "152 livros"}</p>`,
      ),
    );
    assert.match(html, /<li data-search="Ballad for Sophie Juan Cavia Filipe Melo">/);
  });
}
