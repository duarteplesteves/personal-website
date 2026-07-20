# Next.js vs TanStack Start for the personal home

**Research date:** 2026-07-13  
**Question:** Which framework better fits a static-first, bilingual personal home whose repository-managed content includes a growing Library, while keeping client JavaScript, operational work, and time-to-finish low?

## Short answer (judgment, not a decision)

**Provisional recommendation: prefer Next.js, conditionally.** Choose it if version one remains a mostly static content site and the priority is to finish with the lowest framework risk. Next.js currently has the stronger fit for build-time content routes, server-by-default React components, metadata/OG conventions, local MDX if it is ever needed, image/font ergonomics, and documented accessibility behavior. Its static-export image limitation must be designed around rather than discovered late.

**Choose TanStack Start instead only if its learning value is itself an explicit product constraint**—in particular, if Duarte wants hands-on experience with TanStack Router's type-safe routes/loaders/search parameters and Vite/Rsbuild portability—and accepts release-candidate framework risk plus a larger default client-hydration model. A growing, interactive Library could make that learning relevant, but the current version-one Library does not yet establish a concrete capability that only Start provides.

This is not a final framework decision. Tickets 03, 04, and 09 still determine the Library model, URL/localization policy, and maintenance workflow. The final decision should also require a small representative build comparison described below.

## Current status: facts

