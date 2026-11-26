# Personal website

The site publishes a useful root language chooser and bilingual, fully static Home and Library documents with Octane and Effect.

## Tooling

[Nub](https://nubjs.com/) is the project package manager and command runner. The exact version is recorded in `package.json`; dependencies are pinned in `bun.lock`, which Nub reads and writes.

```sh
nub install --frozen-lockfile
nub run dev
nub run check   # validate, typecheck, lint, format:check, and test (which builds)
nub run build
```

Site content is authored as constrained YAML and validated with Effect. The production build loads it once, projects typed route data in memory, and passes those values directly to the renderer. Oxlint keeps Effect, YAML, Node.js, and repository imports out of frontend modules (see `.oxlintrc.json`), and Vite compiles the native TSRX server entry through Octane and the Library browser entry, then writes the root chooser plus localized Home and Library documents under `dist/`.

Use `nub run identifier` to produce a UUIDv7 for durable authored records. Published documents contain no application runtime; small browser scripts progressively enhance language selection and Library search. Oxc provides repository linting and formatting, including native `.tsrx` support.

Octane and its TSRX TypeScript plugin release almost daily, so they are exempted from Nub's package-age gate in `.npmrc`. Their versions remain exact and lockfile-verified.

## Production and rollback

A passing merge to `main` publishes `dist/` directly to Cloudflare Pages and verifies the canonical host, redirect, TLS, security headers, and cache headers from public responses.

To roll back without rebuilding, copy the previous successful deployment ID from Cloudflare Pages and run the **Production** workflow manually with that ID. The workflow promotes the existing deployment, verifies the site, and records the rehearsal in its job summary. Fix the cause through a normal pull request; merging it to `main` uses the same production publication path.
