// This type-only forwarding module keeps components independent from repository schemas.
// TypeScript erases the dependency, so Effect does not enter the frontend bundle.
export type { HomePageData } from "./page-data-schema.ts";
