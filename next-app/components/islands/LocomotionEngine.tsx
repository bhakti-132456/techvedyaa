'use client';

import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * LocomotionEngine — Client Island
 *
 * Orchestrates GSAP ScrollTrigger-based locomotion for the page:
 * 1. Hero Z-axis parallax on [data-parallax-depth] elements
 * 2. Services horizontal scroll track (pin + translateX on desktop)
 * 3. Mobile: defers to native CSS Scroll Snap (no GSAP horizontal override)
 *
 * GPU-only rule: All tweens use transform + opacity exclusively.
 */
export default function LocomotionEngine() {
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile once on mount + on resize
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useGSAP(
        () => {
            // ============================
            // 1. HERO PARALLAX (Z-axis depth)
            // ============================
            const parallaxElements = document.querySelectorAll<HTMLElement>(
                '[data-parallax-depth]'
            );

            parallaxElements.forEach((el) => {
                const depth = parseFloat(el.dataset.parallaxDepth || '0');
                // Deeper elements move slower → parallax illusion
                gsap.to(el, {
                    y: () => depth * -200,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#home',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1.5,
                        invalidateOnRefresh: true,
                    },
                });

                // Subtle 3D scale for Z-depth illusion
                gsap.to(el, {
                    scale: 1 + depth * 0.1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '#home',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1,
                    },
                });
            });

            // ============================
            // 2. SERVICES HORIZONTAL SCROLL (Desktop only)
            // ============================
            if (!isMobile) {
                const track = document.querySelector<HTMLElement>(
                    '[data-horizontal-track]'
                );
                const servicesSection = document.getElementById('services');

                if (track && servicesSection) {
                    const cards = track.children;
                    // Total scroll distance = track width - viewport width
                    const getScrollAmount = () => track.scrollWidth - window.innerWidth;

                    gsap.to(track, {
                        x: () => -getScrollAmount(),
                        ease: 'none',
                        scrollTrigger: {
                            trigger: servicesSection,
                            start: 'top top',
                            // Pin for the duration of the horizontal content
                            end: () => `+=${getScrollAmount()}`,
                            scrub: 1,
                            pin: true,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
                            // Fade in cards as they enter view
                            onUpdate: (self) => {
                                const progress = self.progress;
                                const totalCards = cards.length;
                                for (let i = 0; i < totalCards; i++) {
                                    const card = cards[i] as HTMLElement;
                                    const cardProgress = (i / totalCards);
                                    if (progress >= cardProgress - 0.1) {
                                        card.style.opacity = '1';
                                        card.style.transform = 'translateY(0)';
                                    }
                                }
                            },
                        },
                    });

                    // Initial state for cards — they fade in as scroll progresses
                    Array.from(cards).forEach((card) => {
                        const el = card as HTMLElement;
                        el.style.opacity = '0.3';
                        el.style.transition = 'opacity 0.4s ease';
                    });
                }
            }

            // ============================
            // 3. GENERAL SCROLL REVEALS
            // ============================
            const revealElements = document.querySelectorAll('.reveal');
            revealElements.forEach((el, i) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 24 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });
        },
        {
            dependencies: [isMobile],
            revertOnUpdate: true,
        }
    );

    return null;
}
