# Personal website

The first tracer publishes bilingual, fully static Home documents with Octane and Effect.

## Tooling

[Nub](https://nubjs.com/) is the project package manager and command runner. The exact version is recorded in `package.json`; dependencies and Octane are pinned in `package-lock.json`.

```sh
nub install --frozen-lockfile
nub run validate
nub run generate
nub run boundary:check
nub run typecheck
nub run lint
nub run format:check
nub run build
nub run test
```

Home content is authored as constrained YAML and validated with Effect. Generation projects it into ignored, disposable route data under `.generated/`; production generation replaces the complete output only after every source and page contract passes. `nub run dev:content` watches authored YAML and removes stale output after an invalid edit. The production build generates content and checks the Effect-free frontend boundary automatically before Vite compiles the native TSRX server entry through Octane and the static generator writes `dist/en/index.html` and `dist/pt/index.html`.

Use `nub run identifier` to produce a UUIDv7 for durable authored records. The published documents contain no application runtime or client JavaScript. Oxc provides repository linting and formatting, including native `.tsrx` support.

The evaluated Octane, TSRX, and Effect prereleases are exempted from Nub's package-age gate. Their dependency versions remain exact and lockfile-verified.
