export const siteStyles = `
:root {
  color-scheme: light;
  font-family: Georgia, "Times New Roman", serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  --background: oklch(0.97 0.012 82);
  --text: oklch(0.24 0.02 65);
  --muted: oklch(0.43 0.025 65);
  --link: oklch(0.39 0.085 48);
  --focus: oklch(0.48 0.14 48);
}

* { box-sizing: border-box; }
html { background: var(--background); color: var(--text); }
body { margin: 0; min-width: 20rem; }
a {
  color: var(--link);
  text-decoration-thickness: from-font;
  text-underline-position: from-font;
  text-underline-offset: 0.16em;
}
a:hover { text-decoration-thickness: 0.12em; }
a:focus-visible {
  outline: 0.15rem solid var(--focus);
  outline-offset: 0.2rem;
}
.skip-link {
  position: absolute;
  inset-block-start: 0.5rem;
  inset-inline-start: 0.75rem;
  z-index: 1;
  padding: 0.65rem 0.8rem;
  background: var(--background);
  transform: translateY(-200%);
}
.skip-link:focus { transform: translateY(0); }
.site-header,
main {
  width: min(100% - 2rem, 46rem);
  margin-inline: auto;
}
.site-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem 2rem;
  padding-block: 1.5rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.95rem;
}
.primary-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1.25rem;
}
.primary-navigation a,
.language-navigation a {
  display: inline-block;
  padding-block: 0.7rem;
}
.primary-navigation [aria-current="page"] {
  color: var(--text);
  font-weight: 650;
  text-decoration-thickness: 0.12em;
}
.language-navigation { margin: 0; white-space: nowrap; color: var(--muted); }
main { padding-block: clamp(3rem, 12vw, 7rem); }
h1 {
  max-width: 18ch;
  margin: 0;
  font-size: clamp(2.25rem, 9vw, 4.75rem);
  font-weight: 400;
  letter-spacing: -0.035em;
  line-height: 1.05;
  text-wrap: balance;
}
.introduction {
  max-width: 62ch;
  margin-block: 2rem 0;
  color: var(--muted);
  font-size: clamp(1.08rem, 3vw, 1.25rem);
  line-height: 1.6;
  text-wrap: pretty;
}
main section { margin-block-start: 5rem; }
main section h2 { margin-block-end: 0.75rem; font-weight: 500; }
.work-entry { max-width: 65ch; }
.work-entry + .work-entry { margin-block-start: 2.5rem; }
.work-entry h3 { margin-block: 1.5rem 0 0.5rem; font-size: 1.1rem; font-weight: 600; }
.work-entry p { margin-block: 0; line-height: 1.6; text-wrap: pretty; }
.work-entry .section-note { margin-block-end: 0.5rem; }
main section ul { padding-inline-start: 1.25rem; line-height: 1.7; }
.section-note { margin-block: 0 1rem; color: var(--muted); }
.book-list {
  padding: 0;
  margin-block: 3rem 0;
  list-style: none;
  font-size: 1.05rem;
  line-height: 1.6;
  overflow-wrap: break-word;
}
.book-list cite { font-style: normal; }
.book-list .relationship { display: block; color: var(--muted); font-size: 0.9rem; }
.book-list blockquote {
  max-width: 58ch;
  margin: 0.75rem 0 0;
  color: var(--muted);
  font-style: italic;
}
.book-list li + li { margin-block-start: 2rem; }
.language-chooser { padding-block-start: clamp(4rem, 16vw, 9rem); }
.language-chooser h1 { max-width: 15ch; font-size: clamp(2rem, 8vw, 4.25rem); }
.chooser-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: 2rem;
  margin-block-start: 3rem;
}
.chooser-options p {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  margin: 0;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
}
.chooser-options a { padding-block: 0.65rem; font-family: ui-sans-serif, system-ui, sans-serif; }
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 31rem) {
  .site-header { align-items: flex-start; flex-direction: column; }
  main { padding-block-start: 2.5rem; }
}
@media (forced-colors: active) {
  a:focus-visible { outline-color: Highlight; }
}
`;
