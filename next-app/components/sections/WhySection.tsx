import { whyItems } from '@/lib/data/why';
import LineIcon from '@/components/icons/LineIcon';
import styles from './Why.module.css';

export default function WhySection() {
    return (
        <section className={styles.why} id="why" data-flow>
            <div className="container">
                <div className={styles.header}>
                    <p className={styles.label} data-reveal="fade">Why Choose TechVedyaa</p>
                    <h2 className={styles.title} data-reveal="lines">
                        Built for <span className="gradient-text">Measurable Impact</span>
                    </h2>
                    <p className={styles.description} data-reveal="fade">
                        We empower companies to build high-performing teams, modernize operations, and
                        accelerate market growth.
                    </p>
                </div>

                <div className={styles.grid} data-reveal-group>
                    {whyItems.map((item) => (
                        <div key={item.id} className={styles.card} data-reveal-item>
                            <div className={styles.iconWrapper}>
                                <LineIcon name={item.id} variant="plate" />
                            </div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDescription}>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
