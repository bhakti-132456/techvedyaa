/* Shared handle to the single Lenis instance so islands
   (marquee velocity, scroll choreography) can read it without
   prop-drilling across server/client boundaries. */
import type Lenis from 'lenis';

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
    lenis = instance;
}

export function getLenis(): Lenis | null {
    return lenis;
}
