import type { Metadata } from 'next';
import { books, copy, isLocale } from '../../../../shared/content';
import { Filter } from './Filter';

const origin = 'https://duarte.example';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: copy[lang].libraryHeading,
    description: copy[lang].libraryIntro,
    alternates: { canonical: `${origin}/${lang}/library/`, languages: { 'en-GB': `${origin}/en/library/`, 'pt-PT': `${origin}/pt/library/` } }
  };
}

export default async function Library({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) return null;
  const text = copy[lang];
  return <main id="main"><h1>{text.libraryHeading}</h1><p className="library-intro">{text.libraryIntro}</p><Filter books={books} lang={lang} /></main>;
}
