import type { HomeContent, SiteLanguage } from "./home-content.ts";

type HomeProps = { content: HomeContent; locale: SiteLanguage };

export function Home({ content, locale }: HomeProps) @{
  // Octane 0.1.31 crashed when hoisted metadata read setup locals. Keep these
  // expressions inline as the removable workaround accepted by issue #35.
  // Octane 0.1.37 reports the underlying compiler defect as fixed.
  <>
    <title>{content.title as string}</title>
    <meta name="description" content={content.description[locale]} />
    <main>
      <h1>{content.title as string}</h1>
      <p>{content.introduction[locale] as string}</p>
    </main>
  </>
}
