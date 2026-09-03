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
      <section aria-labelledby="working-on-heading">
        <h2 id="working-on-heading">{content.work.workingOn.heading}</h2>
        <div class="work-entries">
          {content.work.workingOn.items.map((item) => (
            <article class="work-entry">
              <div class="work-entry-header">
                <h3>{item.title}</h3>
              </div>
              <p>{item.description}</p>
              <p class="section-note technologies">
                {content.work.technologiesLabel}: {item.technologies.join(", ")}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section aria-labelledby="selected-work-heading">
        <h2 id="selected-work-heading">{content.work.selected.heading}</h2>
        <div class="work-entries">
          {content.work.selected.items.map((item) => (
            <article class="work-entry">
              <div class="work-entry-header">
                <h3>{item.title}</h3>
                <p class="section-note">{item.context}</p>
              </div>
              <ul role="list">
                {item.points.map((point) => (
                  <li>{point}</li>
                ))}
              </ul>
              <p class="section-note technologies">
                {content.work.technologiesLabel}: {item.technologies.join(", ")}
              </p>
              {item.link && (
                <p class="work-link">
                  <a href={item.link.href}>{item.link.label}</a>
                </p>
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
              <div class="work-entry-header">
                <h3>{item.company}</h3>
              </div>
              <p>{item.description}</p>
              {item.roles.map((role) => (
                <p class="section-note">
                  {role.title} <span aria-hidden="true"> · </span> {role.dates}
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
      <section aria-labelledby="setup-heading">
        <h2 id="setup-heading">{content.setup.heading}</h2>
        <ul role="list">
          {content.setup.items.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
        <p class="section-note">{content.setup.updated}</p>
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
  <div class="book-group">
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
  </div>;
}
