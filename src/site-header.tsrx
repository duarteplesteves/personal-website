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
        {/* Languages keep a fixed English, Português order; only the highlight moves. */}
        {content.navigation.alternateSiteLanguage === "en" && (
          <LanguageLink navigation={content.navigation} />
        )}
        <span class="visually-hidden">{content.navigation.currentLanguageLabel}</span>{" "}
        <span>{content.navigation.currentLanguageName}</span>
        {content.navigation.alternateSiteLanguage === "pt" && (
          <LanguageLink navigation={content.navigation} />
        )}
      </p>
    </header>
  </>;
}

function LanguageLink({ navigation }: { navigation: PageData["navigation"] }) @{
  <a
    href={navigation.equivalentPathname}
    hreflang={navigation.alternateDocumentLanguage}
    lang={navigation.alternateDocumentLanguage}
    data-language-control=""
    data-site-language={navigation.alternateSiteLanguage}
  >
    {navigation.alternateLanguageName}
  </a>;
}
