# Static publication and discovery research

_Research snapshot: 2026-08-11. Provider plans and platform limits are volatile and should be rechecked when hosting is provisioned._

## Executive findings

The Octane output is a conventional prebuilt static artifact, so version one does not need a framework-aware host, application server, serverless function, or edge runtime. The consequential hosting differences are instead:

1. whether `/` can choose a Site language from a saved preference and `Accept-Language` without application code;
2. whether redirects, custom response headers, locale-specific 404s, immutable deploys, and protected or non-indexable previews are first-class;
3. whether deployment can consume the already-verified artifact rather than becoming a second, divergent build path; and
4. what visitor information the host and any optional analytics collect.

Two publication choices remain viable:

- **Pure-static resolver:** `/` is a small static, crawlable `x-default` document with direct `/en` and `/pt` links. A tiny inline or same-origin script reads only the explicitly saved preference and `navigator.languages`, then uses `location.replace()` to choose `/pt` or `/en`, falling back to English. This works on every candidate host and preserves Octane's no-runtime boundary. It must remain useful without JavaScript and must not be the only discovery path.
- **CDN language redirect:** a platform routing rule applies only to `/`, prefers the explicit language cookie, then parses browser language, then temporarily redirects to English. Netlify documents this directly; Vercel exposes conditional header/cookie routing but requires the matching policy to be authored and tested. Cloudflare Pages `_redirects` explicitly does not support language- or cookie-conditioned redirects, so it would need a Worker/Function or the client resolver. GitHub Pages has no documented equivalent routing primitive.

The explicit locale routes remain authoritative in either design. A direct `/pt/...` or `/en/...` request must never be negotiated away. Googlebot generally sends no `Accept-Language`, so both locale trees need ordinary links, rendered content, reciprocal language-alternate annotations, and a sitemap. Language negotiation is a visitor convenience, not a discovery mechanism.

For version one, the defensible observability floor is provider deploy logs and status, a synthetic availability check, Search Console, and pre/post-launch lab checks. Product analytics can be omitted. If Duarte wants aggregate traffic or real-user performance, Cloudflare Web Analytics and Netlify Web Analytics avoid cookies but have materially different collection: Cloudflare's browser beacon supplies RUM; Netlify derives analytics from CDN logs and counts unique visitors by IP address. “Cookie-free” is not equivalent to “no processing,” so the selected mechanism and retention still need a plain privacy disclosure and a deliberate data-minimisation review.

## 1. Root Site-language selection

### Browser and crawler facts

- `Accept-Language` is a hint, not an instruction. MDN explicitly says it must not override an explicit language choice. Browsers may reduce the list for fingerprinting resistance.
- `navigator.languages` usually corresponds to browser language preference order, but it is available only to JavaScript.
- Googlebot's locale-adaptive crawler usually appears from a US IP and sends no `Accept-Language`. Google warns that locale-adaptive delivery can leave variants uncrawled or unindexed.
- Google determines page language from visible content, not from `lang` or `hreflang`. The HTML `lang` value is still required for accessibility and browser behavior.
- A cache whose response or redirect depends on request headers needs the appropriate `Vary` behavior. `Vary: Accept-Language` separates cached variants; cookie-dependent routing also needs platform-aware cache handling. A static client resolver avoids this cache-key problem because `/` returns the same document to everyone.
- Social crawlers consume server-returned source metadata. A JavaScript redirect cannot be assumed to supply a locale-specific link preview for `/`; the root document needs deliberate fallback metadata of its own.

### Mechanism comparison

