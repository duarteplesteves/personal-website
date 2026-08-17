import type { HomeContent } from "./home-content.ts";
import type { SiteLanguage } from "./publication.ts";

type HomeProps = { content: HomeContent; siteLanguage: SiteLanguage };

export function Home({ content, siteLanguage }: HomeProps) @{
  <>
    <title>{content.title}</title>
    <meta name="description" content={content.description[siteLanguage]} />
    <main>
      <h1>{content.title}</h1>
      <p>{content.introduction[siteLanguage]}</p>
    </main>
  </>;
}
