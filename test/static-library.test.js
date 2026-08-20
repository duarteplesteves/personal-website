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
    assert.doesNotMatch(html, /data-octane/i);
  });
}