| Mechanism | Saved preference first | Browser preference | No JavaScript | No deployed runtime | Operational consequence |
| --- | ---: | ---: | ---: | ---: | --- |
| Static chooser only | no automatic choice | no automatic choice | yes | yes | Simplest and most crawler-legible, but adds a choice on first visit. |
| Static chooser plus client resolver | yes, via narrowly scoped local state | yes, via `navigator.languages` | chooser remains | yes | Portable across all hosts; resolver and CSP hash become build/test obligations. |
| Netlify language rule | yes, via documented `nf_lang` cookie | yes, CDN `Language` condition | yes | yes, as platform routing configuration | Uses 302 because Netlify does not support 307; provider owns cache variation. |
| Vercel conditional redirect | yes, by cookie matcher | yes, by request-header matcher | yes | yes, as platform routing configuration | Supports temporary 307 and header/cookie conditions, but correct weighted `Accept-Language` matching needs a deployed test. |
| Cloudflare Pages `_redirects` | no | no | yes | yes | Static `_redirects` explicitly lacks language and cookie conditions. A Worker/Pages Function would cross the selected no-runtime boundary. |
| GitHub Pages | no documented primitive | no documented primitive | yes | yes | Requires a static chooser/client resolver or an additional proxy/CDN. |

### Required behavior regardless of mechanism

The already-decided order can be implemented without ambiguity:

1. At `/` only, use the preference saved by an explicit click on the language control.
2. Otherwise map the first supported browser preference: any `pt-*` to `/pt`, any `en-*` to `/en`.
3. Fall back to `/en` for absent or unsupported language preferences.
4. Use a temporary redirect (`302` or `307`) or client `location.replace()`, never a permanent redirect.
5. Do not save a preference merely because a direct localized URL was opened.
6. Do not negotiate requests below `/pt` or `/en`.
7. Keep direct, semantic links to both locale homes in the root HTML, with a useful no-script state.
8. Scope preference storage to the language value only, give it an explicit lifetime, and allow the language control to replace it.

If client resolution is selected, the script can be tiny and deterministic. It should run before rendering a misleading language choice, preserve browser back-button behavior with `replace`, tolerate storage access failure, and be covered by a fixed CSP hash if an enforced CSP disallows arbitrary inline scripts.

## 2. Search and bilingual discovery contract

### Clean route metadata

Each public localized route should be build-addressable from one route inventory and emit metadata in the HTML source, not only after hydration:

- a unique localized `<title>` and concise localized meta description;
- `<html lang="en-GB">` or `<html lang="pt-PT">`;
- one absolute, self-referential canonical URL in the same language;
- reciprocal, fully qualified `hreflang="en-GB"` and `hreflang="pt-PT"` links, including self;
- a deliberate `x-default` target where one genuinely exists; `/` naturally fits the auto-selecting Home case, while deeper routes need not invent a selector URL;
- one canonical HTTPS hostname, with HTTP and the secondary apex/`www` hostname permanently redirected to it;
- visitor-facing metadata—including titles, descriptions, social copy, error copy, and accessibility labels—as complete Equivalent translation pairs.

Google requires every language member to link to itself and every other member; missing return links can cause the annotations to be ignored. It also recommends that an `hreflang` page canonicalize to the same language, not collapse Portuguese into English. Canonical and alternate URLs should be absolute.

The `lang` attribute and `hreflang` serve different jobs: `lang` assists user agents and accessibility; `hreflang` describes equivalent URLs to search engines; visible text remains the strongest language signal.

### Library query state

The Standalone Library's shareable search, view, and ordering parameters should remain interaction state, not additional publication routes:

- emit a canonical pointing to the clean locale Library URL for every query-state response;
- include only the clean locale Library URLs in the sitemap;
- do not generate internal anchor grids for every filter combination;
- normalize parameter names, order, and invalid values in the client so shares are stable;
- keep the complete Library in initial semantic HTML, allowing crawlers and no-JavaScript visitors to read it;
- ensure analytics, if any, does not retain visitor search text or full query strings.

Google warns that faceted query parameters can create effectively unbounded crawl spaces. This Library is small and serves one static document for all query states, so crawl capacity is not the practical risk; duplicate URL discovery and accidental analytics capture are. A clean canonical plus restrained internal linking is proportionate. `robots.txt` is not a canonicalization mechanism, and blocking a URL there prevents a crawler from seeing a page-level `noindex` or canonical signal.

