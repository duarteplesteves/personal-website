import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import test from "node:test";

for (const siteLanguage of ["en", "pt"]) {
  test(`/${siteLanguage}/library publishes each sparse Book once without JavaScript`, async () => {
    const html = await readFile(`dist/${siteLanguage}/library/index.html`, "utf8");

    const reflection =
      siteLanguage === "en"
        ? "Friendship gives ambition a human scale."
        : "A amizade dá uma escala humana à ambição.";
    assert.match(
      html,
      new RegExp(
        `<li><cite>Ballad for Sophie</cite>(?:(?!</li>).)*<span>Juan Cavia, Filipe Melo</span>(?:(?!</li>).)*<blockquote>${reflection}</blockquote>`,
        "s",
      ),
    );
    assert.doesNotMatch(html, /data-octane/i);
  });
}
