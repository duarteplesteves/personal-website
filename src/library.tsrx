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
        aria-labelledby="library-search-heading"
        data-library-controls
        hidden
      >
        <h2 id="library-search-heading" class="visually-hidden">
          {content.searchLabel}
        </h2>
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