### Sitemap, robots, and errors

- Generate one UTF-8 XML sitemap from the route inventory with only absolute canonical public URLs. It may include reciprocal locale links, although duplicating correctly maintained HTML `hreflang` in the sitemap is not required by Google.
- Put `robots.txt` at the origin root and include the absolute sitemap URL. Do not use it to hide previews; previews should return `X-Robots-Tag: noindex` and ideally be access-controlled.
- Generate localized 404 documents and ensure unknown URLs return an actual `404`, not a `200` fallback. Cloudflare Pages resolves the nearest nested `404.html`; Netlify documents locale-path 404 rules. Any chosen host must prove equivalent behavior for `/en/*` and `/pt/*`.
- Error documents should carry `noindex`, avoid canonicalizing arbitrary bad URLs as valid pages, preserve navigation to both Site languages, and not load optional analytics.
- Redirect known historical/host variants with permanent status only when the destination is invariant. Language selection remains temporary.

### Structured data

Structured data is optional, must describe visible facts, and does not guarantee a rich result. The defensible small set is:

- one `WebSite` node for the site name at the domain root relationship; Google supports only one site name per domain/subdomain and says the root URI is the home page for this purpose;
- a `ProfilePage`/`Person` description for Home only if Home's primary focus remains Duarte, with `name` and only truthful, visible `sameAs` links;
- no invented image, ratings, reviews, interaction counts, occupations, or credentials;
- no large `ItemList` or `Book` graph merely because the Library contains Books. There is no version-one Book detail route, and markup has no value if it exceeds what the visible page clearly supports.

A root that only redirects deserves a deployed Search Console check: Google's site-name guidance requires `WebSite` data on the domain root, while its troubleshooting guidance says a working root redirect can make the site name reflect the target. A static root chooser makes the root directly crawlable and can carry the single `WebSite` node without that ambiguity.

## 3. Link previews

Open Graph's baseline object has `og:title`, `og:type`, `og:image`, and `og:url`; `og:description`, `og:site_name`, `og:locale`, and `og:locale:alternate` are recommended additions. For this site:

- use localized title and description;
- use the clean absolute locale URL for `og:url`;
- use `og:type=website` for Home and Library rather than pretending the unpaginated Library route is one Book;
- use `en_GB` and `pt_PT` underscore syntax for Open Graph locales;
- if an image is supplied, use an absolute HTTPS URL and include width, height, MIME type, and meaningful `og:image:alt`;
- add X card tags only where they provide a tested improvement; Open Graph remains the interoperable base.

LinkedIn currently asks for Open Graph title, image, description, and URL and recommends a 1.91:1 image at least 1200×627 and at most 5 MB. The generic 1200×630 convention fits that requirement. However, a social image is a preview enhancement, not a search or page-launch requirement. The “no image asset required for launch” decision can remain intact in either of two ways:

1. launch with correct title/description/URL tags but no promise of rich image cards; or
2. have the build deterministically generate one restrained, site-owned, bilingual-neutral or per-locale text card from existing identity tokens, treating it as generated metadata rather than an authored content image.

Do not point `og:image` to a nonexistent placeholder. Preview bots cache aggressively, so launch verification should use the relevant inspectors and confirm that preview and staging hosts cannot become the canonical `og:url`.

## 4. Static host evidence

### Capability matrix

