'use client';

import { useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function LocomotionEngine() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useGSAP(
        () => {
            if (typeof window === 'undefined') return;

            // 1. HERO PARALLAX
            const parallaxElements = document.querySelectorAll<HTMLElement>('[data-parallax-depth]');
            parallaxElements.forEach((el) => {
                const depth = parseFloat(el.dataset.parallaxDepth || '0');
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

            // 2. SERVICES HORIZONTAL SCROLL
            if (!isMobile) {
                const track = document.querySelector<HTMLElement>('[data-horizontal-track]');
                const servicesSection = document.getElementById('services');

                if (track && servicesSection) {
                    const cards = track.children;
                    const getScrollAmount = () => track.scrollWidth - window.innerWidth;

                    gsap.to(track, {
                        x: () => -getScrollAmount(),
                        ease: 'none',
                        scrollTrigger: {
                            trigger: servicesSection,
                            start: 'top top',
                            end: () => `+=${getScrollAmount()}`,
                            scrub: 1,
                            pin: true,
                            anticipatePin: 1,
                            invalidateOnRefresh: true,
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

                    Array.from(cards).forEach((card) => {
                        const el = card as HTMLElement;
                        el.style.opacity = '0.3';
                        el.style.transform = 'translateY(20px)';
                        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    });
                }
            }
        },
        { dependencies: [isMobile], revertOnUpdate: true }
    );

    return null;
}
