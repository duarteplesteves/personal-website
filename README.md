# Personal website

The first tracer publishes bilingual, fully static Home documents with Octane and Effect.

## Tooling

[Nub](https://nubjs.com/) is the project package manager and command runner. The exact version is recorded in `package.json`; dependencies and Octane are pinned in `package-lock.json`.

```sh
nub install --frozen-lockfile
nub run validate
nub run build
nub run typecheck
nub run test
```

The generated site is written to `dist/en/index.html` and `dist/pt/index.html`. It contains no application runtime or client JavaScript.

Octane is currently exempted from Nub's package-age gate because this project deliberately evaluates its alpha releases. Its dependency version remains exact and lockfile-verified.
