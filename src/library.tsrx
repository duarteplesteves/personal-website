import type { LibraryPageData } from "./page-data-schema.ts";
import { SiteHeader } from "./site-header.tsrx";

export function Library({ content }: { content: LibraryPageData }) @{
  <>
    <title>{content.title}</title>
    <meta name="description" content={content.description} />
    <SiteHeader content={content} />
    <main id="content">
      <h1>{content.heading}</h1>
      <p class="introduction">{content.introduction}</p>
      {content.currentlyReading && (
        <section aria-labelledby="currently-reading-heading">
          <h2 id="currently-reading-heading">{content.currentlyReadingLabel}</h2>
          <ul role="list">
            {content.currentlyReading.map((book) => (
              <li>
                <cite>{book.title}</cite>
                <span aria-hidden="true"> — </span>
                <span>{book.authors.map((author) => author.displayName).join(", ")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section
        class="library-controls"
        aria-labelledby="library-controls-heading"
        data-library-controls
        hidden
      >
        <h2 id="library-controls-heading" class="visually-hidden">
          {content.searchLabel}
        </h2>
        <div class="library-search">
          <label for="library-search">{content.searchLabel}</label>
          <input
            type="search"
            id="library-search"
            data-library-search
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder={content.searchPlaceholder}
          />
          <button type="button" data-library-clear>
            {content.clearSearchLabel}
          </button>
        </div>
        <div class="library-options">
          <fieldset>
            <legend>{content.showLabel}</legend>
            <div class="library-choices">
              <label class="library-choice">
                <input type="radio" name="library-show" value="all" checked />
                <span>{content.allBooksLabel}</span>
              </label>
              {content.books.some((book) => book.completionCount > 0) && (
                <label class="library-choice">
                  <input type="radio" name="library-show" value="read" />
                  <span>{content.readLabel}</span>
                </label>
              )}
              {content.books.some((book) => book.favorite) && (
                <label class="library-choice">
                  <input type="radio" name="library-show" value="favorites" />
                  <span>{content.favoritesLabel}</span>
                </label>
              )}
              {content.books.some((book) => book.nextRead) && (
                <label class="library-choice">
                  <input type="radio" name="library-show" value="next-reads" />
                  <span>{content.nextReadsLabel}</span>
                </label>
              )}
              {content.books.some((book) => book.inCollection) && (
                <label class="library-choice">
                  <input type="radio" name="library-show" value="in-collection" />
                  <span>{content.inCollectionLabel}</span>
                </label>
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>{content.orderByLabel}</legend>
            <div class="library-choices">
              <label class="library-choice">
                <input type="radio" name="library-order" value="title" checked />
                <span>{content.titleOrderLabel}</span>
              </label>
              <label class="library-choice">
                <input type="radio" name="library-order" value="author" />
                <span>{content.authorOrderLabel}</span>
              </label>
            </div>
          </fieldset>
        </div>
      </section>
      <p
        class="result-count"
        data-result-count
        data-result-count-label={content.resultCountLabel}
        data-matching-result-count-label={content.matchingResultCountLabel}
      >
        {content.resultCountLabel.replace("{count}", String(content.books.length))}
      </p>
      <p
        class="visually-hidden"
        aria-live="polite"
        aria-atomic="true"
        data-library-announcement
      ></p>
      <ol class="book-list" data-book-list role="list">
        {content.books.map((book) => (
          <li
            data-search={[
              book.title,
              ...book.alternateTitles,
              ...book.authors.map((author) => author.displayName),
            ].join(" ")}
            data-views={[
              book.completionCount > 0 && "read",
              book.favorite && "favorites",
              book.nextRead && "next-reads",
              book.inCollection && "in-collection",
            ]
              .filter(Boolean)
              .join(" ")}
            data-title={book.title}
            data-author-sort={book.authors[0].sortValue}
            data-book-id={book.id}
          >
            <cite>{book.title}</cite>
            <span aria-hidden="true"> — </span>
            <span>{book.authors.map((author) => author.displayName).join(", ")}</span>
            {book.relationship && <span class="relationship">{book.relationship}</span>}
            {book.reflections?.map((reflection) => (
              <blockquote>{reflection}</blockquote>
            ))}
          </li>
        ))}
      </ol>
      <p class="empty-state" data-library-empty hidden>
        {content.emptyStateLabel}
      </p>
    </main>
  </>;
}
