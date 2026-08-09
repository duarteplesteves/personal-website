import type { Metadata } from 'next';
import { copy, isLocale } from '../../../shared/content';
import Home from './Home.tsrx';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    alternates: { canonical: `https://duarte.example/${lang}/`, languages: { 'en-GB': 'https://duarte.example/en/', 'pt-PT': 'https://duarte.example/pt/' } },
    openGraph: { title: copy[lang].siteName, description: copy[lang].intro, url: `https://duarte.example/${lang}/`, locale: lang === 'en' ? 'en_GB' : 'pt_PT' }
  };
}

export default function Page(props: { params: Promise<{ lang: string }> }) {
  return <Home {...props} />;
}
