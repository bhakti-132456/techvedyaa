import type { MetadataRoute } from 'next';
import { absolute } from '@/lib/site';

/* Served at /robots.txt.

   /api/ is disallowed because the only route under it is the contact-form
   handler: a POST endpoint with nothing to index, and no reason to spend crawl
   budget on. Everything else is open. */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: '/api/',
            },
        ],
        sitemap: absolute('/sitemap.xml'),
        host: absolute('/').replace(/\/$/, ''),
    };
}
