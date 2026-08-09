# PROTOTYPE — matched application stacks

**Question:** When the same small bilingual static slice is built in Next.js with React, Next.js with constrained TSRX, and Octane, which configuration best satisfies the personal home’s product guardrails and learning goal without crossing the agreed framework-repair boundary?

This is throwaway comparison code, not the website implementation. Each configuration renders the same Home, filterable Library, and generated Book detail routes from `shared/content.ts`.

## Run

```bash
npm install
npm run build
npm run check
npm run measure
```

Open one configuration at a time:

```bash
npm run serve:next-react   # http://localhost:4101/en/
npm run serve:next-tsrx    # http://localhost:4102/en/
npm run serve:octane       # http://localhost:4103/en/
```

Representative URLs:

- `/en/` and `/pt/`
- `/en/library/` and `/pt/library/`
- `/en/library/?q=design&status=favorite`
- `/en/library/the-design-of-everyday-things/`

## Matched constraints

- Exact package versions are pinned.
- Every public route is statically emitted in English and Portuguese.
- Shared paths, complete translation pairs, `<html lang>`, canonical URLs, and reciprocal language alternates are required.
- Library filtering is URL-addressable and progressively enhanced; complete content remains readable without JavaScript.
- The same semantic structure, CSS, focus treatment, and reduced-motion policy are used in all three.
- Experimental candidates may use documented configuration, thin adapters, and small workarounds. A maintained fork, core compiler repair, or substantial framework infrastructure is a stop condition.
- Next.js + TSRX deliberately uses TSRX only for server-authored routes, TSX for the interactive Client Component, external CSS, and a mandatory `tsrx-tsc --noEmit` check.
- Octane owns only a manifest-driven static writer plus one client hydration entry. If that seam grows into a local metaframework, Octane fails the boundary.

## Evaluation record

Run `npm run measure` after all builds. Record browser/assistive-technology observations in `RESULTS.md`; the prototype is not resolved until Duarte has reacted to the running slice and comparison.
