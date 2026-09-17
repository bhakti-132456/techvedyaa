import { stats } from '@/lib/data/stats';
import styles from './Stats.module.css';

/* A description list, not headings. These numerals were <h3> with no <h2> above
   them, which broke the document outline and announced bare values ("8", "4")
   as section headings to a screen reader. <dt>/<dd> says what they actually
   are: a label and its value. DOM order is term-then-value as the spec
   requires; the CSS flips them visually so the numeral still reads first. */
export default function StatsSection() {
    return (
        <section className={styles.statsSection} data-flow>
            <div className="container">
                <dl className={styles.statsGrid} data-reveal-group>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statItem} data-reveal-item>
                            <dt className={styles.statLabel}>{stat.label}</dt>
                            <dd className={styles.statValue} data-count>
                                {stat.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
