'use client';

import Script from 'next/script';
import { analytics, analyticsEnabled, requiresConsent } from '@/lib/analytics';
import { useConsent } from '@/lib/useConsent';

/* Mounts the configured analytics script, or nothing at all.

   Today `provider` is 'none', so this renders null and the site ships with zero
   third-party tracking. The component is mounted in the layout anyway so that
   enabling analytics later needs no structural change.

   The consent gate is the part worth keeping intact: for a provider that sets
   cookies, the script must not load until the visitor has actively agreed.
   Loading first and deleting cookies afterwards is the single most common way
   a cookie banner fails to do its job. */
export default function Analytics() {
    // Subscribed rather than read once: consent granted in the banner mid-session
    // un-gates the script immediately, with no reload.
    const decision = useConsent();

    if (!analyticsEnabled) return null;
    if (requiresConsent && decision !== 'granted') return null;

    switch (analytics.provider) {
        /* Cookieless providers — safe to load immediately.
           Uncomment and adjust once a provider and site id are configured. */
        case 'plausible':
            return (
                <Script
                    defer
                    data-domain={analytics.siteId}
                    src={`${analytics.host || 'https://plausible.io'}/js/script.js`}
                />
            );

        case 'umami':
            return (
                <Script
                    defer
                    data-website-id={analytics.siteId}
                    src={`${analytics.host}/script.js`}
                />
            );

        /* Cookie-setting provider — only reached once consent is granted above.
           Consent Mode v2 defaults still need configuring before this is used
           in the EU. */
        case 'ga4':
            return (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${analytics.siteId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','${analytics.siteId}',{anonymize_ip:true});`}
                    </Script>
                </>
            );

        default:
            return null;
    }
}
