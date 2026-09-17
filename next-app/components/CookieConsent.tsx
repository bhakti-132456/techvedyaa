'use client';

import Link from 'next/link';
import { requiresConsent, writeConsent, type ConsentValue } from '@/lib/analytics';
import { useConsent, announceConsentChange } from '@/lib/useConsent';
import styles from './CookieConsent.module.css';

/* Consent banner for cookie-setting analytics.

   Renders nothing today: `requiresConsent` is false while the provider is
   'none' (and stays false for any cookieless provider). Showing a cookie
   banner on a site that sets no cookies is theatre, and it trains people to
   dismiss the one that eventually matters.

   Selecting 'ga4' in lib/analytics.ts flips `requiresConsent` and this appears
   automatically.

   Two things here are deliberate rather than incidental:
   - Reject is the same size and prominence as Accept. A banner where refusing
     is harder than agreeing does not collect valid consent.
   - Nothing loads until a choice is made. <Analytics /> reads the same stored
     decision and stays inert until it says 'granted'. */
export default function CookieConsent() {
    const decision = useConsent();

    const choose = (value: ConsentValue) => {
        writeConsent(value);
        // Drives the re-render here and un-gates <Analytics /> in the same tick.
        announceConsentChange();
    };

    if (!requiresConsent) return null;
    // Anything other than 'undecided' means a choice is already on record, or
    // we're still server-rendering — neither should show the banner.
    if (decision !== 'undecided') return null;

    return (
        <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Cookie consent">
            <div className={styles.inner}>
                <p className={styles.copy}>
                    We use analytics cookies to understand how this site is used. They are optional,
                    and nothing is set until you choose.{' '}
                    <Link href="/privacy" className={styles.link}>
                        Privacy Policy
                    </Link>
                </p>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost}`}
                        onClick={() => choose('denied')}
                    >
                        Reject
                    </button>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSolid}`}
                        onClick={() => choose('granted')}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
