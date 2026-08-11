'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { processSteps } from '@/lib/data/process';
import { EASE } from '@/lib/motion';
import styles from './Process.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/* Matches the r=26 circle in the node ring SVG */
const RING_CIRCUMFERENCE = 2 * Math.PI * 26;

export default function ProcessSection() {
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const section = sectionRef.current;
            if (!section) return;

            const mm = gsap.matchMedia();

            mm.add(
                {
                    isDesktop: '(min-width: 769px)',
                    isMobile: '(max-width: 768px)',
                    reduce: '(prefers-reduced-motion: reduce)',
                },
                (context) => {
                    const { isDesktop, reduce } = context.conditions as {
                        isDesktop: boolean;
                        isMobile: boolean;
                        reduce: boolean;
                    };

                    // Reduced motion: CSS renders everything settled and complete.
                    if (reduce) return;

                    // Progress rail fill — scrub-linked to the journey
                    const fill = section.querySelector<HTMLElement>('[data-rail-fill]');
                    const timelineEl = section.querySelector<HTMLElement>('[data-timeline]');
                    if (fill && timelineEl) {
                        gsap.fromTo(
                            fill,
                            { scaleY: 0 },
                            {
                                scaleY: 1,
                                ease: 'none',
                                scrollTrigger: {
                                    trigger: timelineEl,
                                    start: 'top 60%',
                                    end: 'bottom 55%',
                                    scrub: true,
                                    invalidateOnRefresh: true,
                                },
                            }
                        );
                    }

                    const steps = gsap.utils.toArray<HTMLElement>('[data-step]', section);
                    steps.forEach((step, i) => {
                        const card = step.querySelector<HTMLElement>('[data-step-card]');
                        const numeral = step.querySelector<HTMLElement>('[data-step-numeral]');
                        const check = step.querySelector<HTMLElement>('[data-step-check]');
                        const ring = step.querySelector<SVGCircleElement>('[data-ring]');
                        const dir = isDesktop ? (i % 2 === 0 ? -1 : 1) : 1;

                        // Sweep-in: real travel distance with depth (scale-up from behind)
                        if (card) {
                            gsap.fromTo(
                                card,
                                {
                                    x: dir * (isDesktop ? 180 : 64),
                                    y: isDesktop ? 150 : 90,
                                    scale: 0.82,
                                    opacity: 0,
                                },
                                {
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                    opacity: 1,
                                    duration: 1.3,
                                    ease: EASE.out,
                                    scrollTrigger: { trigger: step, start: 'top 78%', once: true },
                                }
                            );
                        }

                        // Oversized ghost numeral: deep scrubbed parallax, fading through
                        if (numeral) {
                            const drift = isDesktop ? 190 : 70;
                            const tl = gsap.timeline({
                                scrollTrigger: {
                                    trigger: step,
                                    start: 'top bottom',
                                    end: 'bottom top',
                                    scrub: true,
                                },
                            });
                            tl.fromTo(
                                numeral,
                                { y: drift },
                                { y: -drift, ease: 'none', duration: 1 },
                                0
                            )
                                .fromTo(
                                    numeral,
                                    { autoAlpha: 0 },
                                    { autoAlpha: 1, duration: 0.3, ease: 'none' },
                                    0
                                )
                                .to(numeral, { autoAlpha: 0, duration: 0.3, ease: 'none' }, 0.7);
                        }

                        // Branded checkmark: springy pop + ring draw-on when the step completes
                        if (check && ring) {
                            const pop = gsap.timeline({ paused: true });
                            pop.fromTo(
                                check,
                                { scale: 0, opacity: 0 },
                                { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2.4)' }
                            ).fromTo(
                                ring,
                                { strokeDashoffset: RING_CIRCUMFERENCE },
                                { strokeDashoffset: 0, duration: 0.7, ease: EASE.out },
                                0.05
                            );
                            ScrollTrigger.create({
                                trigger: step,
                                start: isDesktop ? 'center 55%' : 'top 65%',
                                invalidateOnRefresh: true,
                                onEnter: () => pop.play(),
                                onLeaveBack: () => pop.reverse(),
                            });
                        }
                    });
                }
            );

            return () => mm.revert();
        },
        { scope: sectionRef }
    );

    return (
        <section className={styles.process} id="process" ref={sectionRef}>
            <div className="container">
                <div className={styles.header}>
                    <p className={styles.headerLabel} data-reveal="fade">Our Process</p>
                    <h2 className={styles.headerTitle} data-reveal="lines">
                        The Client <span className="gradient-text">Journey</span>
                    </h2>
                </div>
            </div>

            <div className={styles.timeline} data-timeline>
                <div className={styles.rail} aria-hidden="true">
                    <div className={styles.railFill} data-rail-fill />
                </div>

                {processSteps.map((step, i) => (
                    <div
                        key={step.number}
                        className={`${styles.step} ${i % 2 === 1 ? styles.stepEven : ''}`}
                        data-step
                    >
                        <span className={styles.stepNumeral} aria-hidden="true" data-step-numeral>
                            0{step.number}
                        </span>

                        <div className={styles.node}>
                            <span className={styles.nodeDot} />
                            <svg
                                className={styles.nodeRing}
                                viewBox="0 0 56 56"
                                aria-hidden="true"
                            >
                                <circle data-ring cx="28" cy="28" r="26" />
                            </svg>
                            <span className={styles.nodeCheck} data-step-check>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/assets/favicon.png"
                                    alt="Checkmark"
                                    className={styles.checkmark}
                                />
                            </span>
                        </div>

                        <div className={styles.stepCard} data-step-card>
                            <span className={styles.stepNumber}>Step 0{step.number}</span>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDescription}>{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