| Host | Prebuilt static artifact | PR/branch previews | Route/header control | Root language fit | Material constraints for this project |
| --- | --- | --- | --- | --- | --- |
| Cloudflare Pages | Git build or Wrangler direct upload | Immutable hash URLs plus moving branch aliases; preview responses default to `X-Robots-Tag: noindex`; optional Access protection | `_headers`, `_redirects`, nearest nested 404s | Client resolver unless a runtime is accepted | Free-plan docs: 500 builds/month, 20-minute timeout, 20,000 files, 25 MiB/file, 100 header rules. Apex custom domain requires the domain as a Cloudflare zone/nameservers; an external-DNS subdomain can CNAME. |
| Netlify | Build output directory or prebuilt deploy | PR preview plus immutable deploy permalink | `_headers`/`netlify.toml`, redirects, language conditions, `nf_lang`, localized 404 rules | Best documented server-side match to the decided order | Language redirect uses 302 (307 unsupported). Header configuration is global unless deploy-context files are copied during the build. Pricing/credits and preview protection must be checked at provisioning. |
| Vercel | “Other” framework plus configured output directory | Commit and branch preview URLs | `vercel.json` headers and conditional redirects; 307/308 defaults | Technically viable through cookie/header conditions | Correct `Accept-Language` weighting is configuration-owned and must be tested. Platform is broader than this static site's needs; current plan limits and preview indexing/protection need confirmation at provisioning. |
| GitHub Pages | Any static generator through a custom Actions artifact | No first-class PR preview site in the Pages workflow | HTTPS/custom domain, but no documented repository-level response-header or conditional-route configuration | Client resolver/static chooser | Published site recommended limit 1 GB; soft 100 GB/month bandwidth; deployment timeout 10 minutes. Visitor IP addresses are logged for security. A secondary CDN would erase much of its simplicity advantage if headers or negotiation are required. |

### Consequences for the hosting decision

- **If host-side language selection is mandatory**, Netlify has the clearest documented fit. Vercel remains feasible after a representative `Accept-Language`/cookie test. Cloudflare Pages and GitHub Pages fall behind unless the no-runtime boundary is reopened.
- **If the already-accepted client resolver is acceptable**, Cloudflare Pages becomes a strong static fit because its previews, noindex default, headers, nested 404 behavior, compression, direct artifact upload, and limits fit comfortably. Netlify remains equally viable but offers capability that version one may not need.
- **GitHub Pages is the minimum-service option**, but lack of route/header controls weakens security-header, preview, localized-error, and root-negotiation ergonomics.
- **Build once, deploy that artifact** is preferable to trusting a provider-only build. CI should run content validation, Octane generation, metadata checks, and tests, then upload exactly the passing output. Provider Git builds are acceptable only if they run the same pinned command and expose the resulting commit/artifact unambiguously.
- Do not couple authored content or generated routes to a provider file format. Produce `_headers`, `_redirects`, `netlify.toml`, or `vercel.json` from or beside the same site-owned publication contract.

## 5. Security, privacy, analytics, and observability

### Static response posture

The chosen host must be able to prove, at minimum:

- HTTPS enforcement and one canonical host;
- `X-Content-Type-Options: nosniff`;
- a deliberate `Referrer-Policy` (the common `strict-origin-when-cross-origin` default is reasonable);
- framing protection through CSP `frame-ancestors 'none'` or a compatible fallback;
- a narrow `Permissions-Policy` for unused capabilities;
- an enforced Content Security Policy derived from the actual Octane artifact, not copied blindly;
- long-lived `immutable` browser caching only for content-hashed assets, while HTML and metadata remain revalidatable;
- compression, correct MIME types, strong validation (`ETag` is sufficient), and no mixed content.

CSP should start in report-only mode or be exercised against the exact artifact before enforcement. The root resolver, JSON-LD, Octane hydration, and any analytics beacon affect the policy. Avoid weakening it with broad `unsafe-inline`/`unsafe-eval`; prefer external same-origin code or fixed build hashes where practical. HSTS should be enabled only after HTTPS and all intended subdomains are proven; preload is unnecessary for launch.

### Privacy and analytics choices

**No product analytics** is a complete version-one choice. It minimizes code, policy surface, third-party requests, CSP allowances, and the temptation to optimize a personal home around traffic.

If aggregate evidence is wanted:

