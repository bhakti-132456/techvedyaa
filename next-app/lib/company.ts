/* ============================================
   TechVedyaa — Company & Compliance Details

   Single source of truth for every legal / statutory detail rendered on the
   site. The privacy policy, terms, footer and consent copy all read from here,
   so filling these in once updates every surface.

   Values marked TODO are placeholders. `pendingDetails()` reports which are
   still unfilled and is surfaced as a dev-only console warning by
   <ComplianceCheck /> — it never runs in production.
   ============================================ */

/** Marker for a value that still needs real data before launch. */
const TODO = (hint: string) => `TODO:${hint}`;

export const isPlaceholder = (value: string) => value.startsWith('TODO:');

export const company = {
    legalName: 'TechVedyaa India Pvt Ltd',
    shortName: 'TechVedyaa',

    /* Statutory identity — required in the footer for an Indian private
       limited company, and referenced by both legal pages. */
    cin: TODO('Corporate Identity Number (21 chars, from your MCA certificate)'),
    registeredAddress: TODO('Registered office address as filed with the MCA'),

    /* General contact */
    email: TODO('primary contact email, e.g. hello@techvedyaa.com'),
    phone: TODO('primary contact number in international format'),

    /* Grievance contact — the DPDP Act requires a published, working point of
       contact for data-principal complaints. This can be a named person or a
       role address, but it must be monitored and it must be reachable. */
    grievanceOfficer: {
        name: TODO('name of the person answering data-protection queries'),
        title: 'Grievance Officer',
        email: TODO('a monitored address, e.g. privacy@techvedyaa.com'),
    },

    /* How long contact-form submissions are retained before deletion. Stated in
       the privacy policy, so whatever goes here has to match what you
       actually do. */
    leadRetention: '24 months',

    /* Governing law for the Terms. */
    jurisdiction: TODO('city and state for jurisdiction, e.g. Hyderabad, Telangana'),

    /* Set once the policies have been reviewed and published. Shown as
       "Last updated" on both legal pages. */
    policyLastUpdated: 'TODO:date the reviewed policy goes live',
} as const;

/* Third parties that receive personal data submitted through the site. Every
   entry here is disclosed in the privacy policy — adding a processor to the
   stack means adding it to this list. */
export const processors = [
    {
        name: 'Google (Apps Script & Sheets)',
        purpose: 'Receives and stores contact-form submissions.',
        location: 'Global infrastructure, including outside India',
        policy: 'https://policies.google.com/privacy',
    },
    {
        name: 'Telegram',
        purpose: 'Delivers a notification to our team when an enquiry arrives.',
        location: 'Outside India',
        policy: 'https://telegram.org/privacy',
    },
] as const;

/** Every placeholder still awaiting a real value, flattened for reporting. */
export function pendingDetails(): string[] {
    const pending: string[] = [];

    const walk = (obj: Record<string, unknown>, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
            const label = path ? `${path}.${key}` : key;
            if (typeof value === 'string') {
                if (isPlaceholder(value)) pending.push(`${label}: ${value.slice(5)}`);
            } else if (value && typeof value === 'object') {
                walk(value as Record<string, unknown>, label);
            }
        }
    };

    walk(company as unknown as Record<string, unknown>);
    return pending;
}

/** Renders a placeholder as a visible blank rather than leaking "TODO:" copy. */
export const display = (value: string) => (isPlaceholder(value) ? 'to be confirmed' : value);
