import type { Metadata } from 'next';
import { alternateLocale, copy, isLocale } from '../../../shared/content';

const origin = 'https://duarte.example';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const other = alternateLocale(lang);
  return {
    alternates: {
      canonical: `${origin}/${lang}/`,
      languages: { 'en-GB': `${origin}/en/`, 'pt-PT': `${origin}/pt/` }
    },
    openGraph: { title: copy[lang].siteName, description: copy[lang].intro, url: `${origin}/${lang}/`, locale: lang === 'en' ? 'en_GB' : 'pt_PT' }
  };
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const text = copy[lang];
  return (
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
  );
}
