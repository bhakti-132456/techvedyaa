import styles from './About.module.css';

export default function AboutSection() {
    return (
        <section className={styles.about} id="about" data-flow>
            <div className="container">
                <p className={styles.eyebrow} data-reveal="fade">About TechVedyaa</p>

                <h2 className={styles.statement} data-reveal="lines">
                    TechVedyaa India Pvt Ltd is a{' '}
                    <span className="gradient-text">strategic growth and transformation partner</span>{' '}
                    for modern businesses, with deep domain expertise in the manufacturing sector.
                </h2>

                <div className={styles.columns}>
                    <p data-reveal="fade">
                        We believe that long-term business success lies at the intersection of talent,
                        technology, and strategic market positioning. We are a dynamic management
                        consulting and services firm dedicated to helping organizations, particularly
                        in the industrial and manufacturing sectors, navigate modern operational and
                        commercial challenges.
                    </p>
                    <p data-reveal="fade">
                        From sourcing specialized engineering and leadership talent to driving full-scale
                        digital transformation on the factory floor and executing growth-focused marketing
                        strategies, TechVedyaa provides the capability, guidance, and tools needed to
                        scale efficiently in today&apos;s competitive landscape.
                    </p>
                </div>
            </div>
        </section>
    );
}
