import { stats } from '@/lib/data/stats';
import styles from './Stats.module.css';

export default function StatsSection() {
    return (
        <section className={styles.statsSection} data-flow>
            <div className="container">
                <div className={styles.statsGrid} data-reveal-group>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statItem} role="listitem" data-reveal-item>
                            <h3 className={styles.statValue} data-count>{stat.value}</h3>
                            <p className={styles.statLabel}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
