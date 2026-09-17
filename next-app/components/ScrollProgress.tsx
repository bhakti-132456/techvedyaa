'use client';

import { useScroll, useSpring, motion, useReducedMotion } from 'motion/react';
import styles from './ScrollProgress.module.css';

/* Reading position for a long page.

   This is the one job motion.dev does better here than GSAP. GSAP owns the
   scroll choreography (ScrollTrigger pins, scrubs, the reveal cascade) and
   should keep owning it — but a progress rail wants a spring that is
   velocity-aware and interruptible, which is exactly what useSpring gives for
   free and what a tween has to fake.

   Deliberately quiet: a hairline at the very top edge, accent-coloured, no
   label. Eleven sections is a long scroll and the page offers no other cue
   about how much is left. */
export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const reduced = useReducedMotion();

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 28,
        restDelta: 0.001,
    });

    // Under reduced motion, track scroll directly — no spring overshoot.
    const progress = reduced ? scrollYProgress : scaleX;

    return (
        <motion.div
            className={styles.rail}
            style={{ scaleX: progress }}
            aria-hidden="true"
        />
    );
}
