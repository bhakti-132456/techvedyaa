import { processSteps } from '@/lib/data/process';
import styles from './Process.module.css';

export default function ProcessSection() {
    return (
        <section className={styles.process} id="process">
            <div className="container">
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }}>Our Process</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>The Client <span className="gradient-text">Journey</span></h2>
                </div>

                <div className={styles.timeline}>
                    {processSteps.map((step) => (
                        <div key={step.number} className={styles.step}>
                            <div className={styles.dot} />
                            <div className={styles.stepContent}>
                                <span className={styles.stepNumber}>Step 0{step.number}</span>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDescription}>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