- **Cloudflare Web Analytics** uses a JavaScript beacon and the browser Performance API for real-user monitoring. Cloudflare says it uses no cookies/localStorage and does not fingerprint visitors for analytics. It adds a third-party script/request, CSP entries, and runtime work, but supplies field performance evidence.
- **Netlify Web Analytics** uses CDN logs, no client code or cookies, and reports hourly aggregate charts. Its current documentation says “unique visitors” are different IP addresses in the selected period and exposes top locations, pages, referrers, and 404s. This avoids page weight but still processes request data and is a paid add-on whose current terms must be checked.
- **Provider edge logs exist even without product analytics.** GitHub explicitly says Pages visitor IP addresses are logged for security; every host's privacy/DPA and retention terms should be reviewed rather than promising “no data collection.”

For either analytics option:

- do not send Library search terms or complete query strings;
- disable collection on preview and local hosts;
- collect no cross-site identifiers, advertising profiles, or session replay;
- document provider, purpose, fields, retention, and contact in concise Equivalent translations;
- treat a language preference cookie/localStorage value as functional local state, not analytics; scope and disclose it separately;
- reassess Portuguese/EU consent and controller obligations against the actual configured behavior. Vendor “GDPR compliant” copy is evidence, not a substitute for that assessment.

Self-host fonts and essential assets where licensing allows. Every third-party asset request exposes at least network metadata and creates another availability, privacy, CSP, and performance dependency.

### Observability boundary

A low-traffic static personal home does not justify application-error infrastructure by default. The useful boundary is:

- CI/build diagnostics and retained deploy logs;
- immutable deployment identity and one-step rollback/promotion;
- an external uptime check for the canonical root, `/en`, `/pt`, and one Library route;
- provider status notifications;
- Search Console domain verification, sitemap status, URL inspection, indexing issues, and Core Web Vitals when field data becomes available;
- periodic PageSpeed Insights/CrUX checks, understanding that a new low-traffic site may have no origin- or URL-level field data;
- optional client error collection only if the progressively enhanced Library produces failures that cannot be diagnosed with tests and manual reports.

Current Core Web Vitals “good” thresholds are LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1 at the 75th percentile, split by mobile and desktop. Lab Lighthouse cannot measure real INP and is not a substitute for field data; it remains useful as a regression gate before enough traffic exists.

## 6. Launch verification contract

The implementation-ready specification should require a repeatable verifier rather than a manual launch checklist alone.

### Before deployment

- a clean checkout performs the pinned content check and static build without network-dependent content;
- the generated artifact contains exactly the route inventory, paired locale pages, nested 404s, sitemap, robots file, icons/manifest if chosen, and provider configuration;
- crawl the built artifact with JavaScript disabled and fail on broken internal links/assets, invalid duplicate IDs, missing document language, missing title/description/canonical, non-reciprocal locale links, preview-domain absolute URLs, or unpaired public routes;
- validate sitemap XML, JSON-LD syntax, Open Graph absolute URLs, and ISBN/source-faithful metadata escaping;
- test the Library with no JavaScript and then with enhancement for keyboard, narrow-screen, reduced-motion, long-string, empty-state, and copied-query behavior;
- run automated accessibility checks plus manual keyboard and screen-reader smoke tests;
- set performance budgets for HTML/CSS/JS/font weight and run Lighthouse against representative Home and Library builds, without treating a score alone as acceptance;
- verify CSP and other headers against the built artifact in a host-equivalent local or preview environment.

### On the deployment preview

- confirm preview access policy or `X-Robots-Tag: noindex` on HTML and assets where appropriate;
- exercise root selection with saved Portuguese, saved English, ordered `Accept-Language` examples, unsupported language, blocked storage, and JavaScript disabled;
- confirm direct locale URLs are never redirected and language switching preserves Equivalent route/query state;
- request unknown `/en/*` and `/pt/*` URLs and assert status `404`, localized content, and `noindex`;
- inspect compression, content types, cache policy, security headers, canonical/hreflang/OG URLs, and the absence of analytics on previews;
- test current Chrome, Safari, Firefox, and one iOS/Android screen-reader path proportionate to the interaction surface.

### At production cutover

