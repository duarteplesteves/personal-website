import type { HomePageData } from "./page-data.ts";

type HomeProps = { content: HomePageData };

export function Home({ content }: HomeProps) @{
  <>
    <title>{content.title}</title>
    <meta name="description" content={content.description} />
    <main>
      <h1>{content.title}</h1>
      <p>{content.introduction}</p>
    </main>
  </>;
}
