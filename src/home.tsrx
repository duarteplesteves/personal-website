import type { HomePageData } from "./page-data-schema.ts";
import { SiteHeader } from "./site-header.tsrx";

/** Render the static Home document in its selected Site language. */
export function Home({ content }: { content: HomePageData }) @{
  <>
    <title>{content.title}</title>
    <meta name="description" content={content.description} />
    <SiteHeader content={content} />
    <main id="content">
      <h1>{content.title}</h1>
      <p class="introduction">{content.introduction}</p>
      <section aria-labelledby="work-heading">
        <h2 id="work-heading">{content.work.heading}</h2>
        <div class="work-entries">
          {content.work.items.map((item) => (
            <article class="work-entry">
              <h3>
                {item.link ? (
                  <a href={item.link} target="_blank">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h3>
              {"description" in item ? (
                <p>{item.description}</p>
              ) : (
                <>
                  <ul role="list">
                    {item.points.map((point) => (
                      <li>{point}</li>
                    ))}
                  </ul>
                  <p class="section-note technologies">
                    {`${content.work.technologiesLabel}: ${item.technologies.join(", ")}`}
                  </p>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="experience-heading">
        <h2 id="experience-heading">{content.work.experience.heading}</h2>
        <div class="work-entries">
          {content.work.experience.items.map((item) => (
            <article class="work-entry">
              <h3>{item.company}</h3>
              <p>{item.description}</p>
              {item.roles.map((role) => (
                <p class="section-note">
                  {role.title}
                  <span aria-hidden="true"> · </span>
                  {role.dates}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>
      {(content.libraryPreview.currentlyReading ||
        content.libraryPreview.favorites ||
        content.libraryPreview.nextReads) && (
        <section aria-labelledby="library-preview-heading">
          <h2 id="library-preview-heading">{content.libraryPreview.heading}</h2>
          <div class="book-groups">
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
          </div>
          <a href={content.libraryPreview.libraryPathname}>{content.libraryPreview.libraryLabel}</a>
        </section>
      )}
    </main>
    <footer class="site-footer">
      <nav aria-label={content.contact.heading}>
        {content.contact.links.map((link) => (
          <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  </>;
}

function BookGroup({
  heading,
  books,
}: {
  heading: string;
  books: HomePageData["libraryPreview"]["currentlyReading"];
}) @{
  <div class="book-group">
    <h3>{heading}</h3>
    <ul class="book-lines" role="list">
      {books?.map((book) => (
        <li>
          <cite>{book.title}</cite>
          <span aria-hidden="true"> — </span>
          {book.authors.map((author) => author.displayName).join(", ")}
        </li>
      ))}
    </ul>
  </div>;
}
