import styles from './About.module.css';

export default function AboutSection() {
    return (
        <section className={styles.about} id="about" data-flow>
            <div className="container">
                <p className={styles.eyebrow} data-reveal="fade">About TechVedyaa</p>

                <h2 className={styles.statement} data-reveal="lines">
                    TechVedyaa India Pvt Ltd is a{' '}
                    <span className="gradient-text">digital solutions and business intelligence partner</span>{' '}
                    for modern businesses.
                </h2>

                <div className={styles.columns}>
                    <p data-reveal="fade">
                        We believe long-term business success lies at the intersection of technology,
                        data, and market positioning. We build the systems that run a company&apos;s
                        growth: automated marketing operations, custom software, and the analytics
                        layer that tells you which of it is actually working.
                    </p>
                    <p data-reveal="fade">
                        Alongside that core practice, we run a dedicated recruitment desk for the
                        manufacturing sector, placing specialized engineering and leadership talent.
                        Across both, TechVedyaa provides the capability, guidance, and tools needed to
                        scale efficiently in today&apos;s competitive landscape.
                    </p>
                </div>
            </div>
        </section>
    );
}
