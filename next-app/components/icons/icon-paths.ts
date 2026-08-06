/* ============================================
   Drawn-line icon map — one glyph per unique
   heading across Services, Core Pillars,
   Methodology, Engagement, Scope and Why.
   Zero collisions.

   Style: technical-schematic. Constructed from
   geometric primitives on the 24 grid — circles,
   squares, precise diagonals — to match the
   site's hairline rules and geometric display
   type. No decorative detail, 2–4 elements per
   glyph, a single orange accent element each.

   Conventions (inner SVG markup, 24×24 viewBox):
   - every stroked element carries pathLength="1"
     so the draw-on animation is uniform
   - class="accent"  → secondary (orange) stroke
   - data-fill       → filled dot (fades in after draw)
   - data-anim="…"   → hover micro-motion hook
   ============================================ */

export const ICONS: Record<string, string> = {
    /* ---------------- Services ---------------- */

    // automation: signal enters a process square, exits looped
    'marketing-automation': `
        <rect x="7" y="7" width="10" height="10" pathLength="1"/>
        <path d="M2 12h5" pathLength="1"/>
        <path class="accent" data-anim="nudge-r" d="M17 12h5" pathLength="1"/>
        <path class="accent" data-anim="nudge-r" d="M19 10l2 2-2 2" pathLength="1"/>
        <circle data-fill cx="12" cy="12" r="1.4"/>`,

    // communications: one source, three broadcast bars
    'marketing-communications': `
        <circle cx="5" cy="12" r="2.5" pathLength="1"/>
        <path d="M11 6.5v11" pathLength="1"/>
        <path d="M15.5 4.5v15" pathLength="1"/>
        <path class="accent" data-anim="grow" d="M20 8v8" pathLength="1"/>`,

    // strategy: crosshair on a plotted target
    strategy: `
        <circle cx="12" cy="12" r="7.5" pathLength="1"/>
        <path d="M12 1.5v5" pathLength="1"/>
        <path d="M12 17.5v5" pathLength="1"/>
        <path d="M1.5 12h5" pathLength="1"/>
        <path d="M17.5 12h5" pathLength="1"/>
        <circle class="accent" data-anim="pulse" cx="12" cy="12" r="3" pathLength="1"/>`,

    // tech: code brackets around an axis
    'tech-solutions': `
        <path data-anim="spread-l" d="M8 6l-5 6 5 6" pathLength="1"/>
        <path data-anim="spread-r" d="M16 6l5 6-5 6" pathLength="1"/>
        <path class="accent" data-anim="slash" d="M13.5 5l-3 14" pathLength="1"/>`,

    // AI: core with four orthogonal nodes
    'ai-solutions': `
        <rect x="8.5" y="8.5" width="7" height="7" pathLength="1"/>
        <path d="M12 3v5.5" pathLength="1"/>
        <path d="M12 15.5V21" pathLength="1"/>
        <path d="M3 12h5.5" pathLength="1"/>
        <path d="M15.5 12H21" pathLength="1"/>
        <circle class="accent" data-fill data-anim="pulse" cx="12" cy="3" r="1.5"/>
        <circle data-fill cx="12" cy="21" r="1.5"/>
        <circle data-fill cx="3" cy="12" r="1.5"/>
        <circle data-fill cx="21" cy="12" r="1.5"/>`,

    // social: hub with two linked satellites
    'social-media': `
        <circle cx="5.5" cy="17" r="2.5" pathLength="1"/>
        <circle cx="18.5" cy="17" r="2.5" pathLength="1"/>
        <circle class="accent" data-anim="float" cx="12" cy="5.5" r="2.5" pathLength="1"/>
        <path d="M10 7.2L7.5 15.3" pathLength="1"/>
        <path d="M14 7.2l2.5 8.1" pathLength="1"/>`,

    // PR: announcement — a mark amplified outward
    pr: `
        <path d="M4 9.5h4L15 5v14L8 14.5H4z" pathLength="1"/>
        <path class="accent" data-anim="wave" d="M19 9.5c1.2 1.4 1.2 3.6 0 5" pathLength="1"/>`,

    // LMS: stacked modules with a progress mark
    lms: `
        <path d="M2.5 8.5L12 4l9.5 4.5L12 13z" pathLength="1"/>
        <path d="M2.5 13.5L12 18l9.5-4.5" pathLength="1"/>
        <path class="accent" data-anim="nudge-up" d="M2.5 18.5L12 23l9.5-4.5" pathLength="1"/>`,

    /* ---------------- Core Pillars ---------------- */

    // recruitment: candidate selected from a column
    'manufacturing-recruitment': `
        <circle cx="6" cy="6" r="2.5" pathLength="1"/>
        <circle cx="6" cy="12" r="2.5" pathLength="1"/>
        <circle cx="6" cy="18" r="2.5" pathLength="1"/>
        <path class="accent" data-anim="nudge-r" d="M11 12h7" pathLength="1"/>
        <path class="accent" data-anim="pop" d="M15 8.5l3.5 3.5L15 15.5" pathLength="1"/>`,

    // digital transformation: plant profile rising to a signal
    'manufacturing-digital-transformation': `
        <path d="M2.5 20.5V11l5 3.5V11l5 3.5" pathLength="1"/>
        <path d="M2.5 20.5h19" pathLength="1"/>
        <path d="M17.5 20.5V7" pathLength="1"/>
        <path class="accent" data-anim="float" d="M14.5 6.5L17.5 3l3 3.5" pathLength="1"/>`,

    // GTM: trajectory across a plotted field
    'marketing-sales-strategy': `
        <path d="M3.5 20.5V3.5" pathLength="1"/>
        <path d="M3.5 20.5h17" pathLength="1"/>
        <path class="accent" data-anim="nudge-up" d="M6.5 16.5l4-4.5 3.5 2.5 5.5-7" pathLength="1"/>
        <circle class="accent" data-fill data-anim="nudge-up" cx="19.5" cy="7.5" r="1.6"/>`,

    // product marketing: launch vector out of a frame
    'digital-product-marketing': `
        <path d="M3.5 14.5v6h6" pathLength="1"/>
        <path d="M3.5 20.5L14 10" pathLength="1"/>
        <path class="accent" data-anim="nudge-up" d="M13.5 3.5h7v7" pathLength="1"/>
        <path class="accent" data-anim="nudge-up" d="M20.5 3.5L14 10" pathLength="1"/>`,

    /* ---------------- Methodology ---------------- */

    // alignment: three planes converging on one axis
    'strategic-alignment': `
        <path d="M12 2.5v19" pathLength="1"/>
        <path data-anim="nudge-r" d="M4 7.5h8" pathLength="1"/>
        <path data-anim="nudge-l" d="M12 12h8" pathLength="1"/>
        <path data-anim="nudge-r" d="M6 16.5h6" pathLength="1"/>
        <circle class="accent" data-fill data-anim="pulse" cx="12" cy="12" r="1.8"/>`,

    // data-driven: measured columns
    'data-driven-decisions': `
        <path d="M3.5 20.5h17" pathLength="1"/>
        <path data-anim="grow" d="M6.5 20.5v-5" pathLength="1"/>
        <path data-anim="grow2" d="M12 20.5v-10" pathLength="1"/>
        <path class="accent" data-anim="grow3" d="M17.5 20.5V5" pathLength="1"/>`,

    // integration: two systems sharing a channel
    'channel-integration': `
        <rect x="2.5" y="8" width="8" height="8" pathLength="1"/>
        <rect class="accent" x="13.5" y="8" width="8" height="8" pathLength="1"/>
        <path data-anim="dash-slide" d="M10.5 12h3" pathLength="1"/>`,

    // automation first: a bolt through the process
    'automation-first': `
        <circle cx="12" cy="12" r="9" pathLength="1"/>
        <path class="accent" data-anim="pop" d="M13 6l-4 6.5h3.5L11.5 18l4-6.5H12z" pathLength="1"/>`,

    // continuous optimization: closed improvement loop
    'continuous-optimization': `
        <path data-anim="spin" d="M20 12a8 8 0 1 1-3-6.2" pathLength="1"/>
        <path data-anim="spin" d="M20 4v4h-4" pathLength="1"/>
        <path class="accent" data-anim="pop" d="M8.5 12.5l2.5 2.5 4.5-5.5" pathLength="1"/>`,

    // scalable: expanding modular grid
    'scalable-solutions': `
        <rect x="3" y="13" width="8" height="8" pathLength="1"/>
        <rect data-anim="nudge-up" x="13" y="13" width="8" height="8" pathLength="1"/>
        <rect class="accent" data-anim="float" x="13" y="3" width="8" height="8" pathLength="1"/>`,

    /* ---------------- Engagement ---------------- */

    // project: bounded scope with a completion mark
    'project-based': `
        <rect x="3.5" y="3.5" width="17" height="17" pathLength="1"/>
        <path d="M3.5 8.5h17" pathLength="1"/>
        <path class="accent" data-anim="pop" d="M8 14.5l3 3 5.5-6" pathLength="1"/>`,

    // retainer: continuous cycle
    'retainer-based': `
        <circle cx="12" cy="12" r="8.5" pathLength="1"/>
        <path class="accent" data-anim="spin" d="M12 6.5V12l4 2.5" pathLength="1"/>`,

    // hybrid: two modes overlapping
    hybrid: `
        <rect data-anim="converge-r" x="3" y="7" width="10" height="10" pathLength="1"/>
        <circle class="accent" data-anim="converge-l" cx="16" cy="12" r="5" pathLength="1"/>`,

    /* ---------------- Why TechVedyaa ---------------- */

    // domain specialization: focused sector of a whole
    'domain-specialization': `
        <circle cx="12" cy="12" r="9" pathLength="1"/>
        <path class="accent" data-anim="pulse" d="M12 3a9 9 0 0 1 9 9h-9z" pathLength="1"/>
        <circle data-fill cx="12" cy="12" r="1.4"/>`,

    // integrated: three capabilities on one frame
    'integrated-capabilities': `
        <path d="M12 2.5L21.5 8v8L12 21.5 2.5 16V8z" pathLength="1"/>
        <circle data-anim="nudge-l" cx="8" cy="10.5" r="2" pathLength="1"/>
        <circle data-anim="nudge-r" cx="16" cy="10.5" r="2" pathLength="1"/>
        <circle class="accent" data-anim="float" cx="12" cy="16" r="2" pathLength="1"/>`,

    // results: measured outcome against a baseline
    'result-oriented-approach': `
        <path d="M3.5 20.5h17" pathLength="1"/>
        <path d="M3.5 15.5h17" pathLength="1"/>
        <path class="accent" data-anim="nudge-up" d="M6 15.5L11 8l4 4 4-8" pathLength="1"/>
        <circle class="accent" data-fill data-anim="nudge-up" cx="19" cy="4" r="1.6"/>`,

    /* ---------------- Scope ---------------- */

    // strategic planning: plotted route to a marker
    'strategic-planning': `
        <path d="M3.5 20.5h6a4 4 0 0 0 0-8h-3a4 4 0 0 1 0-8h5" pathLength="1"/>
        <circle data-fill cx="3.5" cy="20.5" r="1.5"/>
        <rect class="accent" data-anim="bob" x="15.5" y="2" width="6" height="6" pathLength="1"/>`,

    // campaign management: sequenced dispatch
    'campaign-management': `
        <path d="M3.5 4.5h17" pathLength="1"/>
        <path d="M3.5 12h11" pathLength="1"/>
        <path d="M3.5 19.5h6" pathLength="1"/>
        <path class="accent" data-anim="nudge-r" d="M15 16l4.5 3.5L15 23" pathLength="1"/>`,

    // lead servicing: pipeline narrowing to a qualified lead
    'lead-servicing': `
        <path d="M3 4.5h18l-7 8v6l-4 2.5v-8.5z" pathLength="1"/>
        <circle class="accent" data-fill data-anim="drop" cx="12" cy="21.5" r="1.6"/>`,
};
