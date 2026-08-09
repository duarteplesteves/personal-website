import { notFound } from 'next/navigation';
import { bookBySlug, copy, isLocale } from '../../../../../shared/content';

export default async function BookPage({ params }: { params: Promise<{ lang: string; slug: string }> }) @{
  const { lang, slug } = await params;
  const book = bookBySlug(slug);
  if (!isLocale(lang) || !book) notFound();
  const text = copy[lang];

  <main id="main" className="book-detail">
    <a href={`/${lang}/library/`}>← {text.back}</a>
    <p className="eyebrow">{book.status.map((item) => text.statuses[item]).join(' · ')}</p>
    <h1>{book.title}</h1>
    <p>{book.author}</p>
    <section className="reflection" aria-labelledby="reflection-heading">
      <h2 id="reflection-heading">{text.reflection}</h2>
      <p>{book.reflection[lang]}</p>
    </section>
  </main>
}
