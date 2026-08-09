import type { Metadata } from 'next';
import { bookBySlug, books, isLocale, locales } from '../../../../../shared/content';
import BookPage from './BookPage.tsrx';

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
    alternates: { canonical: `https://duarte.example/${lang}/library/${slug}/`, languages: { 'en-GB': `https://duarte.example/en/library/${slug}/`, 'pt-PT': `https://duarte.example/pt/library/${slug}/` } }
  };
}

export default function Page(props: { params: Promise<{ lang: string; slug: string }> }) {
  return <BookPage {...props} />;
}
