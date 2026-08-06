export interface Pillar {
    id: string;
    title: string;
    description: string;
    features: string[];
}

export const pillars: Pillar[] = [
    {
        id: 'manufacturing-recruitment',
        title: 'Specialized HR Recruitment for Manufacturing',
        description:
            'Finding the right technical and leadership talent in the manufacturing sector requires deep industry knowledge. We streamline your talent acquisition process by sourcing, vetting, and placing high-caliber professionals across engineering, plant management, supply chain, R&D, and quality assurance.',
        features: [
            'Executive & Technical Search',
            'Operational & Workforce Staffing',
            'Industry-Specific Skill Alignment',
        ],
    },
    {
        id: 'manufacturing-digital-transformation',
        title: 'Manufacturing Digital Transformation',
        description:
            'We help manufacturing enterprises modernize legacy processes and transition into smart, data-driven operations. By integrating modern digital technologies into day-to-day manufacturing activities, we help boost operational efficiency, lower throughput costs, and enhance quality control.',
        features: [
            'Process Automation & Workflow Digitization',
            'Smart Factory & IIoT Readiness Advisory',
            'Tech Stack & Operations Integration',
        ],
    },
    {
        id: 'marketing-sales-strategy',
        title: 'Marketing & Sales Strategy Consulting',
        description:
            'Sustainable growth requires a clear go-to-market strategy. We partner with business leaders to align sales goals with actionable market strategies, helping companies enter new market segments, optimize revenue pipelines, and shorten sales cycles.',
        features: [
            'Market Expansion & Competitor Analysis',
            'Go-to-Market (GTM) Strategy & Sales Optimization',
            'Customer Acquisition Frameworks',
        ],
    },
    {
        id: 'digital-product-marketing',
        title: 'Digital & Product Marketing Services',
        description:
            'We bring products to life in front of the right buyers. Through focused product marketing and targeted digital marketing campaigns, we build brand authority, generate qualified B2B/B2C leads, and drive product adoption.',
        features: [
            'Product Positioning & Messaging Strategy',
            'Performance Digital Marketing (SEO, PPC, Social)',
            'B2B Content Marketing & Lead Generation Campaigns',
        ],
    },
];
