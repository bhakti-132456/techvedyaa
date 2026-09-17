import type { MetadataRoute } from 'next';
import { absolute, routes } from '@/lib/site';

/* Served at /sitemap.xml. Referenced from robots.ts so crawlers find it without
   the URL having to be submitted anywhere. */
export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return routes.map((route) => ({
        url: absolute(route.path),
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
}
