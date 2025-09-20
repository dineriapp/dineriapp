import { defineRouting } from 'next-intl/routing';
export type Locale = "en" | "de" | "es" | "fr" | "it" | "nl";
export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'de', 'es', 'fr', 'it', 'nl'],

    // Used when no locale matches
    defaultLocale: 'en',
    localePrefix: 'always'
});