import type { HomeContent, SiteLanguage } from "./home-content.ts";

// @tsrx/typescript-plugin requires TypeScript 5.9 and cannot run under the
// pinned TypeScript 7 compiler. This exact declaration types the import boundary;
// every build compiles the authored component with Octane.
type HomeProps = { content: HomeContent; locale: SiteLanguage };

export declare function Home(props: HomeProps): unknown;
