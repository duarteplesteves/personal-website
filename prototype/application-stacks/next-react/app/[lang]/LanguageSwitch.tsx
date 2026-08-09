'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '../../../shared/content';
import { copy } from '../../../shared/content';

export function LanguageSwitch({ current, other }: { current: Locale; other: Locale }) {
  const [href, setHref] = useState(`/${other}/`);
  useEffect(() => setHref(`${location.pathname.replace(new RegExp(`^/${current}(?=/|$)`), `/${other}`)}${location.search}`), [current, other]);
  return <a className="locale" href={href} lang={copy[other].htmlLang} hrefLang={other}>{other}</a>;
}
