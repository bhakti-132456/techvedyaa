import type { EngagementModel } from '@/lib/types';

export const engagementModels: EngagementModel[] = [
    {
        title: 'Project-Based',
        description:
            'Specific, defined-scope engagements with clear deliverables and timelines. Perfect for one-time initiatives or specific campaigns.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
    },
    {
        title: 'Retainer-Based',
        description:
            'Ongoing support, optimization, and continuous improvement. Ideal for businesses seeking long-term partnership and consistent growth.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
    },
    {
        title: 'Hybrid',
        description:
            'Combination of project work and ongoing management. The best of both worlds for businesses with varied needs.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88"/><path d="m11.5 12.5-1-1a1 1 0 0 0-3 3l3.88 3.88"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`,
    },
];
