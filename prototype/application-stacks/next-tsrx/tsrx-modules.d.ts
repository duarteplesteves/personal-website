// Next's built-in checker does not load the TSRX language plugin. The mandatory
// tsrx-tsc pass above owns semantic checking for .tsrx modules.
declare module '*.tsrx' {
  const component: any;
  export default component;
}
