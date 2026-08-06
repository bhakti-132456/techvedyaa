# Prompt for Claude Code — TechVedyaa Awwwards Build (Phase 2)

Copy everything below into a new Claude Code session started in `D:\misc\TechVedyaa\next-app`.

---

You are continuing an in-progress redesign of TechVedyaa's Next.js site (this folder, App Router, Next 16, React 19). The site was recently converted to a **dark-first, flat, typography-led editorial aesthetic modeled on noomoagency.com**: near-black `#0A0A0B` default theme with warm-paper light variant (next-themes toggle, default dark), hairline 1px borders instead of shadows (see `styles/tokens.css` — the `--neu-*` tokens are intentionally redefined as flat hairline outlines and legacy modules depend on them), massive statement hero with left-aligned editorial type, pill CTAs (inverted primary / outlined secondary), ghost-outline-text industries marquee, editorial stats with hairline top rules, oversized footer links, custom cursor with magnetic buttons (`components/CustomCursor.tsx`), Lenis smooth scroll (`components/SmoothScrollProvider.tsx`), GSAP ScrollTrigger locomotion (`components/islands/LocomotionEngine.tsx`), and a full-viewport reactive circuit-board shader background (`components/islands/ReactiveEnvironment.tsx`) that shows through every section — all sections are background-transparent for a uniform canvas.

**Hard constraints:** keep all content and copy exactly as-is. Do not touch contact-form markup, logic, or submission behavior (CSS-only changes allowed there). Keep the theme toggle, custom cursor, and circuit background working. `public/index.html` elsewhere is a fallback — ignore it; this Next.js app is the site. Verify with `tsc --noEmit` and `next build` as you go. Respect `prefers-reduced-motion` globally, animate only transforms/opacity, and use `gsap.matchMedia` for lighter mobile variants.

Build the following, in this order:

## 1. Motion foundation (do this first — everything else sits on it)
Sync Lenis with GSAP ScrollTrigger through one ticker (scrollerProxy or lenis.on('scroll', ScrollTrigger.update) + gsap ticker driving lenis.raf) so smooth scroll and scroll-triggered animation share a single timeline. Then build a data-attribute reveal system used by every section: headlines split into lines that rise out of overflow masks with stagger, paragraphs fade+rise, cards clip-path reveal, stat numbers count up on entry, marquee speed reacts to scroll velocity. Add a short load choreography for the hero (eyebrow → title lines → description → CTAs → nav). One easing family, three duration tiers.

## 2. Seamless section flow + scroll depth
Every section must flow into the next with no hard boundaries: use pinning, parallax offsets, scale/opacity handoffs (outgoing section subtly scales down/dims under the incoming one), and z-depth layering so scrolling feels like moving through space rather than past stacked blocks. Section headers can pin briefly while content passes. This is where the awwwards-level feel lives — be ambitious but keep it 60fps.

## 3. Hero interactive element
Full-bleed cursor-reactive **particle flow-field** background behind the statement type: thousands of shader-driven points (one Canvas, additive blending, r3f is installed) drifting in organic noise flow, parting around the cursor with inertia, re-forming on leave, dispersing/fading as you scroll out of the hero. Mobile: fewer particles, capped DPR, autonomous drift + touch reaction. Reduced-motion: static field. It must never compete with text legibility.

## 4. Services section — full-viewport horizontal panels
Rebuild `components/sections/ServicesGrid.tsx` + `Services.module.css`: each service card becomes a ~100vw × ~100vh panel; the section pins and translates horizontally with scrub + snap to each card; thin progress rail + "01 / 06" counter. Widescreen card layout: **1/3 visual, 2/3 copy** — the visual third holds a per-service 3D micro-element rendered via drei `View` into one shared WebGL canvas (six scenes, one context; idle rotation + mouse parallax + entrance animation), copy at editorial scale with line-by-line feature reveal when the card is active. Mobile: NO pinning — native CSS scroll-snap with ~90vw slides, visual stacked above copy, active-card scale/ink-in via IntersectionObserver, OS-native momentum.

## 5. Customer journey ("Our Process") — rebuild big
`components/sections/ProcessSection.tsx` + `Process.module.css`. Keep the concept: progress bar + the TechVedyaa-branded checkmark on completed steps (checkmark asset already used in `.dotActive`). But scale everything up dramatically — near-full-viewport step cards, oversized step numerals, exaggerated travel: steps should sweep in with real distance and depth (z-translate/scale parallax, not timid 20px fades), progress bar fills scrub-linked to scroll, checkmarks pop with a springy draw-on when their step completes. Make it feel immersive and cinematic, alternating layout preserved on desktop, single-rail version on mobile.

## 6. Icons — unique, custom, animated
Audit every heading across Services, Methodology, Engagement, and Scope data (`lib/data/`) and replace `components/3d/Micro3DIcon.tsx`'s generic lucide-with-hash-fallback with an explicit 1:1 map — every unique heading gets its own distinct glyph, zero collisions. Use custom inline SVGs in one drawn-line style (1.5px stroke matching the hairline aesthetic) with stroke draw-on animation when scrolled into view (dashoffset) and a per-icon hover micro-motion matching its meaning (bars grow on analytics, bolt flickers on automation, gears counter-rotate on tech, etc.).

Work iteratively: after each numbered phase, run the type-check and confirm the dev experience is smooth before moving on. Desktop and mobile must both feel deliberate — mobile is not a degraded version, it's a parallel design.
