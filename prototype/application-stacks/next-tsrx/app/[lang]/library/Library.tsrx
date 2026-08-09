import { books, copy, isLocale } from '../../../../shared/content';
import { Filter } from './Filter';

export default async function Library({ params }: { params: Promise<{ lang: string }> }) @{
  const { lang } = await params;
  if (!isLocale(lang)) return;
  const text = copy[lang];

  <main id="main">
    <h1>{text.libraryHeading}</h1>
    <p className="library-intro">{text.libraryIntro}</p>
    <Filter books={books} lang={lang} />
  </main>
}