- **Next.js:** the current npm `latest` is **16.2.10**. The official 16.2 release post is dated 2026-03-18, and current documentation identifies itself as 16.2.10. This is a stable, established release line. [Next.js 16.2 release](https://nextjs.org/blog/next-16-2) and [npm registry record](https://registry.npmjs.org/next/latest) (accessed 2026-07-13).
- **TanStack Start:** the current npm `latest` for `@tanstack/react-start` is **1.168.28**, but the official Start overview still explicitly labels the framework **Release Candidate**: feature-complete and API-stable, but not bug-free. It also labels React Server Components experimental. The package's coordinated 1.x version must therefore not be interpreted as a Start GA declaration. This mismatch in version signaling is itself a maturity/documentation risk. [Start overview](https://tanstack.com/start/latest/docs/framework/react/overview) and [npm registry record](https://registry.npmjs.org/%40tanstack%2Freact-start/latest) (accessed 2026-07-13).
- Runtime floors differ: the current packages declare Node `>=20.9.0` for Next.js and Node `>=22.12.0` for TanStack Start. This is unlikely to matter for a new project, but it belongs in deployment/CI setup. Same npm registry records (accessed 2026-07-13).

## Capability comparison: facts

| Concern | Next.js 16.2 | TanStack Start current RC |
|---|---|---|
| Static generation | `output: 'export'` produces an `out` directory containing an HTML file per route plus assets. Dynamic paths must be enumerated with `generateStaticParams`. Features requiring a server are rejected/unsupported. [Static exports](https://nextjs.org/docs/app/guides/static-exports) and [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) (accessed 2026-07-13). | Prerendering emits static HTML. Static routes are discovered automatically; dynamic routes can be found by crawling links or listed explicitly in `pages`. `failOnError`, retries, filtering, output paths, and concurrency are configurable. [Static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering) (accessed 2026-07-13). |
| Minimal client JS | App Router layouts/pages are Server Components by default. Next documents Server Components as a way to reduce browser JS; Client Components are opt-in with `use client`. Static export still emits an RSC payload for client navigation, and Client Components still hydrate. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) and [static exports](https://nextjs.org/docs/app/guides/static-exports) (accessed 2026-07-13). | Start server-renders/prerenders route components, then hydrates the document with `StartClient` to enable client routing. Automatic route code splitting limits route code loaded initially, but it does not remove the hydration runtime. Start's RSC support is experimental. [Client entry point](https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point), [automatic code splitting](https://tanstack.com/router/latest/docs/framework/react/guide/automatic-code-splitting), and [Start overview](https://tanstack.com/start/latest/docs/framework/react/overview) (accessed 2026-07-13). |
| Bilingual routing | Official guidance uses a locale path segment such as `[lang]`, validates dictionaries, sets `<html lang>`, and uses `generateStaticParams` to build locale routes. Request-language redirection uses Proxy, which is a runtime feature and therefore not available in a pure static export. [Internationalization](https://nextjs.org/docs/app/guides/internationalization) and [static exports](https://nextjs.org/docs/app/guides/static-exports) (accessed 2026-07-13). | Router provides optional/prefixed locale params, rewrites, typed params, language-switching patterns, and a Start + Paraglide example. The guide shows enumerating localized prerender routes. Router is library-agnostic; the application owns locale/content policy. [Internationalization](https://tanstack.com/router/latest/docs/guide/internationalization-i18n) (accessed 2026-07-13). |
| Metadata and social images | Typed static/dynamic metadata; route conventions for icons, robots, sitemap, Open Graph and Twitter images; `ImageResponse` can generate images. Prerendered metadata resolves at build time. `alternates.languages` supports language alternates. [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images), [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), and [robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) (accessed 2026-07-13). | Route `head` functions support title, meta, links, scripts and loader-derived values, including Open Graph, canonical links, and JSON-LD. The SEO guide documents generated/static sitemaps and robots files. These are capable but more manually assembled than Next's file conventions. [Document head management](https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management) and [Start SEO](https://tanstack.com/start/latest/docs/framework/react/guide/seo) (accessed 2026-07-13). |
| Content in the repository | Local `.md`/`.mdx` is officially supported through `@next/mdx`, including Server Components. Frontmatter is **not** supported by default and requires exports or an additional parser/plugin. JSON/TS content also works through ordinary imports. [MDX](https://nextjs.org/docs/app/guides/mdx) (accessed 2026-07-13). | Start has no first-party content or MDX model in its documentation. Because it uses Vite or Rsbuild, ordinary TS/JSON modules and the bundler/plugin ecosystem are available; Vite officially supports JSON, assets, and `import.meta.glob`. [Start overview](https://tanstack.com/start/latest/docs/framework/react/overview) and [Vite features](https://vite.dev/guide/features) (accessed 2026-07-13). |
| Images and fonts | `next/image` supplies dimensions/aspect-ratio handling, lazy loading and responsive image APIs. However, a static export **cannot use the default image optimization loader**; it needs a custom image service/loader or unoptimized/pre-generated files. `next/font` self-hosts and optimizes font files at build time. [`Image`](https://nextjs.org/docs/app/api-reference/components/image), [static export image limitation](https://nextjs.org/docs/app/guides/static-exports#image-optimization), and [`next/font`](https://nextjs.org/docs/app/api-reference/components/font) (accessed 2026-07-13). | No Start-specific image optimization component or documented font pipeline was found. Vite supports imported/public assets, while responsive variants, dimensions, compression, and remote book-cover policy remain application/build-plugin or image-service work. [Vite static asset handling](https://vite.dev/guide/assets) (accessed 2026-07-13). |
| Accessibility support | Next documents a built-in route announcer for client transitions. The framework still does not guarantee semantics, contrast, focus quality, reduced motion, or keyboard behavior. [Accessibility](https://nextjs.org/docs/architecture/accessibility) (accessed 2026-07-13). | No dedicated Start/Router accessibility guide was found in the current official documentation. Routes ultimately render React/HTML, so semantic markup remains possible, but client-navigation announcement/focus behavior should be verified rather than assumed. This is an evidence gap, not proof that Start is inaccessible. |
| Deployment | A static export can be served by any static web server. Next also documents Node, Docker, and platform adapters, but those are unnecessary if the product remains static. [Deploying](https://nextjs.org/docs/app/getting-started/deploying) (accessed 2026-07-13). | Prerendered HTML can be served without generating it on demand. For full-stack deployment, official docs cover Cloudflare, Netlify, Railway, Nitro, Vercel, Node, and Bun. A static-only deployment should avoid server functions; the separate “static server functions” facility is explicitly experimental. [Static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering), [hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting), and [static server functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions) (accessed 2026-07-13). |

## Product-specific assessment: judgments

### 1. Static-first architecture and a growing Library

Both frameworks can generate every Portuguese and English page at build time from a validated repository manifest. Neither needs a database, CMS, runtime API, server function, ISR, or edge middleware for the stated product.

Next's explicit `generateStaticParams` is a good fit for correctness: derive every `(locale, work-or-edition slug)` pair from the content model and fail the build if a translation or route is absent. Start can do the same with an explicit `pages` list. Its link crawler is convenient, but relying on crawling alone would make an unlinked Library item silently absent from the export; use the repository manifest as the source of truth instead.

Library growth multiplies routes by two locales, but a personal catalog is unlikely to stress either builder. Build time and output size should still be measured with a synthetic larger catalog rather than guessed.

### 2. Minimal JavaScript and performance

**Next has the better architectural ceiling for low client JS today** because ordinary content pages can remain Server Components while only a filter, language control, or small delight becomes a Client Component. Start's standard model hydrates the React document; route splitting reduces how much route code arrives, not the need for a client router/hydration runtime. Using Start's experimental RSC support to close that gap would be inappropriate for a finishability-first version one.

This is not a claim that Next will automatically be faster. A careless Next implementation can ship more JS and worse images than a disciplined Start implementation. Static HTML, restrained CSS, no unnecessary animation libraries, explicit font budgets, correct responsive images, and measured Core Web Vitals matter more than framework branding. Disable speculative prefetch where it creates waste and keep Library filtering URL-addressable and progressively understandable.

### 3. Bilingual correctness

Both can produce durable locale-prefixed URLs, set `lang`, expose a language switch, and emit canonical/alternate metadata. Neither framework enforces the project's stronger domain rule that every public page and authored item has an equivalent Portuguese (Portugal) and English expression. That belongs in a shared, framework-independent content schema and build validation.

For a static site, prefer explicit `/pt/...` and `/en/...` pages. Decide separately what `/` does: a neutral language chooser, a fixed default redirect supplied by the host, or a default-language page. Do not choose either framework on the promise of request-header locale negotiation unless a runtime is deliberately accepted.

### 4. Repository content and maintenance

The Library is structured domain data, so JSON/YAML/TS plus schema validation is a better default than treating every book as MDX. Longer Selected Work and Reflections may use MDX only if authoring proves useful. Next has the clearer documented local-MDX path; Start can add a Vite MDX/content plugin, but that is another choice to own. Neither framework removes the need for ISBN/edition modeling, bilingual validation, cover provenance, or a low-friction update command.

A framework-neutral content module should expose validated works, editions, reading events, translations, and route records. This keeps ticket 11 from entangling the domain model with route files and preserves the option to switch frameworks.

### 5. Metadata, images, accessibility

Next's metadata and OG-image conventions reduce bespoke code and are a concrete product advantage. The largest Next trap is assuming `next/image`'s default optimizer works on a pure static host; it does not. For this site, pre-generate a small controlled set of local responsive variants during the build, or choose a named image CDN/custom loader. Remote book-cover URLs also require a provenance, caching, failure, dimensions, and privacy policy regardless of framework.

Accessibility remains implementation work in both. Next's documented route announcer is a modest advantage. With either framework, acceptance must test headings/landmarks, language changes, alt text, keyboard and focus behavior, reduced motion, contrast, no-JS content access, and screen-reader announcements on client navigation.

### 6. Deployment simplicity

If every route and asset is generated, both can be deployed as immutable static files and avoid framework-specific runtime adapters. Next documents the static artifact and limitations more directly. Start offers broader full-stack runtime portability, but that capability is not valuable to version one unless a real server requirement appears. Static hosting also reduces the practical significance of Next's Vercel association.

### 7. Learning value and finishability

- **Next learning value:** Server/Client Component boundaries, build-time rendering, modern metadata, image/font budgets, and a widely used React framework. Cost: many conventions and tempting dynamic features that this site does not need.
- **Start learning value:** TanStack Router's strongly typed route params, loaders, search params, and explicit Vite/Rsbuild/deployment model. This becomes especially relevant if the Library develops substantial URL-driven filtering and data loading. Cost: current RC status, faster-moving docs/packages, manual content/image choices, and learning full-stack facilities that version one should not use.
- **Finishability judgment:** Next is lower risk now. Start is a valid deliberate learning bet, not the simpler default for the current product.

## Unknowns and risks to carry into ticket 11

1. **Start maturity signal:** official docs still say RC despite a 1.x npm version. Recheck for an explicit GA announcement immediately before implementation; do not infer GA from package numbering.
2. **Measured output:** no controlled, like-for-like build was made in this research. Baseline and per-route JS, route prefetch traffic, HTML size, build duration, and Lighthouse/axe results remain unknown.
3. **Library scale/model:** route count, filters, reading-history pages, and work-versus-edition URLs await ticket 03. They may change the value of TanStack Router's typed search parameters, but not the ability to statically render.
4. **Bilingual URL policy:** root behavior, translated slugs, switch semantics, canonical/hreflang rules, and fallback policy await ticket 04. Runtime locale detection would change deployment assumptions.
5. **Maintenance format:** JSON/YAML/TS/MDX boundaries and validation/import tooling await ticket 09. Next's MDX advantage matters only if MDX is actually selected.
6. **Image pipeline:** static Next image optimization and Start's lack of a built-in pipeline both require a deliberate solution. Book-cover rights, hotlinking, missing covers, intrinsic dimensions, and generated OG images remain open.
7. **Hosting:** the target host is unspecified. Static output is portable, but redirects, trailing-slash behavior, custom headers, preview deploys, and 404 handling must be tested on the chosen host.
8. **Accessibility under client navigation:** especially for Start, route announcement and focus behavior need a real assistive-technology check.

## Conditional recommendation and decision gate

### Select Next.js if all are true

- Static export is the deployment boundary.
- Most pages are content and can stay Server Components.
- The project values established documentation, metadata conventions, and finishing over router experimentation.
- The team agrees not to introduce Proxy, Server Actions, ISR, request-dependent handlers, or the default image optimizer into the static architecture.
- An explicit build-time image strategy is accepted.

### Select TanStack Start if all are true

- Learning TanStack Router/Start is a named goal worth schedule and churn risk.
- The final Library UX materially benefits from typed URL search/filter state and route loaders.
- Release-candidate status is still acceptable at implementation time (or Start has explicitly reached GA).
- Whole-document hydration and its measured JS cost pass the site's performance budget.
- The team accepts ownership of content, image, sitemap/robots, and accessibility details that Next packages more conventionally.

### Required 1-day validation spike before the final decision

Implement the same tiny slice in both current versions:

- `/pt` and `/en` home pages with correct `lang`, canonical, and language alternates;
- one Selected Work route and 20 synthetic Library detail routes per locale, generated from one validated repository manifest;
- a Library filter with URL state and keyboard operation;
- one local hero image, one representative book cover, one OG image, sitemap, robots, and a custom 404;
- pure static deployment configuration only.

Compare clean-install/build friction, generated route completeness, build time, total and initial-route JS (compressed and uncompressed), image output, no-JS readability, Lighthouse/Core Web Vitals, axe results, route announcement/focus behavior, and static-host preview behavior. If the results are close, choose Next for lower maturity risk; choose Start only when the learning/typed-router benefit is concrete and consciously prioritized.
