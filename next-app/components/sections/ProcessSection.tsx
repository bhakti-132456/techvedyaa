'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { processSteps } from '@/lib/data/process';
import styles from './Process.module.css';

export default function ProcessSection() {
    const timelineRef = useRef<HTMLDivElement>(null);
    
    // Track scroll progress within the timeline container
    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ["start center", "end center"]
    });

    // Add a spring for smoother animation
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section className={styles.process} id="process">
            <div className="container">
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '1rem' }}>Our Process</p>
                    <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>The Client <span className="gradient-text">Journey</span></h2>
                </div>

                <div className={styles.timeline} ref={timelineRef}>
                    {/* The animated progress bar */}
                    <motion.div 
                        className={styles.progressBar}
                        style={{ scaleY }}
                    />

                    {processSteps.map((step, index) => (
                        <StepItem key={step.number} step={step} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Separate component for each step to track its own visibility
function StepItem({ step, index }: { step: any, index: number }) {
    const stepRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: stepRef,
        offset: ["start center", "end center"]
    });

    return (
        <div className={styles.step} ref={stepRef}>
            <div className={styles.dotContainer}>
                <div className={styles.dot} />
                <motion.div 
                    className={styles.dotActive}
                    style={{
                        opacity: useTransform(scrollYProgress, [0, 0.5], [0, 1]),
                        scale: useTransform(scrollYProgress, [0, 0.5], [0, 1])
                    }}
                >
                    <img src="/assets/favicon.png" alt="Checkmark" className={styles.checkmark} />
                </motion.div>
            </div>
            
            <div className={styles.stepContent}>
                <span className={styles.stepNumber}>Step 0{step.number}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
            </div>
        </div>
    );
}
