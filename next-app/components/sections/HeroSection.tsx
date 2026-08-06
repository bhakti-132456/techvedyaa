import styles from './Hero.module.css';
import HeroParticleField from '@/components/3d/HeroParticleFieldWrapper';

export default function HeroSection() {
    return (
        <section className={styles.hero} id="home">
            {/* Cursor-reactive particle flow field behind the statement type */}
            <HeroParticleField />
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div className={styles.heroGrid}>
                    <div className={styles.heroText} data-hero-exit>
                        <p className={styles.heroSubtitle} data-hero="eyebrow">
                            <span className={styles.pulseDot} aria-hidden="true" />
                            Digital Solutions Provider
                        </p>
                        <h1 className={styles.heroTitle} data-hero="title">
                            Transform <span className={`${styles.kw} ${styles.kwOrange}`}>Business</span> with <br />
                            <span className={`gradient-text ${styles.kw}`}>Intelligent Solutions</span>
                        </h1>
                        <p className={styles.heroDescription} data-hero="desc">
                            Comprehensive marketing automation, AI-powered technology, and strategic
                            consulting designed to elevate your brand and drive growth.
                        </p>
                    </div>

                    <div className={styles.heroCtaGroup} data-hero="ctas">
                        <a href="#services" className={`${styles.btn} ${styles.btnPrimary}`}>
                            <span>Our Services</span>
                            <span className={styles.btnArrow} aria-hidden="true">&rarr;</span>
                        </a>
                        <a href="#contact" className={`${styles.btn} ${styles.btnSecondary}`}>
                            <span>Get in Touch</span>
                            <span className={styles.btnArrow} aria-hidden="true">&rarr;</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Scroll cue */}
            <div className={styles.scrollCue} aria-hidden="true" data-hero="cue"><span /></div>

            {/* Subtle background gradient shapes */}
            <div className={`${styles.parallaxLayer} ${styles.parallaxLayer1}`} data-parallax-depth="0.1" />
            <div className={`${styles.parallaxLayer} ${styles.parallaxLayer2}`} data-parallax-depth="0.2" />
        </section>
    );
}
