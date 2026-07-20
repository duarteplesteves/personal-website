Label: wayfinder:map

# Chart the personal home

## Destination

An implementation-ready product and technical specification for Duarte’s bilingual personal home: its long-term vision and a coherent, launchable version one spanning identity, Work, interests, and a small but complete Library.

## Notes

- This is a planning map; implementation and launch happen after the specification is ready.
- Consult the `grilling` and `domain-modeling` skills in every decision session, and keep `CONTEXT.md` current. Use `prototype` for concrete design reactions and web research for current external facts.
- The site is a personal home first. Professional credibility and opportunities are welcome secondary outcomes, not its organizing principle.
- Everything published is public and deliberately selected; there are no visitor accounts or private data on the site.
- Every public page and authored item has equivalent Portuguese (Portugal) and English content. Edition metadata may retain its original language.
- Work comprises concise Experience plus honest Selected Work, without implying sole ownership of company projects or exposing confidential information.
- Version one includes a small but complete Library. Collection status and reading status are independent; dates and short Reflections are optional; reviews and numeric ratings are not obligations. Its presentation starts as a restrained, text-first list without book covers; imagery may be explored later.
- Repository-managed content is the default. A CMS is only reconsidered if demonstrated maintenance friction warrants it, particularly for the Library.
- Design should follow Emil Kowalski’s principle of limiting visual variation to reduce mistakes and letting content carry the experience: clean, minimal, intuitive, with subtle interaction delights. Positive references include Emil Kowalski, Paco Coursey, Kit Langton, Performance, Guillermo Rauch, and Brian Lovin; Canada.ca, Literal, and Derek Sivers are not visual directions. See [Personal design references](assets/personal-design-references.md).
- Accessibility and performance are non-negotiable. Interactions must preserve semantic and keyboard navigation, reduced-motion support, readable contrast, and excellent Core Web Vitals.
- Framework candidates are Next.js and TanStack Start. Current bias: Next.js unless research identifies a concrete product or learning advantage for TanStack Start.

## Decisions so far

<!-- Closed decision tickets are indexed here; detail remains in each ticket. -->

- [Research restrained visual references](issues/06-research-restrained-visual-references.md) — Five complementary references yield concrete hypotheses for restrained design, bilingual switching, Library browsing, personal voice, and purposeful motion.
- [Research Next.js and TanStack Start for the personal home](issues/10-research-nextjs-and-tanstack-start.md) — Current evidence conditionally favors Next.js, while requiring a representative comparison spike before choosing it over TanStack Start.
- [Contribute personal design references](issues/05-contribute-personal-design-references.md) — The preferred direction combines restrained content-led sites and scannable text structures; the version-one Library should be text-first without covers.
- [Shape the personal home’s story and release boundaries](issues/01-shape-the-personal-home-story.md) — Curiosity is the Central thread; version one is a main Home document plus a Standalone Library, with other destinations added only when their content earns them.

## Not yet specified

- The exact version-one copy, content quantities, and source-asset needs after the Work inventory, Library model, and Home Library preview are settled.
- The content schemas and technical architecture connecting bilingual authored content, Work, book editions, reading history, and generated metadata after the product models and framework are chosen.
- Book metadata acquisition, search/filter behavior, import needs, and whether actual maintenance friction justifies tooling beyond Git after the Library model and workflow are settled.
- Search-engine and social metadata, hosting, deployment, analytics/privacy, observability, and launch checks after the framework and page structure are known.
- The final synthesis and acceptance structure of the implementation-ready product and technical specification once the route’s decisions are resolved.

## Out of scope

- Building, deploying, or launching the website during this planning effort.
- A standalone blog, article feed, or publishing obligation; revisit only if a real writing habit emerges.
- Visitor accounts, private shelves, and publishing private notes, purchases, or other sensitive data.
- Astro and a vanilla-TypeScript site as framework candidates.
- Dedicated feature sections for interests other than software and books; those interests may appear in the personal narrative and can earn separate treatment in a later effort.
