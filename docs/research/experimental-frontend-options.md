# Experimental frontend options for the personal home

**Research date:** 2026-08-09  
**Question:** How well do TSRX targeting React and Next.js, Octane, and Foldkit support the personal home’s static-first bilingual routing, generated content routes, URL filters, metadata, images, accessibility, static hosting, and development constraints—and which merit a representative prototype alongside Next.js and TanStack Start?

## Short answer

**Carry Next.js with TSRX and Octane into the shortlisting decision; do not carry Foldkit into a matched prototype.**

- **Next.js with TSRX merits a prototype only as a constrained Next.js variant.** It inherits Next.js’s strong static export, locale routes, generated routes, metadata, accessibility conventions, and image/font APIs. A current feasibility build proved that `.tsrx` route and Server Component files can generate the bilingual static slice. It also found three integration gaps: imported `.tsrx` Client Components fail in the production Turbopack build, TSRX scoped `<style>` imports fail, and `next build` does not type-check `.tsrx` files. A viable spike must therefore test whether using TSRX only for server-authored markup—TSX for Client Components, ordinary CSS modules, and a mandatory `tsrx-tsc --noEmit` check—still provides enough learning and authoring value to justify a second compiler.
- **Octane merits a prototype as the genuinely experimental application candidate.** Its alpha compiler/runtime can prerender clean HTML, collect scoped CSS, hoist metadata, and ship no JavaScript for non-hydrated pages; its React-shaped programming model and direct DOM compiler offer meaningful learning. The missing product layer is material: the official routed app build produces an SSR server rather than a static export, so a repository-driven route enumerator and static writer must be owned by the project. A feasibility check proved the small custom SSG path but also exposed fresh compiler/package rough edges. The prototype should decide whether this remains a small, bounded seam or becomes framework engineering.
- **Foldkit should not advance for this destination.** Its own documentation says it is client-first, “for apps, not documents,” and recommends Astro for sites that are mostly prose with light interaction. Its current SSG reference boots a Vite preview server, visits every route in headless Chromium, and captures HTML with an 865-line project script. A minimal production build emitted an empty HTML root plus about 70 KB gzip of JavaScript, and route code splitting is not available. Foldkit’s typed URL model, Effect integration, and accessibility-oriented UI are attractive, but they solve a richer application problem than version one has. Effect can still be learned in repository tooling without making every document page a Foldkit SPA.

This is research, not the framework decision. The shortlisting decision should bound how many matched implementations are worth building.

## Current status and ecosystem evidence

Facts below were checked against the official repositories, npm registry, and npm download API on 2026-08-09. Download and star counts indicate activity and exposure, not production suitability.

| Option | Current packages | Declared status | Repository / activity snapshot | npm downloads, 2026-08-02–08 |
| --- | --- | --- | --- | --- |
| TSRX targeting React/Next | `@tsrx/react` 0.2.56; `@tsrx/turbopack-plugin-react` 0.1.79; `@tsrx/typescript-plugin` 0.3.118 | TSRX website: active **beta**; all relevant packages are pre-1.0 | Shared `Ripple-TS/ripple` repo: 7,384 stars, 291 forks, 26 open issues; most history is concentrated in two maintainers. The repo covers Ripple and all TSRX targets, so these numbers overstate Next-specific adoption. | `@tsrx/react`: 8,526; Turbopack integration: 86 |
| Octane | `octane` 0.1.31; `@octanejs/vite-plugin` 0.1.31; `@octanejs/seo` 0.0.16 | Official README: **alpha**, APIs still move | `octanejs/octane`: 1,172 stars, 41 forks, 98 open issues; created 2026-06-22 and changing rapidly; one primary maintainer with a growing contributor set | `octane`: 11,898; `@octanejs/seo`: 1,368 |
| Foldkit | `foldkit` 0.141.0; `@foldkit/vite-plugin` 0.12.1; Effect 4.0.0-beta.105 peers | Official docs: **pre-1.0**; public API may break in minors | `foldkit/foldkit`: 772 stars, 27 forks, 145 open issues; one maintainer accounts for most commits | `foldkit`: 10,151; Vite plugin: 5,318 |

The fast release cadence is encouraging for exploration and increases upgrade churn. None of these package lines should float in CI; a prototype should pin exact versions and use a dependency update bot only after the framework is chosen.

## Capability comparison

