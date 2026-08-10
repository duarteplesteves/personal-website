# Initial Library catalog reconciliation

This is the one-time, public intake asset for the version-one Library. It is a reviewed selection, not the permanent repository schema or a live Notion integration.

- [`initial-library-catalog.csv`](./initial-library-catalog.csv) is the reconciled Book-level launch selection.
- [`initial-library-edition-candidates.csv`](./initial-library-edition-candidates.csv) preserves the safe Edition facts needed by the later repository conversion.
- The private Notion exports, Notion URLs, prices, ratings, purchase dates, biographies, demographic metadata, tags, and unselected Books are not included.

## Reconciled selection

- **152 Books**: 151 in the collection, 90 Read, 1 Reading, and 61 Unread.
- **Currently reading:** *O Som e a Fúria* by William Faulkner.
- **Favorites:** *A Máquina de Fazer Espanhóis*, *O pintor debaixo do lava-loiças*, *Frankenstein*, *Mendigos e Altivos*, and *Crime e Castigo*.
- **Next reads:** none.
- **153 Edition candidates** are associated with the selected Books. *Livro do Desassossego* is one Book with two candidate Editions; the two Books titled *Jerusalém* remain distinct because they have different authors.

## Reconciliation rules

1. Retain a source row only when `Status` contains the exact token `Owned`, `Read`, or `Reading`.
2. `Owned by Mariana` does not mean in collection. Such a row survives only when it also contains `Read`; this keeps *A Metamorfose* as Read but not in the collection.
3. Treat any old `Reading` token as `Read` because the export is stale. No exported row actually contained that token.
4. Override *O Som e a Fúria* to Reading from the current fact supplied during reconciliation.
5. Add *A Máquina de Fazer Espanhóis* by Valter Hugo Mãe as both in the collection and Read; it was missing from Notion.
6. Ignore `Ainda quero`. Next reads are an independent manual selection and are empty for launch.
7. Trim accidental surrounding whitespace from titles and preserve source author-credit order after removing Notion URLs.
8. Do not derive Favorites from the old numeric scores.

## Source mapping

| Notion source | Intake interpretation | Disposition |
| --- | --- | --- |
| `Name` | Stable Book title; also an Edition-title candidate | Retained and trimmed. Exact published Edition titles must be verified during conversion. |
| `Author` | Ordered Book author display credits | Retained; Notion relation URLs removed. The separate Authors table is not imported as shared Person records. |
| `Status: Owned` | Edition collection membership | Retained. `Owned by Mariana` is not collection membership. |
| `Status: Read` | One completed Reading, producing Read | Retained without inventing dates. |
| `Status: Reading` | Stale completed Reading in this intake | Would become Read; current Reading was supplied separately. |
| `Editora` | Edition publisher | Retained when present. |
| `Language I Have/Want` | Edition BCP 47 language | Retained as `pt`, `en`, `hu`, `sv`, or `ja` when present. |
| `Type` | Edition format hint | `eBook` maps to `ebook`; generic `Book` remains `print-unspecified` rather than guessing hardcover or paperback. |
| `Reading Dates` | Optional Reading start/end dates | Not selected for launch; status is retained without dates. |
| `Ainda quero` | Old reading-intention signal | Ignored by decision. |
| `Original Language`, `isTranslated` | Lookup hints, not settled authored fields | Omitted. Source-faithful metadata can be reviewed during conversion. |
| `Score /5`, `Tags` | Ratings and categories | Omitted; neither belongs to the version-one Library model. |
| `Price`, `Comprado a` | Purchase history | Omitted; version one tracks only collection membership. |
| Calendar/day columns | Old acquisition or planning data | Omitted. |
| Author biography, birth/death year, country, gender, original language | Person metadata | Omitted; version one stores ordered author display-name strings only. |

## Known conversion gaps

These gaps do not block the intake, but required Edition fields must be completed or the candidate omitted when implementation creates validated Book files:

- Every generic `Book` format needs review as `hardcover` or `paperback`; the intake deliberately records `print-unspecified`.
- Four candidates have no source format: the Assírio e Alvim Edition of *Livro do Desassossego*, *A Metamorfose*, *Contra a Interpretação*, and *M Train*.
- *A Metamorfose* has no source Edition language.
- *Ballad for Sophie* has no source publisher; publisher is optional.
- *A Máquina de Fazer Espanhóis* has no source Edition title, publisher, language, or format beyond the user-confirmed fact that an Edition is owned.
- ISBN, publication date, Edition contributors, page count, and audiobook duration were absent and remain optional.
- Four Read Books had no old Reading dates: *Sapiens: A Brief History of Humankind*, *Como é Linda a Puta da Vida*, *prova de vida*, and *A Metamorfose*. Dates are optional and were not selected for the launch catalog generally.
