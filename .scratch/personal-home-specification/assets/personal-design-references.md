# Personal design references

Recorded **2026-07-13** while resolving [Contribute personal design references](../issues/05-contribute-personal-design-references.md). This records Duarte’s taste and intended transfers; it is not a request to copy any site wholesale.

## Guiding preference

- Keep the design simple, minimal, clean, and intuitive rather than flashy.
- Limit visual variation to reduce accidental complexity, without treating Emil Kowalski’s single font size as a literal rule.
- Let content and navigation carry the experience.
- Use small, purposeful interaction delights to lift an otherwise restrained interface.
- Treat Emil Kowalski and Paco Coursey as positive visual references.

## Positive references

### [Kit Langton](https://kitlangton.com/)

**Duarte’s response:** The style differs from the likely direction, but its simplicity is appealing.

**Observed:** The current page opens with a direct personal introduction and organizes substantial material into plainly named groups such as projects, open source, videos, posts, and talks. Entries generally combine a title, a short type or description, and sometimes a small metric or date. Its monochrome, monospace presentation is more expressive and visually dense than the other references.

**Potential transfer:** A direct opening statement; clearly labelled groups; compact, repeatable rows that can hold unlike personal material without elaborate cards.

**Do not assume:** Its dark terminal-like styling, high content density, and media-heavy lower sections are not approvals for Duarte’s visual system.

### [Performance](https://performance.dev/)

**Duarte’s response:** Although it is primarily a publication, its simplicity, beauty, and ease of use are strong references.

**Observed:** The current index uses a very small brand header and a spacious single-column list of articles. Date, title, and image form an obvious repeated reading order, with little competing navigation or decoration. Article pages retain generous spacing and a clear content column.

**Potential transfer:** Strong whitespace; an obvious reading order; large, forgiving linked regions; a small number of repeated content roles; confidence that a sparse page can still feel designed.

**Do not assume:** The article-feed structure or prominent editorial imagery belongs on a site with no blog.

### [Guillermo Rauch](https://rauchg.com/)

**Duarte’s response:** The simple timeline with links could inspire the personal home.

**Observed:** The current home is a restrained chronological index. Years form one scanning axis, linked titles form another, and a quiet numeric column adds secondary metadata. The header contains only identity, About, and a social link.

**Potential transfer:** A year-grouped, text-first chronology for Experience or selected milestones; alignment and muted metadata can make a plain link list highly scannable.

**Do not assume:** Article popularity counts or a blog chronology should be reproduced. The timeline grammar is the useful part.

### [Brian Lovin](https://brianlovin.com/)

**Duarte’s response:** Its simplicity is appealing, and it prompted the idea of sharing his setup, preferred tools, and how he works.

**Inspection note:** Automated inspection reached a Vercel security checkpoint on 2026-07-13, so no additional visual claims are recorded here.

**Potential transfer:** Consider tools/setup and ways of working as possible software-related personal content, subject to the site-story decision; borrow the idea, not an unverified page treatment.

## Explicit non-directions and refinements

- **Canada.ca:** useful only as behavioral evidence that a language control should switch to the equivalent page. It is not a visual reference, and language-toggle design is not a major concern.
- **Literal and Derek Sivers:** their Library presentations are not preferred visual directions. Functional observations from prior research may still inform model discussions, but the Library should inherit the personal home’s own restrained visual grammar.
- **Version-one Library:** begin text-first, likely as a simple list of titles with only necessary supporting text. Do not require book-cover images in version one.
- **Long-term Library:** cover images may be introduced later if a prototype shows that they improve recognition without adding clutter or maintenance burden.

## Visual hypotheses to carry into prototyping

1. Start from a calm content column or grid with generous spacing and few typographic roles.
2. Use compact, repeatable text rows for timelines, Work, and Library; vary their metadata only where the domain requires it.
3. Make navigation and whole-row link targets obvious before adding delight.
4. Reserve motion for hover/focus/press feedback, state continuity, and rare moments of personality.
5. Prototype the Library without covers first; treat imagery as a later comparison, not a default requirement.