- verify DNS ownership, apex/`www` policy, certificate chain/renewal, HTTP→HTTPS and secondary-host redirects, and absence of redirect loops;
- prove that every canonical, alternate, sitemap, structured-data, and social URL uses the final HTTPS host;
- confirm root choice and cache variation from at least two geographic/network contexts if host negotiation is used;
- submit the sitemap and inspect one Home and one Library locale URL in Search Console;
- run Schema Markup Validator/Rich Results Test where applicable and LinkedIn/social preview inspectors if preview metadata is shipped;
- record the deployment identifier and rehearse rollback to the previous immutable artifact;
- start the uptime check and confirm alert delivery;
- verify the public privacy statement against the analytics and preference mechanisms actually enabled.

### After launch

- recheck indexing, canonical selection, locale pairing, 404s, and Core Web Vitals after crawlers and field data have had time to appear;
- rerun the production verifier after domain, host, Octane, metadata, analytics, or CSP changes;
- refresh provider limits, pricing, and privacy claims periodically rather than freezing this 2026 snapshot into the product model.

## Inputs now available to the next decisions

The discovery-metadata decision can now settle:

- whether `/` is a crawlable selector/client resolver and its `x-default`, canonical, social, and `WebSite` semantics;
- exact per-route canonical/alternate/robots/Open Graph/JSON-LD contracts;
- whether version one generates a social card or deliberately accepts text-only previews;
- clean Library canonical behavior for query state;
- sitemap and localized-error metadata.

The hosting/publication decision can now settle:

- client resolver versus CDN language rule;
- Cloudflare Pages versus Netlify (with Vercel/GitHub Pages as explicit alternatives);
- prebuilt-artifact deployment and preview/protection workflow;
- analytics omitted versus one minimal aggregate option;
- the static observability floor, headers, and launch gates.

## Sources

All sources accessed 2026-08-11.

### Language, crawling, and metadata

- [Google: localized versions and `hreflang`](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: locale-adaptive crawling](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)
- [Google: canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: faceted navigation crawl management](https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation)
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: robots meta and `X-Robots-Tag`](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google: `ProfilePage` structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
- [Google: site names and `WebSite` structured data](https://developers.google.com/search/docs/appearance/site-names)
- [MDN: `Accept-Language`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-Language)
- [MDN: `Vary`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Vary)
- [Open Graph protocol](https://ogp.me/)
- [LinkedIn sharing metadata and image requirements](https://www.linkedin.com/help/linkedin/answer/a521928)

### Hosting and operations

- [Cloudflare Pages: Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages: Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Cloudflare Pages: redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages: headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Cloudflare Pages: serving behavior and 404s](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Cloudflare Pages: preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Cloudflare Pages: limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Pages: custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Netlify: redirects and rewrites](https://docs.netlify.com/manage/routing/redirects/overview/)
- [Netlify: redirect options, language conditions, and 404s](https://docs.netlify.com/manage/routing/redirects/redirect-options/)
- [Netlify: custom headers](https://docs.netlify.com/manage/routing/headers/)
- [Netlify: Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/)
- [Vercel: project configuration, headers, and conditional redirects](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel: environments and preview deployments](https://vercel.com/docs/deployments/environments)
- [GitHub Pages: overview and data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)
- [GitHub Pages: custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages: HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [GitHub Pages: limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

### Privacy and performance

- [Cloudflare Web Analytics: overview](https://developers.cloudflare.com/web-analytics/about/)
- [Cloudflare Web Analytics: privacy and collection methods](https://www.cloudflare.com/web-analytics/)
- [Netlify Web Analytics: overview](https://docs.netlify.com/manage/monitoring/web-analytics/overview/)
- [Netlify Web Analytics: collection and unique-visitor method](https://docs.netlify.com/manage/monitoring/web-analytics/how-web-analytics-works/)
- [Netlify Web Analytics: usage and billing](https://docs.netlify.com/manage/monitoring/web-analytics/usage-and-billing/)
- [web.dev: Core Web Vitals thresholds and measurement](https://web.dev/articles/vitals)
