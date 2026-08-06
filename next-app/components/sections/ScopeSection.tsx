'use client';

import { useState } from 'react';
import styles from './Scope.module.css';
import LineIcon from '@/components/icons/LineIcon';

export default function ScopeSection() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedCards, setExpandedCards] = useState<boolean[]>([]);

    const scopes = [
        {
            title: "Strategic Planning",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>`,
            details: [
                "Market Intelligence & Competitive Landscape Analysis",
                "Brand Positioning & Identity Development",
                "Target Audience Segmentation & Profiling",
                "Go-to-Market Strategy Formulation",
                "Content Strategy & Editorial Calendar Development"
            ]
        },
        {
            title: "Campaign Management",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>`,
            details: [
                "Multi-Channel Campaign Orchestration",
                "Automated Workflow Design & Implementation",
                "Performance Monitoring & Real-Time Analytics",
                "A/B Testing & Conversion Optimisation"
            ]
        },
        {
            title: "Lead Servicing",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88" /><path d="m11.5 12.5-1-1a1 1 0 0 0-3 3l3.88 3.88" /><path d="M2 12h4" /><path d="M18 12h4" /></svg>`,
            details: [
                "Prospect Research & Database Enrichment",
                "Lead Qualification & Scoring Methodology",
                "Outbound Engagement & Sequence Management",
                "CRM Administration & Data Hygiene"
            ]
        }
    ];

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleCardExpand = (index: number) => {
        const newExpandedCards = [...expandedCards];
        newExpandedCards[index] = !newExpandedCards[index];
        setExpandedCards(newExpandedCards);
    };

    return (
        <section className={styles.scope} id="scope" data-flow>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }} data-flow-header>
                    <p style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, margin: '0 0 1rem 0' }} data-reveal="fade">Our Solution</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} data-reveal="lines">Scope of <span className="gradient-text">Work</span></h2>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '1rem auto var(--spacing-md)', fontSize: 'var(--text-lg)' }} data-reveal="fade">
                        Strategic Planning, Campaign Management, and Lead Servicing - all powered by realtime data and analytics.
                    </p>
                    <button 
                        className={styles.globalExpandBtn} 
                        onClick={toggleExpand}
                    >
                        {isExpanded ? 'Collapse Details' : 'Expand All Details'}
                    </button>
                </div>

                <div className={styles.grid} data-reveal-group>
                    {scopes.map((scope, index) => {
                        const iconType = scope.title.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <div key={index} className={styles.card} data-reveal-item>
                                <div className={styles.iconWrapper}>
                                    <LineIcon name={iconType} />
                                </div>
                            <h3 className={styles.cardTitle}>{scope.title}</h3>

                            <button 
                                className={styles.mobileExpandBtn} 
                                onClick={() => toggleCardExpand(index)}
                            >
                                {expandedCards[index] || isExpanded ? 'Hide Details' : 'Show Details'}
                            </button>

                            <div className={`${styles.detailsContainer} ${isExpanded || expandedCards[index] ? styles.expanded : ''}`}>
                                <ul className={styles.detailsList}>
                                    {scope.details.map((detail, i) => (
                                        <li key={i}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
