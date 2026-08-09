import type { Metadata } from 'next';
import { copy, isLocale } from '../../../../shared/content';
import Library from './Library.tsrx';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: copy[lang].libraryHeading,
    description: copy[lang].libraryIntro,
    alternates: { canonical: `https://duarte.example/${lang}/library/`, languages: { 'en-GB': 'https://duarte.example/en/library/', 'pt-PT': 'https://duarte.example/pt/library/' } }
  };
}

export default function Page(props: { params: Promise<{ lang: string }> }) {
  return <Library {...props} />;
}
