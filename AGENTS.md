# Agent skills

## Issue tracker

Issues and PRDs are tracked in this repository’s GitHub Issues. See `docs/agents/issue-tracker.md`.

## Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.

# Learning more about the Effect

This repository uses the Effect Typescript library.

Before writing any Effect code, first read `node_modules/effect/AGENTS.md`
**completely**, and follow the links in the file when required.

If you need to learn more about particular Effect apis and concepts that the
guide doesn't cover, search through the source code in `node_modules/effect/src`.

# Learning more about Octane

This repository renders static HTML with Octane `.tsrx` components.

Before writing Octane or `.tsrx` code, read https://octanejs.dev/docs/best-practices.
For API details, see https://octanejs.dev/llms.txt or the types in `node_modules/octane/dist`.
Use `@for` and `@if` blocks for head tags (`<title>`, `<meta>`, `<link>`): Octane does not hoist them out of `.map` or `&&` expressions.
