import { pillars } from '@/lib/data/pillars';
import LineIcon from '@/components/icons/LineIcon';
import styles from './Pillars.module.css';

export default function PillarsSection() {
    return (
        <section className={styles.pillars} id="pillars" data-flow>
            <div className="container">
                <div className={styles.header} data-flow-header>
                    <p className={styles.label} data-reveal="fade">Core Pillars</p>
                    <h2 className={styles.title} data-reveal="lines">
                        Talent, Technology & <span className="gradient-text">Market Growth</span>
                    </h2>
                    <p className={styles.description} data-reveal="fade">
                        We bridge the gap between human talent, market expansion, and digital
                        innovation.
                    </p>
                </div>

                <div className={styles.list}>
                    {pillars.map((pillar, i) => (
                        <article key={pillar.id} className={styles.pillar} data-reveal="fade">
                            <span className={styles.index} aria-hidden="true">
                                0{i + 1}
                            </span>

                            <div className={styles.content}>
                                <div className={styles.titleRow} data-icon-host>
                                    <LineIcon name={pillar.id} className={styles.glyph} />
                                    <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                                </div>
                                <p className={styles.pillarDescription}>{pillar.description}</p>
                                <ul className={styles.features}>
                                    {pillar.features.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
