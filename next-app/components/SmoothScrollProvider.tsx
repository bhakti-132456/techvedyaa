'use client';

import { ReactNode, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis } from '@/lib/lenis-store';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Reduced motion: keep native scrolling. ScrollTrigger still works
        // against the native scroll position.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            anchors: true,
            autoRaf: false,
        });

        setLenis(lenis);

        // One timeline for the whole site: GSAP's ticker drives Lenis,
        // Lenis feeds every scroll update straight into ScrollTrigger.
        lenis.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(tick);
            lenis.destroy();
            setLenis(null);
        };
    }, []);

    return <>{children}</>;
}
