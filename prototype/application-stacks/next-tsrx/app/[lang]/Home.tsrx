import { copy, isLocale } from '../../../shared/content';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) @{
  const { lang } = await params;
  if (!isLocale(lang)) return;
  const text = copy[lang];

  <main id="main">
    <section className="hero">
      <p className="eyebrow">{text.siteName}</p>
      <h1>{text.intro}</h1>
    </section>
    <section aria-labelledby="work-heading">
      <h2 id="work-heading">{text.workHeading}</h2>
      <p>{text.workBody}</p>
    </section>
    <section aria-labelledby="library-heading">
      <h2 id="library-heading">{text.libraryHeading}</h2>
      <p>{text.libraryIntro}</p>
      <a href={`/${lang}/library/`}>{text.navLibrary} →</a>
    </section>
  </main>
}
