'use client';

import { useSyncExternalStore } from 'react';
import { readConsent, type ConsentValue } from './analytics';

/* The visitor's consent decision, as an external store.

   localStorage is genuinely external state that doesn't exist during SSR, so
   useSyncExternalStore is the right primitive: reading it in an effect would
   mean a setState on every mount and a flash of the pre-consent UI before the
   stored value loads.

   Both <CookieConsent /> (which writes) and <Analytics /> (which gates on the
   value) subscribe here, so granting consent in the banner immediately
   un-gates the analytics script without a reload. */

export type ConsentState = ConsentValue | 'undecided' | 'unknown';

function subscribe(onChange: () => void) {
    // 'storage' covers other tabs; the custom event covers this one, since a
    // tab does not receive its own StorageEvent.
    window.addEventListener('storage', onChange);
    window.addEventListener('tv:consent-change', onChange);
    return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener('tv:consent-change', onChange);
    };
}

const getSnapshot = (): ConsentState => readConsent() ?? 'undecided';

/* 'unknown' server-side: during SSR we cannot know the decision, and rendering
   as though none was made would flash the banner at people who already
   answered. React re-renders with the real value after hydration. */
const getServerSnapshot = (): ConsentState => 'unknown';

export function useConsent(): ConsentState {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Broadcasts a change so both subscribers update without a reload. */
export function announceConsentChange() {
    window.dispatchEvent(new Event('tv:consent-change'));
}
