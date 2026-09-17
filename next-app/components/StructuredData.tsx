import { company, isPlaceholder } from '@/lib/company';
import { absolute, siteUrl } from '@/lib/site';

/* ============================================
   JSON-LD — Organization + WebSite

   Gives search engines an explicit entity for the company rather than leaving
   them to infer one from page copy, which is what powers a knowledge panel and
   the site name shown above a result.

   Fields still carrying a TODO in lib/company.ts are omitted entirely. A
   structured-data field holding placeholder text is worse than an absent one:
   it gets indexed, and Google flags invented contact details.
   ============================================ */

type Json = Record<string, unknown>;

/** Include a key only when its value is real. */
const real = (value: string) => (isPlaceholder(value) ? undefined : value);

function organization(): Json {
    const node: Json = {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: company.legalName,
        alternateName: company.shortName,
        url: siteUrl,
        logo: {
            '@type': 'ImageObject',
            url: absolute('/assets/logo-full.png'),
        },
        description:
            'Digital solutions and business intelligence provider: marketing automation, AI-powered solutions, analytics and reporting, custom technology and brand strategy, with a specialized recruitment practice for the manufacturing sector.',
    };

    const email = real(company.email);
    const phone = real(company.phone);
    const address = real(company.registeredAddress);

    if (email || phone) {
        node.contactPoint = {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            ...(email ? { email } : {}),
            ...(phone ? { telephone: phone } : {}),
            areaServed: 'IN',
            availableLanguage: ['en'],
        };
    }

    if (address) {
        node.address = { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'IN' };
    }

    return node;
}

export default function StructuredData() {
    const graph = {
        '@context': 'https://schema.org',
        '@graph': [
            organization(),
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}/#website`,
                url: siteUrl,
                name: company.shortName,
                publisher: { '@id': `${siteUrl}/#organization` },
                inLanguage: 'en',
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            // JSON.stringify output is data, not markup, but `<` inside a string
            // would still close the script tag early — escape it.
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
            }}
        />
    );
}
