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
      <ol class="book-list" role="list">
        {content.books.map((book) => (
          <li>
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
    </main>
  </>;
}
