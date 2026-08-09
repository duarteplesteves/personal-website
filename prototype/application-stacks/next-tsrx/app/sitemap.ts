import type { MetadataRoute } from 'next';
import { books, locales } from '../../shared/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = 'https://duarte.example';
  return locales.flatMap((lang) => [
    { url: `${origin}/${lang}/`, alternates: { languages: { en: `${origin}/en/`, pt: `${origin}/pt/` } } },
    { url: `${origin}/${lang}/library/`, alternates: { languages: { en: `${origin}/en/library/`, pt: `${origin}/pt/library/` } } },
    ...books.map((book) => ({ url: `${origin}/${lang}/library/${book.slug}/`, alternates: { languages: { en: `${origin}/en/library/${book.slug}/`, pt: `${origin}/pt/library/${book.slug}/` } } }))
  ]);
}
