'use client';

import { useRef } from 'react';
import { services } from '@/lib/data/services';
import styles from './Services.module.css';

export default function ServicesGrid() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = window.innerWidth * 0.85; // Roughly the width of a card on mobile
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={styles.servicesTrack} id="services">
            <div className={styles.sectionHeader}>
                <p className={styles.sectionLabel}>What We Do</p>
                <h2 className={styles.sectionTitle}>
                    Comprehensive <span className="gradient-text">Service Offerings</span>
                </h2>
                <p className={styles.sectionDescription}>
                    From marketing automation to AI-powered solutions, we provide end-to-end services that
                    transform your business.
                </p>
                
                <div className={styles.mobileControls}>
                    <div className={styles.mobileScrollHint}>
                        Swipe right to see more
                    </div>
                    <div className={styles.scrollButtons}>
                        <button onClick={() => scroll('left')} className={styles.scrollBtn} aria-label="Scroll left">&larr;</button>
                        <button onClick={() => scroll('right')} className={styles.scrollBtn} aria-label="Scroll right">&rarr;</button>
                    </div>
                </div>
            </div>

            {/* 
                Desktop: LocomotionEngine pins this section and translates .horizontalWrapper via GSAP.
                Mobile: Native CSS scroll-snap takes over (See Services.module.css). 
            */}
            <div className={styles.horizontalWrapper} data-horizontal-track ref={scrollContainerRef}>
                {services.map((service) => (
                    <div key={service.id} className={styles.serviceCard}>
                        <div
                            className={styles.serviceIcon}
                            dangerouslySetInnerHTML={{ __html: service.icon }}
                        />
                        <h3 className={styles.serviceTitle}>{service.title}</h3>
                        <p className={styles.serviceDescription}>{service.description}</p>
                        <ul className={styles.serviceFeatures}>
                            {service.features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
