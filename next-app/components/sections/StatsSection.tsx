import { stats } from '@/lib/data/stats';
import styles from './Stats.module.css';

export default function StatsSection() {
    return (
        <section className={styles.statsSection}>
            <div className="container">
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statItem} role="listitem">
                            <h3 className={styles.statValue}>{stat.value}</h3>
                            <p className={styles.statLabel}>{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
