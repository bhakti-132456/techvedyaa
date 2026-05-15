import type { ScopePillar, AnalyticsFeature } from '@/lib/types';

export const scopePillars: ScopePillar[] = [
    {
        id: 'strategic',
        title: 'Strategic Planning',
        items: [
            'Market Intelligence & Competitive Landscape Analysis',
            'Brand Positioning & Identity Development',
            'Target Audience Segmentation & Profiling',
            'Go-to-Market Strategy Formulation',
            'Content Strategy & Editorial Calendar Development',
        ],
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    },
    {
        id: 'campaign',
        title: 'Campaign Management',
        items: [
            'Multi-Channel Campaign Orchestration',
            'Automated Workflow Design & Implementation',
            'Performance Monitoring & Real-Time Analytics',
            'A/B Testing & Conversion Optimisation',
        ],
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
    },
    {
        id: 'lead',
        title: 'Lead Servicing',
        items: [
            'Prospect Research & Database Enrichment',
            'Lead Qualification & Scoring Methodology',
            'Outbound Engagement & Sequence Management',
            'CRM Administration & Data Hygiene',
        ],
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88"/><path d="m11.5 12.5-1-1a1 1 0 0 0-3 3l3.88 3.88"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>`,
    },
];

export const analyticsFeatures: AnalyticsFeature[] = [
    {
        title: 'Real-time Dashboards',
        description: 'Instant visibility into campaign performance and lead behavior.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    },
    {
        title: 'Automated Logic',
        description: 'Intelligent workflows that adapt based on data inputs.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    },
    {
        title: 'Predictive Analytics',
        description: 'Forecasting trends to stay ahead of the curve.',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    },
];
