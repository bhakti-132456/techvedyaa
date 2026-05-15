'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Hero.module.css';

export default function HeroSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const y3 = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
    
    const scale1 = useTransform(scrollYProgress, [0, 1], [1, 1.02]);
    const scale2 = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
    const scale3 = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

    return (
        <section ref={ref} className={styles.hero} id="home">
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

            {/* Parallax layers powered by framer-motion */}
            <motion.div 
                style={{ y: y1, scale: scale1 }}
                className={`${styles.parallaxLayer} ${styles.parallaxLayer1}`} 
            />
            <motion.div 
                style={{ y: y2, scale: scale2 }}
                className={`${styles.parallaxLayer} ${styles.parallaxLayer2}`} 
            />
            <motion.div 
                style={{ y: y3, scale: scale3 }}
                className={`${styles.parallaxLayer} ${styles.parallaxLayer3}`} 
            />
        </section>
    );
}
