# Prototype results

## Verdict signal

All three configurations can emit the required bilingual static slice with complete routes, metadata, readable no-JavaScript content, URL-addressable filtering, and equivalent browser behavior. **Next.js with React is the strongest implementation candidate from this prototype.** Constrained TSRX adds learning surface but no product or artifact advantage here. Octane produces the smallest client artifact, but reproduces a pre-agreed compiler correctness stop condition in ordinary metadata code.

This is evidence for the follow-on framework decision, not that decision itself. The prototype ticket remains HITL until Duarte reacts to the running slice and the constrained TSRX authoring trade-off.

## Measured artifacts

See [MEASUREMENTS.md](MEASUREMENTS.md) for the generated record. Warm local production builds on Node 25.8.1 were:

| Stack | Build | `/en/library/` JavaScript, raw / gzip | Result |
| --- | ---: | ---: | --- |
| Next.js + React | 2.74 s | 630,786 / 187,305 B | Pass |
| Next.js + constrained TSRX | 3.25 s | 630,786 / 187,304 B | Pass, with integration costs |
| Octane | 1.85 s | 151,434 / 48,220 B | Artifact passes only after a disqualifying compiler workaround |

The byte count sums the JavaScript files referenced by the generated Library HTML, compressing each file separately. It is a reproducible comparison, not a network waterfall estimate.

## Product guardrails

`npm run check` verifies all three outputs contain:

- 16 equivalent locale/content routes: Home, Library, and six Book routes in English and Portuguese;
- `en-GB` / `pt-PT` document languages;
- canonical URLs and reciprocal language alternates;
- semantic `<main>` and heading structure;
- the complete six-Book Library in static HTML when JavaScript is unavailable;
- static `robots.txt`, sitemap, and 404 artifacts.

A real Chromium pass checked the representative filtered Library and Portuguese Book detail in every configuration:

- `?q=design&status=favorite` restored two matching Books after hydration;
- changing the filter to `?q=time` updated the URL and rendered only *The Order of Time*;
- Portuguese detail content and `pt-PT` were correct;
- the language switch retained the current Book route;
- the first Tab stop was the visible skip link with a solid focus outline;
- axe-core 4.10.3 found zero violations (40 passing rules for both Next configurations; 39 for Octane);
- disabling JavaScript left all six Books and the native filter form readable;
- no page errors appeared during hydration or filtering.

These checks do not replace later VoiceOver/NVDA route-announcement testing or performance testing on the selected hosting target.

## Development friction

### Next.js with React

- The slice used the normal App Router static-export path and generated every expected route.
- Metadata, canonical/alternate links, robots, and sitemap were direct framework conventions. Next 16.2.10 required `dynamic = 'force-static'` on the metadata routes under `output: 'export'`.
- The context-preserving language switch needs a small Client Component because a static parent layout does not receive child route parameters.
- This was the only candidate without a candidate-specific compiler, type-checker, route adapter, or static writer.

### Next.js with constrained TSRX

- The generated HTML and JavaScript bytes were effectively identical to ordinary React; TSRX changed authoring, not the shipped product.
- Next did not discover `page.tsrx` or `layout.tsrx` as route files. Four conventional TSX route wrappers are required around four TSRX Server Components.
- Next's built-in type-checker did not resolve imported `.tsrx` modules. The configuration needs both a mandatory `tsrx-tsc --noEmit` pass and a wildcard declaration explaining that Next's checker delegates `.tsrx` semantics to it.
- The interactive filter and language switch remain TSX Client Components; CSS remains external. This successfully exercises the intended TSRX-server-to-TSX-client boundary.
- The matched source is larger than ordinary React because route metadata and framework exports stay in TSX wrappers while authored markup lives in TSRX components. The warm build was about half a second slower.
- No product capability, output-size, or accessibility benefit appeared. The remaining benefit is Duarte's subjective learning and authoring enjoyment.

### Octane

- A 33-line manifest-driven writer emitted all static routes, metadata files, and document shells. The seam remained small rather than becoming a local metaframework.
- Automatic TSRX compiler discovery type-checked successfully. The documented explicit `"tsrx": { "compiler": "octane" }` setting failed with `Invalid ripple compiler`, so the prototype removed it.
- The first SSG run reproduced Octane 0.1.31's metadata-hoisting temporal-dead-zone defect: assigning a title expression to an ordinary local `const` caused `ReferenceError: Cannot access 'title' before initialization` in generated server output.
- Inlining those metadata expressions allowed the rest of the artifact and hydration behavior to be inspected. The workaround is marked in `src/App.tsrx`; under the agreed gate, the underlying compiler correctness failure already eliminates Octane unless an upstream release fixes it before selection.
- Octane shipped roughly one quarter of the representative Library JavaScript emitted by Next and built fastest. That material performance ceiling is real, but it does not override the explicit compiler-correctness boundary.

## Dependency note

The shared lockfile reports seven current advisories: one moderate and six high. Direct findings are pinned Next.js 16.2.10 and the prototype-only `serve` package; the reported Next advisories concern dynamic server, middleware, image-optimization, or Server Action paths excluded by this static architecture, but package status must be rechecked at implementation time. No production dependency choice should be copied from this throwaway branch without that refresh.

## Recommendation for reaction

Advance **Next.js with React** as the benchmark and likely implementation choice. Do not advance Octane while the metadata compiler defect remains. Advance constrained TSRX only if writing the TSRX components in this branch feels valuable enough to justify four route wrappers, a second checker/compiler, TSX-only interactive boundaries, and no shipped artifact improvement.
