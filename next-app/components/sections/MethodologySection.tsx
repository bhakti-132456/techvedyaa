import { methodologyItems } from '@/lib/data/methodology';
import styles from './Methodology.module.css';
import Micro3DIcon from '@/components/3d/Micro3DIconWrapper';

export default function MethodologySection() {
    return (
        <section className={styles.methodology} id="methodology">
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                    <p className="section-label" style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }}>Our Approach</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>The <span className="gradient-text">Methodology</span></h2>
                    <p style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '1rem auto 0' }}>
                        We combine strategic thinking with technical excellence to deliver measurable results for our clients.
                    </p>
                </div>

                <div className={styles.grid}>
                    {methodologyItems.map((item, index) => {
                        const iconType = item.title.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <div key={index} className={styles.card}>
                                <div className={styles.iconWrapper}>
                                    <Micro3DIcon type={iconType} />
                                </div>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardDescription}>{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