| Concern | Next.js with TSRX | Octane | Foldkit |
| --- | --- | --- | --- |
| Static-first HTML | Inherits Next `output: 'export'`. `.tsrx` route and layout files built successfully as Server Components. | Core `renderToStaticMarkup` and async `prerender` work. Static route enumeration/output is application code; the official app layer builds a server. | Client-first SPA. Static HTML requires browser-capture SSG; first-class request SSR/hydration remains roadmap work. |
| Bilingual routes | Inherits `[lang]`, `generateStaticParams`, dynamic metadata, and static export. Proven for `/en` and `/pt`. | Props and route generation are unconstrained; proven with `en-GB`/`pt-PT` HTML. No built-in locale policy. | Typed routes can include locale variants; `Document.lang` updates `<html lang>`. Cold-load shell and browser capture must stamp each locale correctly. |
| Generated content routes | Inherits `generateStaticParams`; proven from a repository Book manifest. | A custom build script can iterate the validated content manifest and call `prerender`; no discovery convention is supplied. | The SSG script must enumerate URLs and capture each route. Typed bidirectional routes help URL correctness but do not generate files. |
| URL filters | Inherits Next/React choices. TSX Client Components work from a TSRX Server Component; imported `.tsrx` Client Components currently failed. | Native forms work without JS, while real in-page filtering needs the client runtime and a router or URL library. Official Octane ports exist for TanStack Router, React Router, and nuqs. | Strong fit: Effect-Schema query parsing and bidirectional URL construction are first-class. |
| Metadata | Inherits Next’s typed metadata, canonical/alternates, sitemap/robots, and OG conventions. Proven canonical and `hreflang` output. | Core hoists title/meta/link; `@octanejs/seo` adds merged SEO, Open Graph, Twitter, languages, and JSON-LD. Custom SSG must place the head output and generate sitemap/robots. | `Document` owns title, canonical, `og:url`, `lang`, and `dir`. Description, language alternates, richer social tags, sitemap, and robots are separate shell/build work. |
| Images/fonts | Inherits Next APIs and the static-export image limitation already identified: default image optimization is unavailable without a custom loader/service. TSRX changes none of this. | No first-party responsive image or font pipeline was found. Use Vite assets plus project-owned dimensions, variants, compression, and preload policy. | No first-party image optimization pipeline was found. Use Vite assets and project-owned processing. |
| Accessibility | TSRX emits ordinary React elements; Next’s route announcer and semantic HTML behavior remain available. Current compiler output preserved `lang`, labels, headings, and links. | Native DOM semantics and events, React-parity SSR/hydration work, and a substantial React Aria port are positive. No official client-route announcement guidance was found; verify focus and announcements. | First-party headless UI and accessible test locators are strengths, but the roadmap still calls for real-screen-reader WCAG audits and axe CI. No route-announcement convention was found. |
| Static hosting | Same portable `out/` artifact as ordinary Next static export. | Portable once a custom SSG script writes every HTML page and copies Vite assets. Official full-app output otherwise includes a Node/Worker server. | Portable after browser-capture prerendering. The official docs confirm the deployed Foldkit site uses plain static files. |
| Client JavaScript | Same Next runtime/RSC payload trade-off as the established candidate. TSRX does not reduce it. | A non-hydrated custom render shipped zero JS. A minimal interactive Vite app built to 108 KB raw / 35 KB gzip. | A minimal Vite app built to 212 KB raw / 70 KB gzip; official docs say a minimal counter is just under 90 KB gzip. Route code cannot currently split. |
| Development model | React plus a beta language/compiler, Turbopack loader, editor tooling, formatter/linter, and separate type-check command. | React-shaped components without React, compiler-derived hooks, TSRX, Node 22.22.2+, Vite 8, alpha APIs, and smaller ecosystem ports. | Elm Architecture, no JSX, Effect everywhere, schema-defined Model/Messages, exact beta Effect peers, and explicit update/command wiring. Strongest conceptual departure and largest mismatch with a mostly static document. |

## Feasibility checks

The checks were deliberately small and disposable. They answer “does the advertised seam work today?” rather than benchmark production quality.

### Next.js 16.2.10 + TSRX React target

A fresh static-export app used React 19.2.4, `@tsrx/react` 0.2.56, `@tsrx/turbopack-plugin-react` 0.1.79, and `@tsrx/typescript-plugin` 0.3.118.

**What passed**

- `.tsrx` App Router layout, home page, Library index, and generated Book detail pages compiled under production Turbopack.
- `generateStaticParams` emitted both locales and four locale/Book detail combinations from one repository manifest.
- Generated files carried `lang="en-GB"` / `lang="pt-PT"`, translated titles/descriptions, canonicals, and both language alternates.
- A TSX Client Component imported by a `.tsrx` Server Component rendered and hydrated, and wrote its filter value to `?q=`.
- A clean warm build generated ten framework pages in about 2.5 seconds on the test machine.

**What failed or required an extra guardrail**

