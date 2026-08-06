/* ============================================
   TechVedyaa — Motion System
   One easing family (expo), three duration tiers.
   Every animation on the site draws from these.
   ============================================ */

export const EASE = {
    /** Reveals, entrances — fast start, long settle */
    out: 'expo.out',
    /** Big spatial moves, clip reveals, section handoffs */
    inOut: 'expo.inOut',
} as const;

export const DUR = {
    /** Micro feedback: cues, small fades */
    fast: 0.5,
    /** Standard reveals: paragraphs, buttons, nav */
    med: 0.9,
    /** Statement moves: headline lines, cards, counters */
    slow: 1.5,
} as const;
