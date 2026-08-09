'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Book, BookStatus, Locale } from '../../../../shared/content';
import { copy } from '../../../../shared/content';

export function Filter({ books, lang }: { books: readonly Book[]; lang: Locale }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BookStatus | ''>('');
  const text = copy[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextStatus = params.get('status');
    setQuery(params.get('q') ?? '');
    if (nextStatus === 'reading' || nextStatus === 'favorite' || nextStatus === 'next') setStatus(nextStatus);
  }, []);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(text.htmlLang);
    return books.filter((book) => {
      const matchesQuery = normalized === '' || `${book.title} ${book.author}`.toLocaleLowerCase(text.htmlLang).includes(normalized);
      const matchesStatus = status === '' || book.status.includes(status);
      return matchesQuery && matchesStatus;
    });
  }, [books, query, status, text.htmlLang]);

  function updateUrl(nextQuery: string, nextStatus: string) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextStatus) params.set('status', nextStatus);
    history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}`);
  }

  return (
    <>
      <form className="filter" method="get" onInput={(event) => {
        const data = new FormData(event.currentTarget);
        updateUrl(String(data.get('q') ?? ''), String(data.get('status') ?? ''));
      }}>
        <label>{text.filterLabel}<input name="q" type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} /></label>
        <label>{text.allStatuses}<select name="status" value={status} onChange={(event) => setStatus(event.currentTarget.value as BookStatus | '')}>
          <option value="">{text.allStatuses}</option>
          <option value="reading">{text.statuses.reading}</option>
          <option value="favorite">{text.statuses.favorite}</option>
          <option value="next">{text.statuses.next}</option>
        </select></label>
      </form>
      <p className="hint">{text.filterHint}</p>
      <p className="count" role="status" aria-live="polite">{text.result(visible.length)}</p>
      {visible.length === 0 ? <p>{text.noResults}</p> : null}
      <ul className="book-list">
        {visible.map((book) => <li key={book.slug}>
          <span><a className="book-title" href={`/${lang}/library/${book.slug}/`}>{book.title}</a><span className="author">{book.author}</span></span>
          <span className="status">{book.status.map((item) => text.statuses[item]).join(' · ')}</span>
        </li>)}
      </ul>
    </>
  );
}
