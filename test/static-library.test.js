import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

const siteCss = await readFile("dist/assets/site.css", "utf8");

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

    const heading = siteLanguage === "en" ? "Currently reading" : "A ler";
    assert.match(
      html,
      new RegExp(`<h2[^>]*>${heading}</h2>(?:(?!</section>).)*<cite>O Som e a Fúria</cite>`, "s"),
    );
    const listing = html.slice(html.indexOf('<ol class="book-list"'));
    assert.match(listing, /<cite>O Som e a Fúria<\/cite>/);
  });

  test(`/${siteLanguage}/library shows quiet relationship metadata on Book lines`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    const favorite = siteLanguage === "en" ? "Favourite" : "Favorito";
    const inCollection = siteLanguage === "en" ? "In collection" : "Na coleção";
    assert.match(html, new RegExp(`${favorite} · ${inCollection}`));
    assert.match(html, /class="relationship"/);
  });

  test(`/${siteLanguage}/library keeps browsing controls hidden without JavaScript and embeds browser data`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    assert.match(html, /<section class="library-controls"[^>]*hidden/);
    assert.ok(
      html.indexOf('document.documentElement.classList.add("enhanced")') <
        html.indexOf('<section class="library-controls"'),
      "enhancement must be known before controls render",
    );
    assert.match(
      siteCss,
      /\.enhanced \.library-controls\[hidden\] \{\s*display: block !important;\s*\}/,
    );
    assert.match(html, /<input type="search"[^>]*data-library-search/);
    assert.match(html, /<fieldset><legend>[^<]+<\/legend>/);
    assert.match(html, /<input type="radio" name="library-show" value="all" checked/);
    assert.match(html, /<input type="radio" name="library-order" value="title" checked/);
    assert.match(html, /<input type="radio" name="library-order" value="author"/);
    assert.match(html, /<input type="radio" name="library-show" value="read"/);
    assert.match(html, /<input type="radio" name="library-show" value="favorites"/);
    assert.match(html, /<input type="radio" name="library-show" value="in-collection"/);
    assert.doesNotMatch(html, /<input type="radio" name="library-show" value="next-reads"/);
    assert.match(
      html,
      new RegExp(
        `<p class="result-count"[^>]*>${siteLanguage === "en" ? "152 Books" : "152 livros"}</p>`,
      ),
    );
    assert.match(
      html,
      /<li data-search="Ballad for Sophie Juan Cavia Filipe Melo" data-views="read in-collection" data-title="Ballad for Sophie" data-author-sort="Juan Cavia"/,
    );
    assert.match(html, /<script type="module" src="\/assets\/library\.js"><\/script>/);
    assert.match(
      html,
      new RegExp(
        `<link rel="canonical" href="https://duarteesteves\\.com/${siteLanguage}/library"`,
      ),
    );
  });
}
