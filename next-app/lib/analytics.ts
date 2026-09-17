/* ============================================
   TechVedyaa — Analytics (not yet enabled)

   Nothing here loads or tracks anything today. This is the wiring so that
   turning analytics on later is a config change rather than a scavenger hunt
   through components.

   ---- Turning it on ----
   1. Pick a provider and set NEXT_PUBLIC_ANALYTICS_PROVIDER in .env.local.
   2. Fill in the matching site/measurement id.
   3. Implement the script tag in <Analytics />, which is already mounted.
   4. Add the provider to `processors` in lib/company.ts so it appears in the
      privacy policy. This is not optional — an undisclosed processor is the
      most common way a compliant site quietly stops being one.

   ---- Why the provider choice decides the cookie banner ----
   'plausible' | 'fathom' | 'umami' | 'vercel'
       Cookieless and aggregate-only. No consent banner needed under the usual
       EU reading, and the privacy policy stays short.
   'ga4'
       Sets cookies and profiles across sites. Requires a real consent banner
       that blocks the script until the visitor opts in, plus Consent Mode v2.
       Choose this only if conversions need to flow back into Google Ads.

   `requiresConsent` below encodes that split, and <CookieConsent /> reads it —
   so selecting 'ga4' automatically brings the banner into play.
   ============================================ */

export type AnalyticsProvider = 'none' | 'plausible' | 'fathom' | 'umami' | 'vercel' | 'ga4';

const configured = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? 'none') as AnalyticsProvider;

export const analytics = {
    provider: configured,

    /** Measurement / site id for the chosen provider. Unused while 'none'. */
    siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID ?? '',

    /** Self-hosted providers (Umami, Plausible CE) need their own script host. */
    host: process.env.NEXT_PUBLIC_ANALYTICS_HOST ?? '',
} as const;

/** True once a provider is actually selected. */
export const analyticsEnabled = analytics.provider !== 'none';

/** Providers that set identifying cookies and therefore need prior consent. */
const CONSENT_REQUIRED: AnalyticsProvider[] = ['ga4'];

/** Whether the current configuration obliges us to ask before tracking. */
export const requiresConsent = CONSENT_REQUIRED.includes(analytics.provider);

/* Storage key for the visitor's banner decision. Versioned so that materially
   changing what we collect can invalidate old consents rather than silently
   inheriting them. */
export const CONSENT_STORAGE_KEY = 'tv-consent-v1';

export type ConsentValue = 'granted' | 'denied';

/** Reads a previously stored decision. Returns null if the visitor hasn't chosen. */
export function readConsent(): ConsentValue | null {
    if (typeof window === 'undefined') return null;
    try {
        const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
        return stored === 'granted' || stored === 'denied' ? stored : null;
    } catch {
        // Storage can throw in private modes — treat as "no decision recorded".
        return null;
    }
}

export function writeConsent(value: ConsentValue) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
        /* nothing useful to do if storage is unavailable */
    }
}
