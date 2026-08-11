# PROTOTYPE — Standalone Library browsing surface

Three structurally different treatments of the agreed Standalone Library, switchable with `?variant=A`, `B`, or `C` on a throwaway static prototype route.

## Run

From the repository root:

```sh
npm run prototype:library
```

Open <http://localhost:4174/?variant=A&lang=en>.

- Use the floating arrows or keyboard Left/Right to switch variants. Arrow keys remain available to native radio groups and text inputs while they have focus.
- Use **Português / English** to inspect representative Equivalent copy and text expansion. The `lang` query is only a prototype stand-in for locale-prefixed routes.
- Search, Show, and Order by update the URL and the 152-Book listing. Try `?q=design&show=read&order=author` or a search with no results.
- Reflections and a few relationship states marked with an asterisk are representative stress-test content, not publication claims. Book titles, authors, launch reading state, collection state, and Favorites come from the reconciled intake prepared by **Prepare the initial Library catalog from Notion**.

## Variants

- **A — Continuous index:** the selected direction: one narrow reading flow with each Book's title, author, and relationships in one compact line that wraps naturally on narrow screens.
- **B — Browsing rail:** current reading and controls form a persistent left rail beside the listing.
- **C — Alphabetical register:** a wider, denser index grouped by the first title or author sort character.

## What to judge

Which treatment—or combination—best keeps 100–200 Books scannable without turning the Library into a catalog dashboard? Compare the introduction and current-reading emphasis, how quickly the controls read, record density, relationship-label noise, inline Reflection placement, long Portuguese text, keyboard use, and the narrow-screen collapse.

This code is intentionally throwaway and must not be promoted directly into production.
