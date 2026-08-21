import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

for (const siteLanguage of ["en", "pt"]) {
  test(`/${siteLanguage}/library publishes each sparse Book once without JavaScript`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    assert.equal(html.match(/<cite>Ballad for Sophie<\/cite>/g)?.length, 1);
    assert.equal(html.match(/Juan Cavia/g)?.length, 1);
    assert.equal(html.match(/Filipe Melo/g)?.length, 1);
    assert.ok(html.indexOf("Ballad for Sophie") < html.indexOf("Juan Cavia"));
    assert.ok(html.indexOf("Juan Cavia") < html.indexOf("Filipe Melo"));
    const reflection =
      siteLanguage === "en"
        ? "Friendship gives ambition a human scale."
        : "A amizade dá uma escala humana à ambição.";
    assert.match(html, new RegExp(`<blockquote>${reflection}</blockquote>`));
    assert.ok(html.indexOf("Filipe Melo") < html.indexOf(reflection));
    assert.doesNotMatch(html, /data-octane/i);
  });
}