1. An imported `.tsrx` Client Component failed production build with `Can't resolve './filter.tsrx.tsx'`. A TSX Client Component at the same boundary succeeded.
2. A scoped `<style>` inside a `.tsrx` route failed because the Turbopack helper emitted an absolute/sibling virtual CSS import that Next could not resolve. Ordinary external CSS remains available.
3. `next build` accepted a deliberate `.tsrx` semantic error (`const value: string = 123`). Running `tsrx-tsc --noEmit` caught it. Next’s own type-check step does not cover the custom extension.

These failures are not claims that TSRX can never support those paths; they are a snapshot of the current published integration. No matching open issue was found in a title search, so the prototype should reproduce them against the exact chosen versions rather than assume an imminent fix.

**Assessment:** product capabilities pass because Next owns them. The unresolved question is whether a server-only TSRX subset is still worth the language/compiler cost. This is exactly prototype territory.

### Octane 0.1.31

A custom Node SSG script imported a `.tsrx` component through `octane/compiler/register`, called `prerender` for English and Portuguese, and wrote complete documents.

**What passed**

- Two locale pages rendered to complete static HTML in about 0.1 seconds, with correct `lang`, semantic form markup, title, description, canonical, language alternates, and Open Graph image metadata.
- `headChannel: 'separate'` let the script place hoisted metadata in the real document head.
- Scoped styles were collected, hashed, and inserted at build time.
- With no client entry, the pages shipped no JavaScript.
- A separate interactive Vite app using state and an input built successfully to 108 KB raw / about 35 KB gzip.

**Rough edges observed**

1. Referencing a local `const alternatePath` from hoisted head metadata produced a temporal-dead-zone error in generated server output; inlining the expression worked. This is a compiler correctness risk, not an authoring preference.
2. Importing the raw-source `@octanejs/seo` package through the direct Node preload hit Node’s refusal to strip TypeScript under `node_modules`. The official Vite pipeline compiles declared raw-source packages, but a custom direct SSG runner must prove that package path or use core metadata primitives.
3. Rendering metadata as a child of a full `<html>` element hit a `HeadHoist` compiler error. Rendering the page body plus a separate head channel—the custom-server pattern documented by Octane—worked.

**Assessment:** Octane can meet the static artifact boundary, and its zero-JS ceiling is better aligned than its “full-stack” framing first suggests. The custom exporter and fresh compiler defects are the decision gate. A matched prototype should be allowed only a small amount of infrastructure; if the exporter, metadata, hydration, or asset path expands into framework work, Octane should be dropped.

### Foldkit 0.141.0

A minimal Vite application rendered a heading and Library link through `Runtime.makeApplication`.

**What passed**

- The app compiled quickly and the runtime can declaratively update title, canonical, and document language.
- The framework’s typed routing and Effect model are usable for URL-driven behavior.

**What the artifact showed**

- The generated `index.html` had an empty `<div id="root"></div>`; all content depended on JavaScript.
- The single JavaScript asset was 211,904 bytes raw / 69,549 bytes gzip.
- The official SSG reference required to turn this into crawlable route HTML is 865 lines and uses Playwright Chromium to visit and capture every route.
- Official performance docs say routes in one Foldkit application do not code-split.

**Assessment:** Foldkit is feasible in the broad sense, but the project would be adapting an application architecture into a document delivery system. That is the wrong learning constraint for this destination.

## Product-specific judgments

### Static-first bilingual correctness

All three can represent locale-prefixed URLs, but only Next already owns the full build-time route and metadata convention. Octane can match it with a manifest-driven generator; Foldkit can match it only after browser capture. None enforces the domain rule that every public page and authored item has an Equivalent translation. The content schema and build validation remain framework-independent.

### Library filters

Foldkit has the strongest built-in typed query model, but version one’s Library does not need an application-wide state architecture to gain typed URLs. Next can use a tiny Client Component. Octane can use its TanStack Router/React Router/nuqs ports or a narrow native URL adapter. The prototype should test progressive behavior: the Library remains readable without JS, filter state is linkable, and client routing announces/focuses correctly.

### Metadata and discovery

Next remains the low-work baseline. Octane’s metadata primitives are capable, but static sitemap/robots generation and social-image production must be explicit build steps. Foldkit’s `Document` metadata is intentionally narrow. All candidates still need one framework-neutral discovery manifest that asserts every locale route, canonical, alternate, sitemap entry, and social image.

### Images

No candidate removes the need for a repository image pipeline under static hosting. Next supplies rendering APIs but not its default optimizer in a pure export. Octane and Foldkit expose ordinary platform/Vite assets. The eventual technical specification should choose pre-generated local variants with intrinsic dimensions and documented provenance rather than make framework selection depend on an image service.

### Accessibility

The version-one interface is mostly semantic document markup, so framework component breadth matters less than preserving native behavior and minimizing navigation magic. Next has the best documented route behavior. Octane and Foldkit both show serious accessibility work, but their route transitions need direct screen-reader and focus testing. Framework claims do not replace acceptance tests for headings/landmarks, language switching, keyboard filters, reduced motion, no-JS reading, and route announcements.

