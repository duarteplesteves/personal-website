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
      <ol class="book-list" role="list">
        {content.books.map((book) => (
          <li>
            <cite>{book.title}</cite>
            <span aria-hidden="true"> — </span>
            <span>{book.authors.map((author) => author.displayName).join(", ")}</span>
          </li>
        ))}
      </ol>
    </main>
  </>;
}
