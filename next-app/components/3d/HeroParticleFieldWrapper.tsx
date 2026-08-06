'use client';

import dynamic from 'next/dynamic';

// r3f canvas is browser-only — skip SSR entirely.
const HeroParticleField = dynamic(() => import('./HeroParticleField'), { ssr: false });

export default HeroParticleField;
