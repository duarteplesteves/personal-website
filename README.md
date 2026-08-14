# Personal website

The first tracer publishes bilingual, fully static Home documents with Octane and Effect.

## Tooling

[Nub](https://nubjs.com/) is the project package manager and command runner. The exact version is recorded in `package.json`; dependencies and Octane are pinned in `package-lock.json`.

```sh
nub install --frozen-lockfile
nub run validate
nub run typecheck
nub run lint
nub run format:check
nub run build
nub run test
```

Vite compiles the native TSRX server entry through Octane before the static generator writes `dist/en/index.html` and `dist/pt/index.html`. The published documents contain no application runtime or client JavaScript. Oxc provides repository linting and formatting, including native `.tsrx` support.

The evaluated Octane, TSRX, and Effect prereleases are exempted from Nub's package-age gate. Their dependency versions remain exact and lockfile-verified.
