import { industries } from '@/lib/data/industries';
import styles from './Industries.module.css';

export default function IndustriesSection() {
    // Double the industries for seamless loop
    const doubledIndustries = [...industries, ...industries];

    return (
        <section className={styles.industries}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }}>Industry Focus</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Sectors <span className="gradient-text">We Serve</span></h2>
                </div>
            </div>

            <div className={styles.ticker}>
                <div className={styles.tickerContent}>
                    {doubledIndustries.map((industry, index) => (
                        <div key={index} className={styles.industryItem}>
                            {industry}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
