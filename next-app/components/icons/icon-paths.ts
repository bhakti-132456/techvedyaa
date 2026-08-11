/* ============================================
   Icon set — Tabler Icons (MIT), inlined.
   https://github.com/tabler/tabler-icons

   Inlined rather than imported so there is no runtime dependency and no
   peer-dependency risk, and so the draw-on animation can drive the shapes
   directly. Each element carries pathLength="1", which lets a single
   dashoffset rule animate any shape at a uniform rate. Stroke width, colour,
   caps and joins are inherited from the <svg> in LineIcon.
   ============================================ */

export const ICONS: Record<string, string> = {
    'marketing-automation': `
        <path d="M12 19h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v5" pathLength="1"/>
        <path d="M3 7l9 6l9 -6" pathLength="1"/>
        <path d="M17.001 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" pathLength="1"/>
        <path d="M19.001 15.5v1.5" pathLength="1"/>
        <path d="M19.001 21v1.5" pathLength="1"/>
        <path d="M22.032 17.25l-1.299 .75" pathLength="1"/>
        <path d="M17.27 20l-1.3 .75" pathLength="1"/>
        <path d="M15.97 17.25l1.3 .75" pathLength="1"/>
        <path d="M20.733 20l1.3 .75" pathLength="1"/>`,
    'marketing-communications': `
        <path d="M18 8a3 3 0 0 1 0 6" pathLength="1"/>
        <path d="M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5" pathLength="1"/>
        <path d="M12 8l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8" pathLength="1"/>`,
    'strategy': `
        <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" pathLength="1"/>
        <path d="M12 7a5 5 0 1 0 5 5" pathLength="1"/>
        <path d="M13 3.055a9 9 0 1 0 7.941 7.945" pathLength="1"/>
        <path d="M15 6v3h3l3 -3h-3v-3l-3 3" pathLength="1"/>
        <path d="M15 9l-3 3" pathLength="1"/>`,
    'tech-solutions': `
        <path d="M7 8l-4 4l4 4" pathLength="1"/>
        <path d="M17 8l4 4l-4 4" pathLength="1"/>
        <path d="M14 4l-4 16" pathLength="1"/>`,
    'ai-solutions': `
        <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8" pathLength="1"/>
        <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8" pathLength="1"/>
        <path d="M17.5 16a3.5 3.5 0 0 0 0 -7h-.5" pathLength="1"/>
        <path d="M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0" pathLength="1"/>
        <path d="M6.5 16a3.5 3.5 0 0 1 0 -7h.5" pathLength="1"/>
        <path d="M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10" pathLength="1"/>`,
    'social-media': `
        <path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" pathLength="1"/>
        <path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" pathLength="1"/>
        <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" pathLength="1"/>
        <path d="M8.7 10.7l6.6 -3.4" pathLength="1"/>
        <path d="M8.7 13.3l6.6 3.4" pathLength="1"/>`,
    'pr': `
        <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -4 0v-13a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1v12a3 3 0 0 0 3 3h11" pathLength="1"/>
        <path d="M8 8l4 0" pathLength="1"/>
        <path d="M8 12l4 0" pathLength="1"/>
        <path d="M8 16l4 0" pathLength="1"/>`,
    'lms': `
        <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" pathLength="1"/>
        <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" pathLength="1"/>`,
    'manufacturing-recruitment': `
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" pathLength="1"/>
        <path d="M6 21v-2a4 4 0 0 1 4 -4h1.5" pathLength="1"/>
        <path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" pathLength="1"/>
        <path d="M20.2 20.2l1.8 1.8" pathLength="1"/>`,
    'manufacturing-digital-transformation': `
        <path d="M3 21h18" pathLength="1"/>
        <path d="M5 21v-12l5 4v-4l5 4h4" pathLength="1"/>
        <path d="M19 21v-8l-1.436 -9.574a.5 .5 0 0 0 -.495 -.426h-1.145a.5 .5 0 0 0 -.494 .418l-1.43 8.582" pathLength="1"/>
        <path d="M9 17h1" pathLength="1"/>
        <path d="M14 17h1" pathLength="1"/>`,
    'marketing-sales-strategy': `
        <path d="M18 21v-14" pathLength="1"/>
        <path d="M9 15l3 -3l3 3" pathLength="1"/>
        <path d="M15 10l3 -3l3 3" pathLength="1"/>
        <path d="M3 21l18 0" pathLength="1"/>
        <path d="M12 21l0 -9" pathLength="1"/>
        <path d="M3 6l3 -3l3 3" pathLength="1"/>
        <path d="M6 21v-18" pathLength="1"/>`,
    'digital-product-marketing': `
        <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3" pathLength="1"/>
        <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3" pathLength="1"/>
        <path d="M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" pathLength="1"/>`,
    'strategic-alignment': `
        <path d="M11.5 12a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" pathLength="1"/>
        <path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" pathLength="1"/>
        <path d="M12 3l0 2" pathLength="1"/>
        <path d="M3 12l2 0" pathLength="1"/>
        <path d="M12 19l0 2" pathLength="1"/>
        <path d="M19 12l2 0" pathLength="1"/>`,
    'data-driven-decisions': `
        <path d="M3 3v18h18" pathLength="1"/>
        <path d="M20 18v3" pathLength="1"/>
        <path d="M16 16v5" pathLength="1"/>
        <path d="M12 13v8" pathLength="1"/>
        <path d="M8 16v5" pathLength="1"/>
        <path d="M3 11c6 0 5 -5 9 -5s3 5 9 5" pathLength="1"/>`,
    'channel-integration': `
        <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5" pathLength="1"/>
        <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5" pathLength="1"/>
        <path d="M3 21l2.5 -2.5" pathLength="1"/>
        <path d="M18.5 5.5l2.5 -2.5" pathLength="1"/>
        <path d="M10 11l-2 2" pathLength="1"/>
        <path d="M13 14l-2 2" pathLength="1"/>`,
    'automation-first': `
        <path d="M13 3l0 7l6 0l-8 11l0 -7l-6 0l8 -11" pathLength="1"/>`,
    'continuous-optimization': `
        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" pathLength="1"/>
        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" pathLength="1"/>`,
    'scalable-solutions': `
        <path d="M12 4l-8 4l8 4l8 -4l-8 -4" pathLength="1"/>
        <path d="M4 12l8 4l8 -4" pathLength="1"/>
        <path d="M4 16l8 4l8 -4" pathLength="1"/>`,
    'project-based': `
        <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" pathLength="1"/>
        <path d="M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" pathLength="1"/>
        <path d="M9 14l2 2l4 -4" pathLength="1"/>`,
    'retainer-based': `
        <path d="M9.828 9.172a4 4 0 1 0 0 5.656a10 10 0 0 0 2.172 -2.828a10 10 0 0 1 2.172 -2.828a4 4 0 1 1 0 5.656a10 10 0 0 1 -2.172 -2.828a10 10 0 0 0 -2.172 -2.828" pathLength="1"/>`,
    'hybrid': `
        <path d="M18 4l3 3l-3 3" pathLength="1"/>
        <path d="M18 20l3 -3l-3 -3" pathLength="1"/>
        <path d="M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5" pathLength="1"/>
        <path d="M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3" pathLength="1"/>`,
    'domain-specialization': `
        <path d="M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" pathLength="1"/>
        <path d="M13 17.5v4.5l2 -1.5l2 1.5v-4.5" pathLength="1"/>
        <path d="M10 19h-5a2 2 0 0 1 -2 -2v-10c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73" pathLength="1"/>
        <path d="M6 9l12 0" pathLength="1"/>
        <path d="M6 12l3 0" pathLength="1"/>
        <path d="M6 15l2 0" pathLength="1"/>`,
    'integrated-capabilities': `
        <path d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1" pathLength="1"/>`,
    'result-oriented-approach': `
        <path d="M3 17l6 -6l4 4l8 -8" pathLength="1"/>
        <path d="M14 7l7 0l0 7" pathLength="1"/>`,
    'strategic-planning': `
        <path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5" pathLength="1"/>
        <path d="M9 4v13" pathLength="1"/>
        <path d="M15 7v5.5" pathLength="1"/>
        <path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879" pathLength="1"/>
        <path d="M19 18v.01" pathLength="1"/>`,
    'campaign-management': `
        <path d="M10 14l11 -11" pathLength="1"/>
        <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" pathLength="1"/>`,
    'lead-servicing': `
        <path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227" pathLength="1"/>`,
};
