import type { RootPageData } from "./page-data-schema.ts";

export function Root({ content }: { content: RootPageData }) @{
  <>
    <title>{content.title}</title>
    <meta name="description" content={content.description} />
    <main id="content" class="language-chooser">
      <h1>
        <span lang="pt-PT">{content.heading.pt}</span>
        <span aria-hidden="true"> · </span>
        <span lang="en-GB">{content.heading.en}</span>
      </h1>
      <div class="chooser-options">
        <p lang="pt-PT">
          {content.introduction.pt}
          <a href={content.homePathnames.pt} hreflang="pt-PT">
            {content.languages.pt}
          </a>
        </p>
        <p lang="en-GB">
          {content.introduction.en}
          <a href={content.homePathnames.en} hreflang="en-GB">
            {content.languages.en}
          </a>
        </p>
      </div>
    </main>
  </>;
}
