export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];
export type BookStatus = 'reading' | 'favorite' | 'next';

export interface Book {
  slug: string;
  title: string;
  author: string;
  status: readonly BookStatus[];
  reflection: Record<Locale, string>;
}

export const books: readonly Book[] = [
  {
    slug: 'the-design-of-everyday-things',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    status: ['favorite'],
    reflection: {
      en: 'A durable reminder that confusion is often designed into the object, not caused by the person.',
      pt: 'Um lembrete duradouro de que a confusão está muitas vezes no objeto, não na pessoa.'
    }
  },
  {
    slug: 'the-beginning-of-infinity',
    title: 'The Beginning of Infinity',
    author: 'David Deutsch',
    status: ['reading'],
    reflection: {
      en: 'Currently reading; no finished reflection yet.',
      pt: 'Em leitura; ainda sem uma reflexão concluída.'
    }
  },
  {
    slug: 'the-scout-mindset',
    title: 'The Scout Mindset',
    author: 'Julia Galef',
    status: ['next'],
    reflection: {
      en: 'A next read, held as an intention rather than a queue promise.',
      pt: 'Uma próxima leitura, assumida como intenção e não como promessa de ordem.'
    }
  },
  {
    slug: 'thinking-in-systems',
    title: 'Thinking in Systems',
    author: 'Donella H. Meadows',
    status: ['favorite'],
    reflection: {
      en: 'A practical vocabulary for seeing feedback, delay, and leverage.',
      pt: 'Um vocabulário prático para reconhecer feedback, atrasos e pontos de alavancagem.'
    }
  },
  {
    slug: 'a-philosophy-of-software-design',
    title: 'A Philosophy of Software Design',
    author: 'John Ousterhout',
    status: ['reading', 'favorite'],
    reflection: {
      en: 'Useful pressure toward deep modules and interfaces that hide complexity.',
      pt: 'Uma pressão útil para módulos profundos e interfaces que escondem complexidade.'
    }
  },
  {
    slug: 'the-order-of-time',
    title: 'The Order of Time',
    author: 'Carlo Rovelli',
    status: ['next'],
    reflection: {
      en: 'Waiting nearby for a slower reading week.',
      pt: 'À espera de uma semana de leitura mais lenta.'
    }
  }
];

export const copy = {
  en: {
    htmlLang: 'en-GB',
    siteName: 'Duarte Esteves',
    navHome: 'Home',
    navLibrary: 'Library',
    intro: 'I follow curiosity through software, books, and the problems between them.',
    workHeading: 'Working on',
    workBody: 'A personal home, better repository workflows, and software that explains itself.',
    libraryHeading: 'Library',
    libraryIntro: 'Books I am reading, returning to, or hoping to read next.',
    filterLabel: 'Filter books',
    filterHint: 'The URL updates as you type. Without JavaScript, the complete Library remains readable.',
    allStatuses: 'All relationships',
    statuses: { reading: 'Currently reading', favorite: 'Favorites', next: 'Next reads' },
    result: (count: number) => `${count} ${count === 1 ? 'book' : 'books'}`,
    noResults: 'No books match these filters.',
    back: 'Back to the Library',
    reflection: 'Reflection',
    skip: 'Skip to content'
  },
  pt: {
    htmlLang: 'pt-PT',
    siteName: 'Duarte Esteves',
    navHome: 'Início',
    navLibrary: 'Biblioteca',
    intro: 'Sigo a curiosidade através de software, livros e dos problemas entre ambos.',
    workHeading: 'Em curso',
    workBody: 'Uma casa pessoal, melhores fluxos de repositório e software que se explica.',
    libraryHeading: 'Biblioteca',
    libraryIntro: 'Livros que estou a ler, a revisitar ou que espero ler em breve.',
    filterLabel: 'Filtrar livros',
    filterHint: 'O URL é atualizado à medida que escreve. Sem JavaScript, a Biblioteca completa continua legível.',
    allStatuses: 'Todas as relações',
    statuses: { reading: 'Em leitura', favorite: 'Favoritos', next: 'Próximas leituras' },
    result: (count: number) => `${count} ${count === 1 ? 'livro' : 'livros'}`,
    noResults: 'Nenhum livro corresponde a estes filtros.',
    back: 'Voltar à Biblioteca',
    reflection: 'Reflexão',
    skip: 'Saltar para o conteúdo'
  }
} as const;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function alternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt' : 'en';
}

export function bookBySlug(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
}
