import { methodologyItems } from '@/lib/data/methodology';
import styles from './Methodology.module.css';
import LineIcon from '@/components/icons/LineIcon';

export default function MethodologySection() {
    return (
        <section className={styles.methodology} id="methodology" data-flow>
            <div className="container">
                <div className="section-head" data-flow-header>
                    <p className="section-eyebrow" data-reveal="fade">Our Approach</p>
                    <h2 className="section-title" data-reveal="lines">The <span className="gradient-text">Methodology</span></h2>
                    <p className="section-lead" data-reveal="fade">
                        We combine strategic thinking with technical excellence to deliver measurable results for our clients.
                    </p>
                </div>

                <div className={styles.grid} data-reveal-group>
                    {methodologyItems.map((item, index) => {
                        const iconType = item.title.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <div key={index} className={styles.card} data-reveal-item>
                                {/* Numerals echo the pillars and services sections,
                                    so the whole page counts in one voice. */}
                                <span className={styles.index} aria-hidden="true">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className={styles.iconWrapper}>
                                    <LineIcon name={iconType} />
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
