import { productionOrigin, socialPreviewImage } from "./publication.ts";

export interface DiscoveryProps {
  readonly title: string;
  readonly description: string;
  readonly pathname: string;
  readonly imageAlt: string;
  readonly alternates: ReadonlyArray<{ readonly hreflang: string; readonly pathname: string }>;
  readonly locale?: string;
  readonly alternateLocale?: string;
}

// Use @for/@if, not .map/&&: Octane only hoists head tags from TSRX control-flow blocks.
/** Render canonical, alternate-language, and social-preview metadata for the document head. */
export function Discovery({
  title,
  description,
  pathname,
  imageAlt,
  alternates,
  locale,
  alternateLocale,
}: DiscoveryProps) @{
  const url = `${productionOrigin}${pathname}`;
  const image = `${productionOrigin}${socialPreviewImage.pathname}`;
  <>
    <link rel="canonical" href={url} />
    @for (const alternate of alternates; key alternate.hreflang) {
      <link
        rel="alternate"
        hreflang={alternate.hreflang}
        href={`${productionOrigin}${alternate.pathname}`}
      />;
    }
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Duarte Esteves" />
    @if (locale) {
      <meta property="og:locale" content={locale.replace("-", "_")} />;
    }
    <meta property="og:image" content={image} />
    <meta property="og:image:type" content={socialPreviewImage.type} />
    <meta property="og:image:width" content={String(socialPreviewImage.width)} />
    <meta property="og:image:height" content={String(socialPreviewImage.height)} />
    <meta property="og:image:alt" content={imageAlt} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    <meta name="twitter:image:alt" content={imageAlt} />
    @if (alternateLocale) {
      <meta property="og:locale:alternate" content={alternateLocale.replace("-", "_")} />;
    }
  </>;
}
