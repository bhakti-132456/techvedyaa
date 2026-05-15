import styles from './Hero.module.css';

export default function HeroSection() {
    return (
        <section className={styles.hero} id="home">
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div className={styles.heroContent}>
                    <p className={styles.heroSubtitle}>Digital Solutions Provider</p>
                    <h1 className={styles.heroTitle}>
                        Transform Business with <br />
                        <span className="gradient-text">Intelligent Solutions</span>
                    </h1>
                    <p className={styles.heroDescription}>
                        Comprehensive marketing automation, AI-powered technology, and strategic
                        consulting designed to elevate your brand and drive growth.
                    </p>
                    <div className={styles.heroCtaGroup}>
                        <a href="#services" className={`${styles.btn} ${styles.btnPrimary}`}>
                            Our Services
                        </a>
                        <a href="#contact" className={`${styles.btn} ${styles.btnSecondary}`}>
                            Get in Touch
                        </a>
                    </div>
                </div>
            </div>

            {/* Parallax layers for LocomotionEngine */}
            <div className={`${styles.parallaxLayer} ${styles.parallaxLayer1}`} data-parallax-depth="0.2" />
            <div className={`${styles.parallaxLayer} ${styles.parallaxLayer2}`} data-parallax-depth="0.5" />
            <div className={`${styles.parallaxLayer} ${styles.parallaxLayer3}`} data-parallax-depth="0.8" />
        </section>
    );
}
