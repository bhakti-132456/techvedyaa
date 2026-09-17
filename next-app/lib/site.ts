/* ============================================
   Canonical origin

   Canonical URLs, the sitemap, robots.txt and Open Graph image URLs all have to
   agree on one absolute origin, and Next needs it as `metadataBase` before it
   will resolve any relative metadata URL.

   Resolution order, so a preview deploy never advertises itself as the real
   site and a local build never emits localhost canonicals:
     1. NEXT_PUBLIC_SITE_URL — set this in Vercel to pin the production domain.
     2. VERCEL_PROJECT_PRODUCTION_URL — the project's production hostname, which
        Vercel injects into every deployment including previews. Using it rather
        than VERCEL_URL is deliberate: VERCEL_URL is the *current* deployment's
        unique hostname, so previews would self-canonicalise and get indexed.
     3. The registered domain, as a build-time fallback.
   ============================================ */

const FALLBACK_ORIGIN = 'https://techvedyaa.com';

function resolveOrigin(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (explicit) return explicit.replace(/\/+$/, '');

    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

    return FALLBACK_ORIGIN;
}

export const siteUrl = resolveOrigin();

/** Absolute URL for a site-relative path. */
export const absolute = (path: string) => new URL(path, siteUrl).toString();

/* Every indexable route. The site is three pages, so this is written out rather
   than crawled — add to it when a route is added. `changeFrequency` and
   `priority` are hints only; search engines largely ignore them, but they cost
   nothing and some smaller crawlers still read them. */
export const routes = [
    { path: '/', changeFrequency: 'monthly', priority: 1 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
] as const;
