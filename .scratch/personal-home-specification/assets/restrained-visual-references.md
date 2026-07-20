# Restrained visual references

Accessed **2026-07-13**. This is deliberately a small, complementary set rather than a mood board. No reference should be copied as a whole. **Observed** means the page, rendered interface, markup, or author’s own published explanation directly showed the claim on the access date. **Transfer** is an inference for Duarte’s personal home.

## Reference set at a glance

| Reference | Most useful for | Transferable quality |
| --- | --- | --- |
| Emil Kowalski | Restrained visual system; purposeful motion | Reduce visual degrees of freedom; reserve motion for feedback, continuity, or rare delight |
| Paco Coursey | A personal home led by content | Plain sections and descriptive link rows can express work and interests without portfolio theatre |
| Canada.ca | Equivalent bilingual pages | A language control should move to the same page in the other language and expose the relationship semantically |
| Literal | Library overview and progressive disclosure | Status groups, counts, previews, and “View all” routes make a collection scannable before filtering is needed |
| Derek Sivers’s book notes | Text-first personal library and Reflections | A title, author, optional date, short personal response, and deeper detail are enough to make a library personal |

## 1. Emil Kowalski — restraint with purposeful interaction

Sources:

- [Tweet about limiting variation](https://x.com/emilkowalski/status/2072301069271552363?s=20)
- [Personal site](https://emilkowal.ski/)
- [You Don’t Need Animations](https://emilkowal.ski/ui/you-dont-need-animations)

**Observed**

- The tweet says the site intentionally uses one font size and monochrome colours; Kowalski’s stated reason is that fewer variations reduce the number of design mistakes and leave the content to be interesting.
- The current homepage substantiates the approach: its main content rendered at one `16px` size in one sans-serif family in the inspected desktop viewport. Hierarchy comes mainly from spacing, section labels, weight, and muted versus primary text—not a ladder of display sizes.
- Projects and writing use the same repeatable pattern: linked title plus one-line description. The narrow content column, restrained colour set, and repeated row treatment make unlike content feel related.
- In “You Don’t Need Animations,” Kowalski distinguishes purposeful feedback (for example, a subtle pressed-button scale), spatial continuity, and rare delight from motion added for its own sake. He argues that frequently repeated and keyboard-driven actions should not be animated and gives a general target of under `300ms` for UI animation.

**Transfer**

- Start with one body scale and very few text roles. Let spacing, wording, and consistent row anatomy do most of the hierarchy work; add a second size only when comprehension demonstrably needs it.
- Define one shared linked-row pattern for Selected work, Experience highlights, Library previews, and possibly interests. Consistency can tie the home together without making every content type identical.
- Permit micro-interactions only when they communicate press, selection, copied state, disclosure, or spatial continuity. A rare flourish can reward discovery, but routine navigation and keyboard movement should feel immediate.

**Do not copy**

- “One size” is a constraint to test, not a rule to force onto long-form reading or small metadata. Duarte’s bilingual copy and Library metadata may need a modest type hierarchy.
- Do not import animation demos into the personal home. Their lesson is editorial restraint, not visual spectacle. Reduced-motion support, semantic controls, focus visibility, and contrast remain acceptance requirements independent of this reference.

## 2. Paco Coursey — content-shaped personal navigation

Sources:

- [Personal site](https://paco.me/)
- [Redesign 2021](https://paco.me/writing/redesign-2021)

**Observed**

- The homepage is a linear, readable document: a short identity statement followed by Building, Projects, Writing, Now, and Connect. Project and writing links pair a concise title with a plain-language description; “Now” makes room for music and current interests alongside software work.
- The page does not lead with screenshots, client logos, metrics, or a résumé-like chronology. Personal and professional material share the same typographic treatment.
- In the redesign note, Coursey explicitly says the iteration reflects performance, simplicity, and craft, and that he wants the site to describe him, what he is thinking about, and what he is building. He also describes simplifying toward documents and links to reduce maintenance.

**Transfer**

- Compose the homepage as a sequence of intelligible sections that answer “who is Duarte, what does he work on, and what does he care about?” before adding visual components.
- Use short descriptions under ambiguous destinations. “Selected work” and “Library” should not require visitors to infer what is behind a label.
- Let interests appear in Duarte’s narrative rather than forcing every interest into a feature section. This aligns with the current scope while making the site feel inhabited.

**Do not copy**

- Paco’s near-single-document structure can work with his small set of destinations. Duarte’s bilingual, multi-page Work and Library need persistent, conventional navigation and a clear current-page state.
- Three font families are part of Paco’s voice, not a transferable requirement. The transferable idea is that typography supports content instead of becoming the content.

## 3. Canada.ca — same-place bilingual switching

Sources:

- [Jobs and the workplace — English](https://www.canada.ca/en/services/jobs.html)
- [Emplois et milieu de travail — French](https://www.canada.ca/fr/services/emplois.html)

**Observed**

- The English page has a visible “Français” link directly to the French version of that page, not to a language homepage. The French page reciprocates with “English” to the English counterpart.
- The document language changes from `lang="en"` to `lang="fr"`. Both pages publish reciprocal `rel="alternate"` links with `hreflang="en"` and `hreflang="fr"`.
- Each language has a stable language segment in its URL and a translated page title. The interface also exposes skip links before the main navigation.

**Transfer**

- From every translated route, **PT** and **EN** should switch to the equivalent route and preserve the visitor’s place. A Work item, book detail, or filtered Library view should not fall back to the homepage merely because the language changed.
- Use short, self-identifying language labels (`PT`, `EN`, or `Português`, `English`), correct document `lang`, reciprocal `hreflang`, and translated metadata. Store the preference only as a convenience; URLs must remain shareable and deterministic.
- Treat equivalent translation as one content relationship with two expressions, not as two unrelated trees.

**Do not copy**

- Canada.ca’s government-scale header, menus, and density are irrelevant here. Borrow only the counterpart behavior and semantic signals.

## 4. Literal — status-led Library overview

Sources:

- [Literal Explore](https://literal.club/explore)
- [A current public profile used as an interface sample](https://literal.club/michionimpossible)
- [Literal’s curated shelves](https://literal.club/literal)

**Observed**

- The sampled public profile presents “Currently reading,” “Want to read,” and “Finished” as separate groups. Each group shows a count, a short horizontal preview of cover/title/author cards, and a “View all” destination; the full status destinations have their own URLs.
- Custom shelves appear after the primary reading-status groups rather than replacing them. Literal’s curated-shelf cards use a shelf name, a book count, an optional description, and a few cover previews to explain a larger set without rendering every item.
- Explore and profile views keep book covers paired with text titles and authors. The site also exposes search in the global header.

**Transfer**

- Make the Library landing page useful without controls: show a small preview for meaningful reading-status views, with counts and clear links to complete results. For version one, this may be more intuitive than opening with a dense filter panel.
- Use a cover as a recognition aid, never as the only label. Keep title and author visible, and reserve edition details for the book view or compact secondary metadata.
- Keep **collection status independent from reading status**. Literal does not demonstrate this requirement; the transferable extension is an orthogonal owned/not-owned filter or metadata marker, not another mutually exclusive reading shelf.

**Do not copy**

- Do not import following, followers, activity feeds, goals, community shelves, ratings, or review mechanics. They conflict with a public personal Library and would turn it into a social product.
- The sampled profile also exposes duplicate editions and a very long shelf taxonomy. That is evidence for curated version-one facets and edition-aware data, not a pattern to reproduce.

## 5. Derek Sivers — a Library made personal by small notes

Sources:

- [Books I’ve read](https://sive.rs/book)
- [Example book-notes detail](https://sive.rs/book/WasteBooks)

**Observed**

- The index states that it contains 482 books and offers three direct sorts: newest, best, and title.
- Every index entry leads with title and author, then a date read and a compact personal summary. A detail page contains the longer notes, so the index can communicate Sivers’s relationship to each book without reproducing all notes there.
- The presentation is overwhelmingly text-first; browsing does not depend on cover imagery.

**Transfer**

- Duarte’s optional Reflection can be the element that turns metadata into a personal Library. Show a short excerpt only when one exists and let the book page hold the full Reflection.
- Keep useful fallbacks: an item with only title, author, and status should still look complete. Optional dates and Reflections should enrich a row rather than leave visible holes when absent.
- A very small set of plain-text sort controls can be sufficient. Add search or filters only when the actual collection size and maintenance workflow justify them.

**Do not copy**

- Numeric recommendations are central to Sivers’s model but explicitly not an obligation for Duarte. Do not turn Reflections into reviews or ratings.
- A single page with hundreds of expanded summaries is costly to scan. Borrow text-first identity and progressive detail, not the page length.

## Combined design hypotheses to test

These are **inferences**, not findings about the references:

1. **Visual grammar:** one quiet content column, one body scale plus only necessary metadata/display roles, mostly neutral colours, and a shared row/card anatomy. Covers or project imagery should appear only where they improve recognition or understanding.
2. **Navigation:** a small persistent primary navigation (`Home`, `Work`, `Library`, plus any final identity/about destination), descriptive local links, visible current-page state, and a language switch that keeps the current route.
3. **Interaction budget:** immediate keyboard navigation; visible hover and focus states; brief press, copy, disclosure, and route-continuity feedback; no ornamental motion on repeated actions; full reduced-motion behavior.
4. **Library default:** useful status-led previews first, then complete views with restrained sorting/filtering. Reading status and collection status remain orthogonal in both the model and controls.
5. **Personal voice:** short authored descriptions and optional Reflections carry more identity than decorative variation. Empty optional fields should never look like unfinished content.

The strongest composite is therefore **Emil’s constraint + Paco’s personal document + Canada.ca’s counterpart switching + Literal’s status overview + Sivers’s text-first notes**—not the surface design of any one site.
