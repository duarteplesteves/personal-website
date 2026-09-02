import type { PageData } from "./page-data-schema.ts";

/** Render localized primary and Site-language navigation. */
export function SiteHeader({ content }: { content: PageData }) @{
  <>
    <a class="skip-link" href="#content">
      {content.navigation.skipLabel}
    </a>
    <header class="site-header">
      <nav class="primary-navigation" aria-label={content.navigation.primaryLabel}>
        <a
          href={content.navigation.homePathname}
          aria-current={content.page === "home" ? "page" : undefined}
        >
          {content.navigation.homeLabel}
        </a>
        <a
          href={content.navigation.libraryPathname}
          aria-current={content.page === "library" ? "page" : undefined}
        >
          {content.navigation.libraryLabel}
        </a>
      </nav>
      <p class="language-navigation">
        <span class="visually-hidden">{content.navigation.currentLanguageLabel}</span>{" "}
        <span>{content.navigation.currentLanguageName}</span>
        <span aria-hidden="true"> · </span>
        <a
          href={content.navigation.equivalentPathname}
          hreflang={content.navigation.alternateDocumentLanguage}
          lang={content.navigation.alternateDocumentLanguage}
          data-language-control=""
          data-site-language={content.navigation.alternateSiteLanguage}
        >
          {content.navigation.alternateLanguageName}
        </a>
      </p>
    </header>
  </>;
}
