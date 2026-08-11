'use client';

import { useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { getLenis } from '@/lib/lenis-store';
import { DUR, EASE } from '@/lib/motion';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Tracks elements whose entrance already played so responsive
   re-splits don't replay reveals on resize. */
const revealed = new WeakSet<Element>();

export default function LocomotionEngine() {
    /* Recompute trigger positions once late layout settles. Web fonts and the
       glTF models land after first paint and change element heights, which
       otherwise leaves every scroll-linked start/end measured against a
       half-laid-out page — most visible on mobile. */
    useEffect(() => {
        const refresh = () => ScrollTrigger.refresh();
        let raf = 0;
        const settle = () => {
            raf = requestAnimationFrame(refresh);
        };

        document.fonts?.ready.then(settle).catch(() => {});
        window.addEventListener('load', settle);
        const late = setTimeout(refresh, 1500);

        return () => {
            window.removeEventListener('load', settle);
            clearTimeout(late);
            cancelAnimationFrame(raf);
        };
    }, []);

    useGSAP(() => {
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

                // Reduced motion: <html> never receives the .anim gate, so all
                // content is already visible and static. Nothing to choreograph.
                if (reduce) return;

                const splits: SplitText[] = [];
                const cleanups: Array<() => void> = [];
                const stagger = isDesktop ? 0.1 : 0.13;

                /* Splits a headline into masked lines that rise out of overflow.
                   Used by both the hero load sequence and scroll reveals. */
                const lineReveal = (
                    el: Element,
                    opts: { delay?: number; scroll?: boolean } = {}
                ) => {
                    const split = SplitText.create(el, {
                        type: 'lines',
                        mask: 'lines',
                        autoSplit: true,
                        onSplit(self) {
                            gsap.set(el, { opacity: 1 });
                            if (revealed.has(el)) {
                                return gsap.set(self.lines, { yPercent: 0 });
                            }
                            return gsap.from(self.lines, {
                                yPercent: 110,
                                duration: DUR.slow,
                                ease: EASE.out,
                                stagger: 0.09,
                                delay: opts.delay ?? 0,
                                onComplete: () => revealed.add(el),
                                ...(opts.scroll
                                    ? {
                                          scrollTrigger: {
                                              trigger: el,
                                              start: 'top 85%',
                                              once: true,
                                          },
                                      }
                                    : {}),
                            });
                        },
                    });
                    splits.push(split);
                };

                /* ============================================
                   1. HERO LOAD CHOREOGRAPHY
                   eyebrow → title lines → description → CTAs → nav
                   ============================================ */
                const eyebrow = document.querySelector('[data-hero="eyebrow"]');
                const heroTitle = document.querySelector('[data-hero="title"]');
                const desc = document.querySelector('[data-hero="desc"]');
                const ctas = document.querySelector('[data-hero="ctas"]');
                const cue = document.querySelector('[data-hero="cue"]');
                const nav = document.querySelector('[data-nav-reveal]');

                const heroTl = gsap.timeline({ defaults: { ease: EASE.out } });

                if (eyebrow) {
                    heroTl.fromTo(
                        eyebrow,
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: DUR.med },
                        0.1
                    );
                }
                if (heroTitle) lineReveal(heroTitle, { delay: 0.25 });
                if (desc) {
                    heroTl.fromTo(
                        desc,
                        { y: 28, opacity: 0 },
                        { y: 0, opacity: 1, duration: DUR.med },
                        0.75
                    );
                }
                if (ctas) {
                    const buttons = Array.from(ctas.children);
                    heroTl.set(buttons, { y: 24, opacity: 0 }, 0);
                    heroTl.set(ctas, { opacity: 1 }, 0);
                    heroTl.to(
                        buttons,
                        { y: 0, opacity: 1, duration: DUR.med, stagger: 0.08 },
                        0.95
                    );
                }
                if (nav) {
                    heroTl.fromTo(
                        nav,
                        { y: -18, opacity: 0 },
                        { y: 0, opacity: 1, duration: DUR.med },
                        1.2
                    );
                }
                if (cue) {
                    heroTl.fromTo(cue, { opacity: 0 }, { opacity: 1, duration: DUR.fast }, 1.5);
                    // Fade the cue away as soon as scrolling starts.
                    gsap.to(cue, {
                        opacity: 0,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: '#home',
                            start: 'top top',
                            end: '15% top',
                            scrub: true,
                        },
                    });
                }

                /* ============================================
                   2. SCROLL REVEAL SYSTEM (data attributes)
                   ============================================ */

                // Headlines: masked line rise
                document
                    .querySelectorAll('[data-reveal="lines"]')
                    .forEach((el) => lineReveal(el, { scroll: true }));

                // Paragraphs / labels: fade + rise
                gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
                    gsap.fromTo(
                        el,
                        { y: 36, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: DUR.med,
                            ease: EASE.out,
                            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                        }
                    );
                });

                // Single cards: clip-path reveal from the top edge down
                gsap.utils.toArray<HTMLElement>('[data-reveal="card"]').forEach((el) => {
                    gsap.fromTo(
                        el,
                        { clipPath: 'inset(0% 0% 100% 0%)', y: 44, opacity: 1 },
                        {
                            clipPath: 'inset(0% 0% 0% 0%)',
                            y: 0,
                            duration: DUR.slow,
                            ease: EASE.inOut,
                            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                        }
                    );
                });

                // Card groups: same clip reveal, staggered across children
                gsap.utils
                    .toArray<HTMLElement>('[data-reveal-group]')
                    .forEach((group) => {
                        const items = group.querySelectorAll<HTMLElement>('[data-reveal-item]');
                        if (!items.length) return;
                        gsap.fromTo(
                            items,
                            { clipPath: 'inset(0% 0% 100% 0%)', y: 44, opacity: 1 },
                            {
                                clipPath: 'inset(0% 0% 0% 0%)',
                                y: 0,
                                duration: DUR.slow,
                                ease: EASE.inOut,
                                stagger,
                                scrollTrigger: { trigger: group, start: 'top 82%', once: true },
                            }
                        );
                    });

                // Stat numbers: count up on entry (numeric tokens only — '∞' stays)
                gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
                    const original = el.textContent ?? '';
                    if (!/\d/.test(original)) return;
                    const parts = original.split(/(\d+)/);
                    const state = { p: 0 };
                    gsap.to(state, {
                        p: 1,
                        duration: DUR.slow,
                        ease: EASE.out,
                        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                        onUpdate() {
                            el.textContent = parts
                                .map((s) =>
                                    /^\d+$/.test(s) ? String(Math.round(+s * state.p)) : s
                                )
                                .join('');
                        },
                        onComplete() {
                            el.textContent = original;
                        },
                    });
                });

                /* ============================================
                   2.5 SECTION FLOW — depth handoffs
                   Sections hand off into each other: incoming
                   content parallax-lags into place while the
                   outgoing section sinks back and dims.
                   ============================================ */

                // Hero exit: the statement type recedes into depth as you
                // scroll away. Deliberately scoped to the text block only —
                // the CTAs must stay fully legible and clickable the whole
                // way out, so they are never faded.
                const heroExit = document.querySelector<HTMLElement>('[data-hero-exit]');
                if (heroExit) {
                    gsap.to(heroExit, {
                        yPercent: 16,
                        scale: 0.97,
                        opacity: 0,
                        transformOrigin: 'center top',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: '#home',
                            start: 'top top',
                            end: 'bottom 30%',
                            scrub: true,
                        },
                    });
                }

                gsap.utils.toArray<HTMLElement>('[data-flow]').forEach((section) => {
                    // Entry: inner content lags behind the scroll, catching up
                    // as the section settles — transform-only so it composes
                    // with the reveal system.
                    const inner = section.querySelector<HTMLElement>(':scope > .container');
                    if (inner) {
                        gsap.fromTo(
                            inner,
                            { y: isDesktop ? 90 : 44 },
                            {
                                y: 0,
                                ease: 'none',
                                scrollTrigger: {
                                    trigger: section,
                                    start: 'top bottom',
                                    end: 'top 45%',
                                    scrub: true,
                                },
                            }
                        );
                    }

                    // Exit: section sinks back very slightly under the next one.
                    // Scale only — never opacity: dimming a whole section reads
                    // as a translucent film over the copy.
                    gsap.to(section, {
                        scale: isDesktop ? 0.985 : 1,
                        transformOrigin: 'center bottom',
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'bottom 28%',
                            end: 'bottom 2%',
                            scrub: true,
                        },
                    });
                });

                // Headers hold briefly (scroll lag) while their content passes
                gsap.utils.toArray<HTMLElement>('[data-flow-header]').forEach((header) => {
                    gsap.fromTo(
                        header,
                        { y: 0 },
                        {
                            y: isDesktop ? 60 : 24,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: header,
                                start: 'top 30%',
                                end: 'top -40%',
                                scrub: true,
                            },
                        }
                    );
                });

                /* ============================================
                   3. VELOCITY-REACTIVE MARQUEES
                   GSAP takes over the CSS ticker animation and
                   scales its speed with live scroll velocity.
                   ============================================ */
                const marquees: Array<{ tween: gsap.core.Tween; base: { v: number } }> = [];

                document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((ticker) => {
                    if (!ticker.offsetParent) return; // hidden at this breakpoint
                    const strips = Array.from(ticker.children) as HTMLElement[];
                    if (!strips.length) return;
                    gsap.set(strips, { animation: 'none' });

                    const speed = parseFloat(ticker.dataset.marqueeSpeed || '25');
                    const reverse = ticker.hasAttribute('data-marquee-reverse');
                    const tween = reverse
                        ? gsap.fromTo(
                              strips,
                              { xPercent: -100 },
                              { xPercent: 0, duration: speed, ease: 'none', repeat: -1 }
                          )
                        : gsap.fromTo(
                              strips,
                              { xPercent: 0 },
                              { xPercent: -100, duration: speed, ease: 'none', repeat: -1 }
                          );

                    const base = { v: 1 };
                    marquees.push({ tween, base });

                    // Slow to a crawl on hover so the ghost type stays readable.
                    const over = () => gsap.to(base, { v: 0.15, duration: 0.9, ease: EASE.out });
                    const out = () => gsap.to(base, { v: 1, duration: 0.9, ease: EASE.out });
                    ticker.addEventListener('mouseenter', over);
                    ticker.addEventListener('mouseleave', out);
                    cleanups.push(() => {
                        ticker.removeEventListener('mouseenter', over);
                        ticker.removeEventListener('mouseleave', out);
                    });
                });

                if (marquees.length) {
                    let boost = 1;
                    const tick = () => {
                        const lenis = getLenis();
                        const v = lenis ? Math.abs(lenis.velocity) : 0;
                        // Gentle response only — a large boost turns the ghost
                        // type into a strobe when scrolling fast.
                        const target = 1 + Math.min(v * 0.015, 0.5);
                        boost += (target - boost) * 0.03;
                        marquees.forEach(({ tween, base }) => tween.timeScale(base.v * boost));
                    };
                    gsap.ticker.add(tick);
                    cleanups.push(() => gsap.ticker.remove(tick));
                }

                /* ============================================
                   4. HERO PARALLAX ACCENTS (desktop)
                   ============================================ */
                if (isDesktop) {
                    document
                        .querySelectorAll<HTMLElement>('[data-parallax-depth]')
                        .forEach((el) => {
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
                        });
                }

                return () => {
                    splits.forEach((s) => s.revert());
                    cleanups.forEach((fn) => fn());
                };
            }
        );

        return () => mm.revert();
    });

    return null;
}
