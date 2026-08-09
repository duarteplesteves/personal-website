import { useEffect, useMemo, useState } from 'octane';
import { alternateLocale, bookBySlug, books, copy } from '../../shared/content.ts';
import type { BookStatus, Locale } from '../../shared/content.ts';

const origin = 'https://duarte.example';

interface AppProps { lang: Locale; path: string; }
interface LayoutProps extends AppProps { children?: any; }

function cleanPath(path: string): string {
  return path.split('?')[0].replace(/\/$/, '') || '/';
}

function localizedPath(path: string, lang: Locale): string {
  const clean = cleanPath(path);
  return clean.replace(/^\/(en|pt)(?=\/|$)/, `/${lang}`) + '/';
}

function metadataTitle(props: { lang: Locale; title?: string }): string {
  return props.title === undefined ? copy[props.lang].siteName : `${props.title} · ${copy[props.lang].siteName}`;
}

function canonicalUrl(props: { lang: Locale; path: string }): string {
  return `${origin}${localizedPath(props.path, props.lang)}`;
}

function Metadata(props: { lang: Locale; path: string; title?: string; description: string }) @{
  // PROTOTYPE WORKAROUND: assigning these expressions to ordinary local consts
  // triggers Octane 0.1.31's metadata-hoisting TDZ compiler defect. That defect
  // is a pre-agreed candidate stop condition even though inlining lets us inspect
  // the rest of the generated artifact.
  <>
    <title>{metadataTitle(props)}</title>
    <meta name="description" content={props.description} />
    <link rel="canonical" href={canonicalUrl(props)} />
    <link rel="alternate" hrefLang={copy[props.lang].htmlLang} href={canonicalUrl(props)} />
    <link rel="alternate" hrefLang={copy[alternateLocale(props.lang)].htmlLang} href={`${origin}${localizedPath(props.path, alternateLocale(props.lang))}`} />
    <meta property="og:title" content={metadataTitle(props)} />
    <meta property="og:description" content={props.description} />
    <meta property="og:url" content={canonicalUrl(props)} />
  </>
}

function Layout(props: LayoutProps) @{
  const text = copy[props.lang];
  const other = alternateLocale(props.lang);
  const otherPath = localizedPath(props.path, other);

  <>
    <a className="skip-link" href="#main">{text.skip}</a>
    <div className="shell">
      <header>
        <a className="brand" href={`/${props.lang}/`}>{text.siteName}</a>
        <nav aria-label={props.lang === 'en' ? 'Primary navigation' : 'Navegação principal'}>
          <a href={`/${props.lang}/`}>{text.navHome}</a>
          <a href={`/${props.lang}/library/`}>{text.navLibrary}</a>
          <a className="locale" href={otherPath} lang={copy[other].htmlLang} hrefLang={other}>{other}</a>
        </nav>
      </header>
      {props.children}
      <footer>PROTOTYPE · Octane</footer>
    </div>
  </>
}

function Home(props: AppProps) @{
  const text = copy[props.lang];
  <>
    <Metadata lang={props.lang} path={props.path} description={text.intro} />
    <main id="main">
      <section className="hero">
        <p className="eyebrow">{text.siteName}</p>
        <h1>{text.intro}</h1>
      </section>
      <section aria-labelledby="work-heading">
        <h2 id="work-heading">{text.workHeading}</h2>
        <p>{text.workBody}</p>
      </section>
      <section aria-labelledby="library-heading">
        <h2 id="library-heading">{text.libraryHeading}</h2>
        <p>{text.libraryIntro}</p>
        <a href={`/${props.lang}/library/`}>{text.navLibrary} →</a>
      </section>
    </main>
  </>
}

function Library(props: AppProps) @{
  const text = copy[props.lang];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<BookStatus | ''>('');

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
  }, [query, status, text.htmlLang]);

  const updateUrl = (nextQuery: string, nextStatus: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim() !== '') params.set('q', nextQuery.trim());
    if (nextStatus !== '') params.set('status', nextStatus);
    history.replaceState(null, '', `${location.pathname}${params.size > 0 ? `?${params}` : ''}`);
  };

  <>
    <Metadata lang={props.lang} path={props.path} title={text.libraryHeading} description={text.libraryIntro} />
    <main id="main">
      <h1>{text.libraryHeading}</h1>
      <p className="library-intro">{text.libraryIntro}</p>
      <form className="filter" method="get" onInput={(event) => {
        const data = new FormData(event.currentTarget);
        updateUrl(String(data.get('q') ?? ''), String(data.get('status') ?? ''));
      }}>
        <label>{text.filterLabel}<input name="q" type="search" value={query} onInput={(event) => setQuery(event.currentTarget.value)} /></label>
        <label>{text.allStatuses}<select name="status" value={status} onInput={(event) => setStatus(event.currentTarget.value as BookStatus | '')}>
          <option value="">{text.allStatuses}</option>
          <option value="reading">{text.statuses.reading}</option>
          <option value="favorite">{text.statuses.favorite}</option>
          <option value="next">{text.statuses.next}</option>
        </select></label>
      </form>
      <p className="hint">{text.filterHint}</p>
      <p className="count" role="status" aria-live="polite">{text.result(visible.length)}</p>
      @if (visible.length === 0) {
        <p>{text.noResults}</p>
      }
      <ul className="book-list">
        @for (const book of visible; key book.slug) {
          <li>
            <span><a className="book-title" href={`/${props.lang}/library/${book.slug}/`}>{book.title}</a><span className="author">{book.author}</span></span>
            <span className="status">{book.status.map((item) => text.statuses[item]).join(' · ')}</span>
          </li>
        }
      </ul>
    </main>
  </>
}

function BookPage(props: AppProps & { slug: string }) @{
  const text = copy[props.lang];
  const book = bookBySlug(props.slug)!;
  <>
    <Metadata lang={props.lang} path={props.path} title={book.title} description={book.reflection[props.lang]} />
    <main id="main" className="book-detail">
      <a href={`/${props.lang}/library/`}>← {text.back}</a>
      <p className="eyebrow">{book.status.map((item) => text.statuses[item]).join(' · ')}</p>
      <h1>{book.title}</h1>
      <p>{book.author}</p>
      <section className="reflection" aria-labelledby="reflection-heading">
        <h2 id="reflection-heading">{text.reflection}</h2>
        <p>{book.reflection[props.lang]}</p>
      </section>
    </main>
  </>
}

function NotFound(props: AppProps) @{
  <>
    <Metadata lang={props.lang} path={props.path} title="Page not found" description="This page does not exist." />
    <main id="main"><h1>Page not found</h1><p><a href={`/${props.lang}/`}>Return home</a></p></main>
  </>
}

export function App(props: AppProps) @{
  const path = cleanPath(props.path);
  const libraryPath = `/${props.lang}/library`;
  const detail = new RegExp(`^/${props.lang}/library/([^/]+)$`).exec(path);

  <Layout lang={props.lang} path={props.path}>
    @if (path === `/${props.lang}`) {
      <Home lang={props.lang} path={props.path} />
    } @else if (path === libraryPath) {
      <Library lang={props.lang} path={props.path} />
    } @else if (detail !== null && bookBySlug(detail[1]) !== undefined) {
      <BookPage lang={props.lang} path={props.path} slug={detail[1]} />
    } @else {
      <NotFound lang={props.lang} path={props.path} />
    }
  </Layout>
}
