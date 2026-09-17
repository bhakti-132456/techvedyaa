import { NextResponse } from 'next/server';
import { company } from '@/lib/company';

/* Server-side relay for the enquiry form.

   The browser posts here, same-origin; this route forwards to Google Apps
   Script. Three things this buys over calling Apps Script from the browser:

   1. Personal data travels in a request body, not a URL. Query strings end up
      in browser history, proxy logs and Referer headers — the wrong place for
      a name, email and phone number.
   2. The Apps Script endpoint is no longer public. It moves from
      NEXT_PUBLIC_GOOGLE_SCRIPT_URL to a server-only GOOGLE_SCRIPT_URL, so it
      can't be scraped out of the client bundle and spammed directly.
   3. We see the real response. The old client call used mode:'no-cors', which
      returns an opaque result — a failed submission still reported success to
      the visitor.

   Apps Script reads form fields from e.parameter, so the upstream request stays
   form-encoded and code.gs needs no changes. */

export const runtime = 'nodejs';

const MAX = { name: 100, email: 200, phone: 32, requirements: 5000 } as const;

/* Deliberately permissive — this rejects obvious junk, not unusual-but-valid
   addresses. Real validation is the reply landing in someone's inbox. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Payload = {
    name: string;
    email: string;
    phone: string;
    requirements: string;
    whatsappEnabled: boolean;
    consent: boolean;
    /* Honeypot: a field hidden from humans. Anything that fills it is a bot. */
    website?: string;
};

export async function POST(request: Request) {
    const endpoint = process.env.GOOGLE_SCRIPT_URL;

    if (!endpoint) {
        console.error('[contact] GOOGLE_SCRIPT_URL is not set — cannot forward submission');
        return NextResponse.json(
            { ok: false, error: 'The contact form is not configured. Please email us instead.' },
            { status: 503 }
        );
    }

    let body: Partial<Payload>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
    }

    // Silently accept and discard bot submissions — an error would tell them
    // what tripped the trap.
    if (body.website) return NextResponse.json({ ok: true });

    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim();
    const phone = (body.phone ?? '').trim();
    const requirements = (body.requirements ?? '').trim();

    if (!name || !email || !requirements) {
        return NextResponse.json(
            { ok: false, error: 'Please fill in your name, email and requirements.' },
            { status: 400 }
        );
    }

    if (!EMAIL.test(email)) {
        return NextResponse.json(
            { ok: false, error: 'That email address does not look right.' },
            { status: 400 }
        );
    }

    if (!body.consent) {
        return NextResponse.json(
            { ok: false, error: 'Please agree to the privacy policy before submitting.' },
            { status: 400 }
        );
    }

    if (
        name.length > MAX.name ||
        email.length > MAX.email ||
        phone.length > MAX.phone ||
        requirements.length > MAX.requirements
    ) {
        return NextResponse.json({ ok: false, error: 'That submission is too long.' }, { status: 400 });
    }

    /* Record what was agreed to, not just that something was. If consent is
       ever questioned, "they ticked a box" is not an answer — the wording and
       the timestamp are. Keep this string in sync with the form label. */
    const consentRecord =
        `Agreed to the Privacy Policy and to being contacted about this enquiry. ` +
        `Retention: ${company.leadRetention}.`;

    const upstream = new URLSearchParams({
        name,
        email,
        phone,
        requirements,
        whatsappEnabled: String(Boolean(body.whatsappEnabled)),
        consent: 'true',
        consentText: consentRecord,
        consentAt: new Date().toISOString(),
    });

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: upstream.toString(),
            // Apps Script answers the POST with a redirect to its result page.
            redirect: 'follow',
            signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) {
            console.error('[contact] upstream rejected submission', res.status);
            return NextResponse.json(
                { ok: false, error: 'We could not send that just now. Please try again.' },
                { status: 502 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[contact] failed to reach upstream', error);
        return NextResponse.json(
            { ok: false, error: 'We could not send that just now. Please try again.' },
            { status: 502 }
        );
    }
}
