import { industries } from '@/lib/data/industries';
import styles from './Industries.module.css';

export default function IndustriesSection() {
    const chunkSize = Math.ceil(industries.length / 3);
    const rows = [
        { items: industries.slice(0, chunkSize), speed: '58', reverse: false },
        { items: industries.slice(chunkSize, chunkSize * 2), speed: '66', reverse: true },
        { items: industries.slice(chunkSize * 2), speed: '62', reverse: false },
    ];

    return (
        <section className={styles.industries} data-flow>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }} data-reveal="fade">Industry Focus</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }} data-reveal="lines">Sectors <span className="gradient-text">We Serve</span></h2>
                </div>
            </div>

            {/* Three rows at every size, the middle one running against the
                others so the block reads as a field of type rather than a line */}
            <div className={styles.rows}>
                {rows.map((row, i) => (
                    <div
                        key={i}
                        className={styles.ticker}
                        data-marquee
                        data-marquee-speed={row.speed}
                        {...(row.reverse ? { 'data-marquee-reverse': 'true' } : {})}
                    >
                        <div className={styles.tickerContent}>
                            {row.items.map((industry, index) => (
                                <div key={index} className={styles.industryItem}>{industry}</div>
                            ))}
                        </div>
                        <div className={styles.tickerContent} aria-hidden="true">
                            {row.items.map((industry, index) => (
                                <div key={`dup-${index}`} className={styles.industryItem}>{industry}</div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
