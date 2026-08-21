import type { HomePageData } from "./page-data-schema.ts";
import { SiteHeader } from "./site-header.tsrx";

export function Home({ content }: { content: HomePageData }) @{
  <>
    <title>{content.title}</title>
    <meta name="description" content={content.description} />
    <SiteHeader content={content} />
    <main id="content">
      <h1>{content.title}</h1>
      <p class="introduction">{content.introduction}</p>
      {(content.libraryPreview.currentlyReading ||
        content.libraryPreview.favorites ||
        content.libraryPreview.nextReads) && (
        <section aria-labelledby="library-preview-heading">
          <h2 id="library-preview-heading">{content.libraryPreview.heading}</h2>
          {content.libraryPreview.currentlyReading && (
            <BookGroup
              heading={content.libraryPreview.currentlyReadingLabel}
              books={content.libraryPreview.currentlyReading}
            />
          )}
          {content.libraryPreview.favorites && (
            <BookGroup
              heading={content.libraryPreview.favoritesLabel}
              books={content.libraryPreview.favorites}
            />
          )}
          {content.libraryPreview.nextReads && (
            <BookGroup
              heading={content.libraryPreview.nextReadsLabel}
              books={content.libraryPreview.nextReads}
            />
          )}
          <a href={content.libraryPreview.libraryPathname}>{content.libraryPreview.libraryLabel}</a>
        </section>
      )}
      <section aria-labelledby="setup-heading">
        <h2 id="setup-heading">{content.setup.heading}</h2>
        <p class="section-note">{content.setup.updated}</p>
        <ul role="list">
          {content.setup.items.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">{content.contact.heading}</h2>
        <ul role="list">
          {content.contact.links.map((link) => (
            <li>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  </>;
}

function BookGroup({
  heading,
  books,
}: {
  heading: string;
  books: HomePageData["libraryPreview"]["currentlyReading"];
}) @{
  <>
    <h3>{heading}</h3>
    <ul role="list">
      {books?.map((book) => (
        <li>
          <cite>{book.title}</cite>
          <span aria-hidden="true"> — </span>
          {book.authors.map((author) => author.displayName).join(", ")}
        </li>
      ))}
    </ul>
  </>;
}
