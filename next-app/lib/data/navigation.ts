import type { NavLink, FooterSection } from '@/lib/types';

export const mainNavLinks: NavLink[] = [
    { label: 'Services', href: '#services' },
    { label: 'Approach', href: '#approach' },
    { label: 'Industries', href: '#industries' },
    { label: 'Process', href: '#process' },
];

export const ctaLink: NavLink = {
    label: 'Get Started',
    href: '#contact',
};

export const footerSections: FooterSection[] = [
    {
        title: 'Services',
        links: [
            { label: 'Marketing Automation', href: '#services' },
            { label: 'Marketing Communications', href: '#services' },
            { label: 'Strategy & Brand', href: '#services' },
            { label: 'Tech Solutions', href: '#services' },
            { label: 'AI-Powered Solutions', href: '#services' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '#overview' },
            { label: 'Our Approach', href: '#approach' },
            { label: 'Industries', href: '#industries' },
            { label: 'Process', href: '#process' },
            { label: 'Contact', href: '#contact' },
        ],
    },
    {
        title: 'Connect',
        links: [
            { label: 'Get Started', href: '#contact' },
            { label: 'Request Consultation', href: '#contact' },
        ],
    },
];
