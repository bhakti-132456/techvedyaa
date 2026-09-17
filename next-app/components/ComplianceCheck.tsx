'use client';

import { useEffect } from 'react';
import { pendingDetails } from '@/lib/company';

/* Dev-only reminder of which statutory details are still placeholders.

   The legal pages render these as visible blanks, which is honest but easy to
   stop noticing. This puts the list in the console on every dev boot so the
   gap stays annoying until it's closed. Compiled out of production builds. */
export default function ComplianceCheck() {
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;

        const pending = pendingDetails();
        if (!pending.length) return;

        console.warn(
            `[compliance] ${pending.length} detail(s) still to be filled in before launch ` +
                `— see lib/company.ts:\n` +
                pending.map((p) => `  • ${p}`).join('\n')
        );
    }, []);

    return null;
}
