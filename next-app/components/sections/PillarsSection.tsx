'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { pillars } from '@/lib/data/pillars';
import LineIcon from '@/components/icons/LineIcon';
import styles from './Pillars.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const ModelView = dynamic(
    () => import('@/components/3d/ServiceScenes').then((m) => ({ default: m.ModelView })),
    { ssr: false }
);

export default function PillarsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [activeCard, setActiveCard] = useState(0);

    /* Which card is currently on top of the deck. Drives the per-model
       "active" state, so the computer's lid opens as its card arrives. */
    useEffect(() => {
        const cards = Array.from(
            sectionRef.current?.querySelectorAll<HTMLElement>('[data-pillar-card]') ?? []
        );
        if (!cards.length) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveCard(cards.indexOf(entry.target as HTMLElement));
                });
            },
            { rootMargin: '-30% 0px -45% 0px', threshold: 0 }
        );
        cards.forEach((c) => io.observe(c));
        return () => io.disconnect();
    }, []);

    /* Cascading curtain: cards stick (CSS) while the next sweeps up over them.
       Here the covered card falls back into depth and dims hard, which is what
       gives the sweep its drama. The active card is never transformed, so its
       content stays fully legible. */
    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const cards = gsap.utils.toArray<HTMLElement>('[data-pillar-card]');
                cards.forEach((card, i) => {
                    const next = cards[i + 1];
                    if (!next) return; // top of the deck keeps its full presence
                    gsap.fromTo(
                        card,
                        { scale: 1, opacity: 1, yPercent: 0 },
                        {
                            scale: 0.88,
                            opacity: 0.25,
                            yPercent: -4,
                            transformOrigin: 'center top',
                            ease: 'none',
                            scrollTrigger: {
                                trigger: next,
                                // only starts receding once the next card is
                                // genuinely on its way up
                                start: 'top 92%',
                                end: 'top top',
                                scrub: true,
                            },
                        }
                    );
                });
            });

            return () => mm.revert();
        },
        { scope: sectionRef }
    );

    return (
        <section className={styles.pillars} id="pillars" data-flow ref={sectionRef}>
            <div className="container">
                <div className={styles.header} data-flow-header>
                    <p className={styles.label} data-reveal="fade">Core Pillars</p>
                    <h2 className={styles.title} data-reveal="lines">
                        Talent, Technology & <span className="gradient-text">Market Growth</span>
                    </h2>
                    <p className={styles.description} data-reveal="fade">
                        We bridge the gap between human talent, market expansion, and digital
                        innovation.
                    </p>
                </div>

                <div className={styles.list}>
                    {pillars.map((pillar, i) => (
                        <article
                            key={pillar.id}
                            className={styles.pillar}
                            data-pillar-card
                            style={{ ['--i' as string]: i }}
                        >
                            <div className={styles.content}>
                                <span className={styles.index} aria-hidden="true">
                                    0{i + 1}
                                </span>
                                <div className={styles.titleRow} data-icon-host>
                                    <LineIcon name={pillar.id} className={styles.glyph} />
                                    <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                                </div>
                                <p className={styles.pillarDescription}>{pillar.description}</p>
                                <ul className={styles.features}>
                                    {pillar.features.map((feature) => (
                                        <li key={feature}>{feature}</li>
                                    ))}
                                </ul>
                            </div>

                            <ModelView
                                id={pillar.id}
                                active={i === activeCard}
                                className={styles.visual}
                            />
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
