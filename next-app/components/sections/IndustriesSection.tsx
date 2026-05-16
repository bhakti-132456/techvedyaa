import { industries } from '@/lib/data/industries';
import styles from './Industries.module.css';

export default function IndustriesSection() {
    return (
        <section className={styles.industries}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }}>Industry Focus</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Sectors <span className="gradient-text">We Serve</span></h2>
                </div>
            </div>

            <div className={styles.ticker}>
                {/* Two identical strips side-by-side — when the first scrolls fully 
                    off-screen, the second has taken its exact position, creating 
                    a perfectly seamless infinite loop */}
                <div className={styles.tickerContent} aria-hidden="false">
                    {industries.map((industry, index) => (
                        <div key={index} className={styles.industryItem}>
                            {industry}
                        </div>
                    ))}
                </div>
                <div className={styles.tickerContent} aria-hidden="true">
                    {industries.map((industry, index) => (
                        <div key={`dup-${index}`} className={styles.industryItem}>
                            {industry}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
