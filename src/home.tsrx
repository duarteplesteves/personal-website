import type { HomeContent, SiteLanguage } from "./home-content.ts";

type HomeProps = { content: HomeContent; locale: SiteLanguage };

export function Home({ content, locale }: HomeProps) @{
  <>
    <title>{content.title}</title>
    <meta name="description" content={content.description[locale]} />
    <main>
      <h1>{content.title}</h1>
      <p>{content.introduction[locale]}</p>
    </main>
  </>;
}
