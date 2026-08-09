import { hydrateRoot } from 'octane';
import { App } from './App.tsrx';
import '../../shared/styles.css';
import type { Locale } from '../../shared/content.ts';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root');
const parts = window.location.pathname.split('/').filter(Boolean);
const lang: Locale = parts[0] === 'pt' ? 'pt' : 'en';
hydrateRoot(root, App, { lang, path: window.location.pathname });
