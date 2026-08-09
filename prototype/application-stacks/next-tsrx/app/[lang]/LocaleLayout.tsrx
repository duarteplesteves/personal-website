import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { alternateLocale, copy, isLocale } from '../../../shared/content';
import { LanguageSwitch } from './LanguageSwitch';
import '../../../shared/styles.css';

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) @{
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const text = copy[lang];
  const other = alternateLocale(lang);

  <html lang={text.htmlLang}>
    <body>
      <a className="skip-link" href="#main">{text.skip}</a>
      <div className="shell">
        <header>
          <a className="brand" href={`/${lang}/`}>{text.siteName}</a>
          <nav aria-label={lang === 'en' ? 'Primary navigation' : 'Navegação principal'}>
            <a href={`/${lang}/`}>{text.navHome}</a>
            <a href={`/${lang}/library/`}>{text.navLibrary}</a>
            <LanguageSwitch current={lang} other={other} />
          </nav>
        </header>
        {children}
        <footer>PROTOTYPE · Next.js with constrained TSRX</footer>
      </div>
    </body>
  </html>
}
