'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { services } from '@/lib/data/services';
import LineIcon from '@/components/icons/LineIcon';
import styles from './Services.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const ServiceSceneView = dynamic(
    () => import('@/components/3d/ServiceScenes').then((m) => ({ default: m.ServiceSceneView })),
    { ssr: false }
);
const SharedServicesCanvas = dynamic(
    () => import('@/components/3d/ServiceScenes').then((m) => ({ default: m.SharedServicesCanvas })),
    { ssr: false }
);

const TOTAL = services.length;
const pad = (n: number) => String(n).padStart(2, '0');

export default function ServicesGrid() {
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const railFillRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeRef = useRef(0);

    const setActive = (idx: number) => {
        if (idx !== activeRef.current) {
            activeRef.current = idx;
            setActiveIndex(idx);
            if (counterRef.current) counterRef.current.textContent = pad(idx + 1);
        }
    };

    /* Desktop: pin + horizontal scrub + snap. Mobile: native scroll-snap. */
    useGSAP(
        () => {
            const section = sectionRef.current;
            const track = trackRef.current;
            if (!section || !track) return;

            const mm = gsap.matchMedia();

            mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
                const getDistance = () => track.scrollWidth - window.innerWidth;

                gsap.to(track, {
                    x: () => -getDistance(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: () => `+=${getDistance()}`,
                        scrub: 1,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                        onUpdate: (self) => {
                            if (railFillRef.current) {
                                railFillRef.current.style.transform = `scaleX(${self.progress})`;
                            }
                            setActive(Math.round(self.progress * (TOTAL - 1)));
                        },
                    },
                });
            });

            return () => mm.revert();
        },
        { scope: sectionRef }
    );

    /* Mobile active panel via IntersectionObserver on the snap container. */
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const mq = window.matchMedia('(max-width: 768px)');
        if (!mq.matches) return;

        const panels = Array.from(track.children) as HTMLElement[];
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(panels.indexOf(entry.target as HTMLElement));
                    }
                });
            },
            { root: track, threshold: 0.55 }
        );
        panels.forEach((p) => io.observe(p));
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (trackRef.current) {
            const amount = window.innerWidth * 0.9;
            trackRef.current.scrollBy({
                left: direction === 'left' ? -amount : amount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className={styles.services} id="services" ref={sectionRef}>
            <SharedServicesCanvas />

            <div className={styles.header}>
                <p className={styles.sectionLabel} data-reveal="fade">What We Do</p>
                <h2 className={styles.sectionTitle} data-reveal="lines">
                    Comprehensive <span className="gradient-text">Service Offerings</span>
                </h2>
                <p className={styles.sectionDescription} data-reveal="fade">
                    From marketing automation to AI-powered solutions, we provide end-to-end services that
                    transform your business.
                </p>

                <div className={styles.mobileControls}>
                    <div className={styles.mobileScrollHint}>
                        Swipe right to see more
                    </div>
                    <div className={styles.scrollButtons}>
                        <button onClick={() => scroll('left')} className={styles.scrollBtn} aria-label="Scroll left">&larr;</button>
                        <button onClick={() => scroll('right')} className={styles.scrollBtn} aria-label="Scroll right">&rarr;</button>
                    </div>
                </div>
            </div>

            <div className={styles.track} ref={trackRef}>
                {services.map((service, i) => (
                    <article
                        key={service.id}
                        className={styles.panel}
                        data-panel
                        data-active={i === activeIndex}
                    >
                        <div className={styles.panelInner}>
                            <div className={styles.panelVisual}>
                                <span className={styles.panelIndex} aria-hidden="true">
                                    {pad(i + 1)}
                                </span>
                                <ServiceSceneView
                                    id={service.id}
                                    active={i === activeIndex}
                                    className={styles.sceneView}
                                />
                            </div>

                            <div className={styles.panelCopy}>
                                <div className={styles.titleRow} data-icon-host>
                                    <LineIcon name={service.id} className={styles.titleGlyph} />
                                    <h3 className={styles.panelTitle}>{service.title}</h3>
                                </div>
                                <p className={styles.panelDescription}>{service.description}</p>
                                <ul className={styles.panelFeatures}>
                                    {service.features.map((feature, fi) => (
                                        <li
                                            key={fi}
                                            className={styles.featureLine}
                                            style={{ ['--line-i' as string]: fi }}
                                        >
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Progress rail + counter (desktop) */}
            <div className={styles.progress} aria-hidden="true">
                <span className={styles.counter}>
                    <span ref={counterRef}>01</span>
                    <span className={styles.counterTotal}> / {pad(TOTAL)}</span>
                </span>
                <div className={styles.rail}>
                    <div className={styles.railFill} ref={railFillRef} />
                </div>
            </div>
        </section>
    );
}
