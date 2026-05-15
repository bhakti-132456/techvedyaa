// ============================================
// TechVedyaa — Shared TypeScript Interfaces
// ============================================

export interface ServiceItem {
    id: string;
    title: string;
    description: string;
    features: string[];
    /** SVG markup for the service icon */
    icon: string;
}

export interface EngagementModel {
    title: string;
    description: string;
    /** SVG markup for the model icon */
    icon: string;
}

export interface MethodologyItem {
    title: string;
    description: string;
    /** SVG markup for the methodology icon */
    icon: string;
}

export interface ProcessStep {
    number: number;
    title: string;
    description: string;
}

export interface ScopePillar {
    id: string;
    title: string;
    items: string[];
    /** SVG markup for the pillar icon */
    icon: string;
}

export interface AnalyticsFeature {
    title: string;
    description: string;
    /** SVG markup for the feature icon */
    icon: string;
}

export interface StatItem {
    value: string;
    label: string;
}

export interface NavLink {
    label: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: NavLink[];
}

export interface ServiceOption {
    value: string;
    label: string;
}