### Learning value versus destination fit

- **TSRX + Next:** learn a new language/compiler while keeping the established framework and product conventions. Risk is paying compiler cost for syntax only, especially if interactive components and CSS must stay outside TSRX.
- **Octane:** learn compiler-driven UI, native events, SSR/hydration internals, and a young ecosystem. It offers the largest genuinely new frontend lesson among the candidates that can still plausibly serve static HTML.
- **Foldkit:** learn Effect and Elm Architecture deeply, but through complexity the personal home does not naturally have. The separate Effect repository-tooling decision is a better fit for that interest.

## Prototype gates to carry into shortlisting

### If Next.js with TSRX advances

Use the same Next configuration and content module as the ordinary Next candidate. The spike passes only if:

- every locale and content route appears in `out/`;
- `tsrx-tsc --noEmit` is a mandatory clean check;
- a `.tsrx` Server Component can host the representative TSX filter without weakening semantics or accessibility;
- the team explicitly accepts external CSS/CSS modules instead of TSRX scoped styles unless the current defect is fixed;
- source maps, editor diagnostics, formatting, linting, test coverage, and production builds all work in CI;
- the authoring benefit remains meaningful under those restrictions.

Re-test native `.tsrx` Client Components and scoped styles first. If either still fails, do not silently narrow the language after selection—the constrained hybrid is the candidate being judged.

### If Octane advances

The spike passes only if:

- one concise manifest-driven command writes Home, Library, and Book routes for both locales as static files;
- head metadata, sitemap, robots, 404, canonical/alternates, and social-image references are complete without a runtime server;
- repository content and scoped/external CSS build through the supported Vite pipeline, not an unmaintained compiler workaround;
- the Library filter hydrates progressively, preserves URL state, and passes keyboard, axe, focus, route-announcement, and no-JS checks;
- client JS, build time, and output stay within the same budgets as the established candidates;
- the custom exporter remains a small project seam with tests, not a local metaframework.

Pin exact packages. Any compiler correctness failure involving ordinary local variables, metadata, or hydration is a stop condition unless an upstream fix is released and covered by the spike.

### Foldkit

Do not spend a matched-prototype slot. Reconsider only in a new effort whose destination is an interaction-heavy application or whose explicit goal is to build the personal home as an Effect/Elm application despite the document mismatch.

## Unknowns to preserve

1. Whether current TSRX Turbopack defects are fixed before the actual prototype versions are pinned.
2. Whether the constrained Next/TSRX hybrid provides enough daily authoring value over ordinary TSX.
3. Whether Octane’s official Vite pipeline can produce a compact multi-route static artifact without reproducing its SSR app layer.
4. Measured initial-route JavaScript, prefetch traffic, build scaling, and browser performance for a like-for-like representative slice.
5. Real assistive-technology behavior for locale switching and client navigation in TSRX/Next and Octane.
6. The eventual responsive-image build step; no experimental candidate should be selected on an assumption here.

## Official sources

### TSRX / Next integration

- [TSRX Getting Started](https://tsrx.dev/getting-started)
- [TSRX beta notice and source](https://github.com/Ripple-TS/ripple/tree/main/website-tsrx)
- [`@tsrx/turbopack-plugin-react` source](https://github.com/Ripple-TS/ripple/tree/main/packages/turbopack-plugin-react)
- [`@tsrx/react` source](https://github.com/Ripple-TS/ripple/tree/main/packages/tsrx-react)
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js internationalization](https://nextjs.org/docs/app/guides/internationalization)
- [Next.js metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

### Octane

- [Octane README and status](https://github.com/octanejs/octane#status)
- [Getting started](https://github.com/octanejs/octane/blob/main/docs/getting-started.md)
- [Server and static rendering](https://github.com/octanejs/octane/blob/main/docs/ssr.md)
- [Build tools](https://octanejs.dev/docs/build-tools)
- [`@octanejs/seo`](https://github.com/octanejs/octane/tree/main/packages/seo)
- [Framework integrations](https://octanejs.dev/docs/framework-integrations)
- [Bindings status](https://github.com/octanejs/octane/blob/main/docs/bindings-status.md)

### Foldkit

- [Foldkit README and status](https://github.com/foldkit/foldkit)
- [What about SSR?](https://foldkit.dev/faq/what-about-ssr)
- [Routing and navigation](https://foldkit.dev/core/routing-and-navigation)
- [Performance and bundle size](https://foldkit.dev/get-started/performance)
- [Roadmap](https://foldkit.dev/get-started/roadmap)
- [Reference prerender script](https://github.com/foldkit/foldkit/blob/main/packages/website/scripts/prerender.ts)
