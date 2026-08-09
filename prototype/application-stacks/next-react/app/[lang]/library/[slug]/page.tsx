import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { alternateLocale, bookBySlug, books, copy, isLocale, locales } from '../../../../../shared/content';

const origin = 'https://duarte.example';

export function generateStaticParams() {
  return locales.flatMap((lang) => books.map((book) => ({ lang, slug: book.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const book = bookBySlug(slug);
  if (!isLocale(lang) || !book) return {};
  return {
    title: book.title,
    description: book.reflection[lang],
    alternates: { canonical: `${origin}/${lang}/library/${slug}/`, languages: { 'en-GB': `${origin}/en/library/${slug}/`, 'pt-PT': `${origin}/pt/library/${slug}/` } }
  };
}

export default async function BookPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const book = bookBySlug(slug);
  if (!isLocale(lang) || !book) notFound();
  const text = copy[lang];
  return <main id="main" className="book-detail"><a href={`/${lang}/library/`}>← {text.back}</a><p className="eyebrow">{book.status.map((item) => text.statuses[item]).join(' · ')}</p><h1>{book.title}</h1><p>{book.author}</p><section className="reflection" aria-labelledby="reflection-heading"><h2 id="reflection-heading">{text.reflection}</h2><p>{book.reflection[lang]}</p></section></main>;
}
