'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LineIcon.module.css';
import { ICONS } from './icon-paths';

/* ============================================
   LineIcon — drawn-line glyphs, 1:1 per heading.
   Strokes draw on (dashoffset) when scrolled into
   view; hovering the host card plays each icon's
   meaning-matched micro-motion.
   ============================================ */

export default function LineIcon({ name, className }: { name: string; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [drawn, setDrawn] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setDrawn(true);
                    io.disconnect();
                }
            },
            { threshold: 0.35 }
        );
        io.observe(el);

        // Micro-motion triggers from the surrounding card, not just the glyph
        const host = el.closest('[data-reveal-item], [data-icon-host]') ?? el;
        const enter = () => setHovered(true);
        const leave = () => setHovered(false);
        host.addEventListener('mouseenter', enter);
        host.addEventListener('mouseleave', leave);
        return () => {
            io.disconnect();
            host.removeEventListener('mouseenter', enter);
            host.removeEventListener('mouseleave', leave);
        };
    }, []);

    const icon = ICONS[name];
    if (!icon) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`LineIcon: no glyph mapped for heading "${name}"`);
        }
        return null;
    }

    return (
        <span
            ref={ref}
            className={`${styles.root} ${drawn ? styles.drawn : ''} ${hovered ? styles.hovered : ''} ${className ?? ''}`}
            data-icon={name}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: icon }}
            />
        </span>
    );
}
