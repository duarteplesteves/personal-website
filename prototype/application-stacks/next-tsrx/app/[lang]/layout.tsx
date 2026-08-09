import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { copy, isLocale, locales } from '../../../shared/content';
import LocaleLayout from './LocaleLayout.tsrx';
import '../../../shared/styles.css';

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    metadataBase: new URL('https://duarte.example'),
    title: { default: copy[lang].siteName, template: `%s · ${copy[lang].siteName}` },
    description: copy[lang].intro
  };
}

export default function Layout(props: { children: ReactNode; params: Promise<{ lang: string }> }) {
  return <LocaleLayout {...props} />;
}
