'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { services } from '@/lib/data/services';
import styles from './Services.module.css';

export default function ServicesGrid() {
    const targetRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"] // Pin from when section hits top to when section hits bottom
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    return (
        <section ref={targetRef} className={styles.servicesTrack} id="services" style={{ height: isMobile ? 'auto' : '300vh' }}>
            <div className={isMobile ? '' : styles.stickyContainer} style={isMobile ? {} : { position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionLabel}>What We Do</p>
                    <h2 className={styles.sectionTitle}>
                        Comprehensive <span className="gradient-text">Service Offerings</span>
                    </h2>
                    <p className={styles.sectionDescription}>
                        From marketing automation to AI-powered solutions, we provide end-to-end services that
                        transform your business.
                    </p>
                </div>

                <div className={styles.horizontalWrapperContainer} style={isMobile ? {} : { width: '100%', overflow: 'hidden' }}>
                    <motion.div 
                        className={styles.horizontalWrapper} 
                        style={{ x: isMobile ? 0 : x }}
                    >
                        {services.map((service, index) => (
                            <motion.div 
                                key={service.id} 
                                className={styles.serviceCard}
                                initial={isMobile ? { opacity: 0, y: 20 } : { opacity: 1 }}
                                whileInView={isMobile ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true, margin: "-50px" }}
                            >
                                <div
                                    className={styles.serviceIcon}
                                    dangerouslySetInnerHTML={{ __html: service.icon }}
                                />
                                <h3 className={styles.serviceTitle}>{service.title}</h3>
                                <p className={styles.serviceDescription}>{service.description}</p>
                                <ul className={styles.serviceFeatures}>
                                    {service.features.map((feature, i) => (
                                        <li key={i}>{feature}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
