import { industries } from '@/lib/data/industries';
import styles from './Industries.module.css';

export default function IndustriesSection() {
    const chunkSize = Math.ceil(industries.length / 3);
    const ind1 = industries.slice(0, chunkSize);
    const ind2 = industries.slice(chunkSize, chunkSize * 2);
    const ind3 = industries.slice(chunkSize * 2);

    return (
        <section className={styles.industries} data-flow>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <p style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }} data-reveal="fade">Industry Focus</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }} data-reveal="lines">Sectors <span className="gradient-text">We Serve</span></h2>
                </div>
            </div>

            {/* Desktop Ticker (1 line) */}
            <div className={`${styles.ticker} ${styles.desktopTicker}`} data-marquee data-marquee-speed="55">
                <div className={styles.tickerContent} aria-hidden="false">
                    {industries.map((industry, index) => (
                        <div key={index} className={styles.industryItem}>{industry}</div>
                    ))}
                </div>
                <div className={styles.tickerContent} aria-hidden="true">
                    {industries.map((industry, index) => (
                        <div key={`dup-${index}`} className={styles.industryItem}>{industry}</div>
                    ))}
                </div>
            </div>

            {/* Mobile Tickers (3 lines) */}
            <div className={styles.mobileTickers}>
                <div className={styles.ticker} style={{ padding: '0 0 var(--spacing-md) 0' }} data-marquee data-marquee-speed="45">
                    <div className={styles.tickerContent} style={{ animationDuration: '20s' }} aria-hidden="false">
                        {ind1.map((industry, index) => <div key={index} className={styles.industryItem}>{industry}</div>)}
                    </div>
                    <div className={styles.tickerContent} style={{ animationDuration: '20s' }} aria-hidden="true">
                        {ind1.map((industry, index) => <div key={`dup1-${index}`} className={styles.industryItem}>{industry}</div>)}
                    </div>
                </div>
                
                <div className={styles.ticker} style={{ padding: '0 0 var(--spacing-md) 0' }} data-marquee data-marquee-speed="52" data-marquee-reverse="true">
                    <div className={styles.tickerContent} style={{ animationDuration: '25s', animationDirection: 'reverse' }} aria-hidden="false">
                        {ind2.map((industry, index) => <div key={index} className={styles.industryItem}>{industry}</div>)}
                    </div>
                    <div className={styles.tickerContent} style={{ animationDuration: '25s', animationDirection: 'reverse' }} aria-hidden="true">
                        {ind2.map((industry, index) => <div key={`dup2-${index}`} className={styles.industryItem}>{industry}</div>)}
                    </div>
                </div>
                
                <div className={styles.ticker} style={{ padding: '0' }} data-marquee data-marquee-speed="48">
                    <div className={styles.tickerContent} style={{ animationDuration: '22s' }} aria-hidden="false">
                        {ind3.map((industry, index) => <div key={index} className={styles.industryItem}>{industry}</div>)}
                    </div>
                    <div className={styles.tickerContent} style={{ animationDuration: '22s' }} aria-hidden="true">
                        {ind3.map((industry, index) => <div key={`dup3-${index}`} className={styles.industryItem}>{industry}</div>)}
                    </div>
                </div>
            </div>
        </section>
    );
}
