'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/* ============================================
   Hero Particle Flow Field
   Thousands of shader-driven points drifting in
   organic noise flow, parting around the cursor
   with inertia and dispersing on scroll-out.
   All per-particle motion is computed in the
   vertex shader — the CPU only eases uniforms.
   ============================================ */

const VERTEX = /* glsl */ `
uniform float uTime;
uniform vec2 uViewport;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uRadius;
uniform float uScatter;
uniform float uReveal;
uniform float uSize;
uniform float uDpr;
attribute float aSeed;
varying float vAlpha;
varying float vMix;

// Simplex 2D noise (Ashima / Ian McEwan, public domain)
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 base = position.xy * uViewport;
  float t = uTime * 0.028;

  // Organic flow drift — two offset noise fields as a pseudo-curl
  float n1 = snoise(base * 0.0016 + vec2(t, -t * 0.7) + aSeed * 0.37);
  float n2 = snoise(base * 0.0016 + vec2(-t * 0.8, t) + aSeed * 0.91 + 45.2);
  vec2 pos = base + vec2(n1, n2) * (34.0 + aSeed * 46.0);

  // Cursor repulsion — Gaussian falloff, strength eased on the CPU for inertia
  vec2 d = pos - uPointer;
  float dist = length(d);
  float force = uPointerStrength * exp(-(dist * dist) / (uRadius * uRadius));
  pos += (d / max(dist, 1.0)) * force * uRadius * 0.9;

  // Scroll dispersal — particles scatter outward and fade
  pos *= 1.0 + uScatter * (0.35 + aSeed * 0.55);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
  gl_PointSize = uSize * uDpr * (0.5 + aSeed * 1.1);

  // Gentle breathing, not twinkle — small amplitude, slow rate, so a
  // field of thousands of points never reads as flicker.
  float tw = 0.8 + 0.2 * sin(uTime * (0.16 + aSeed * 0.2) + aSeed * 40.0);
  vAlpha = tw * max(1.0 - uScatter * 1.35, 0.0) * uReveal;
  vMix = step(0.82, fract(aSeed * 7.31));
}
`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
varying float vAlpha;
varying float vMix;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.12, d) * vAlpha * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(uColorA, uColorB, vMix), a);
}
`;

const THEME_COLORS = {
    dark: { a: '#5FB2FF', b: '#F97316', opacity: 0.5, blending: THREE.AdditiveBlending },
    light: { a: '#005EB8', b: '#F97316', opacity: 0.32, blending: THREE.NormalBlending },
};

function Field({ count, reduced }: { count: number; reduced: boolean }) {
    const { size, gl, invalidate } = useThree();
    const pointsRef = useRef<THREE.Points>(null);

    // Eased-on-CPU interaction state (inertia lives here)
    const sim = useRef({
        pointer: new THREE.Vector2(0, 0),
        target: new THREE.Vector2(0, 0),
        strength: 0,
        active: false,
        scatter: 0,
        scatterTarget: 0,
        reveal: 0,
        elapsed: 0,
    });

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const seeds = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Normalized spread with slight overscan past the edges
            positions[i * 3] = (Math.random() - 0.5) * 1.15;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.15;
            positions[i * 3 + 2] = 0;
            seeds[i] = Math.random();
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
        return geo;
    }, [count]);

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: VERTEX,
                fragmentShader: FRAGMENT,
                transparent: true,
                depthWrite: false,
                depthTest: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uViewport: { value: new THREE.Vector2(1, 1) },
                    uPointer: { value: new THREE.Vector2(0, 0) },
                    uPointerStrength: { value: 0 },
                    uRadius: { value: 160 },
                    uScatter: { value: 0 },
                    uReveal: { value: reduced ? 1 : 0 },
                    uSize: { value: 2.2 },
                    uDpr: { value: 1 },
                    uColorA: { value: new THREE.Color(THEME_COLORS.dark.a) },
                    uColorB: { value: new THREE.Color(THEME_COLORS.dark.b) },
                    uOpacity: { value: THEME_COLORS.dark.opacity },
                },
            }),
        [reduced]
    );

    useEffect(() => () => {
        geometry.dispose();
    }, [geometry]);
    useEffect(() => () => {
        material.dispose();
    }, [material]);

    // Viewport + DPR uniforms
    useEffect(() => {
        material.uniforms.uViewport.value.set(size.width, size.height);
        material.uniforms.uRadius.value = Math.max(120, Math.min(size.width, size.height) * 0.16);
        material.uniforms.uDpr.value = gl.getPixelRatio();
        invalidate(); // repaint the static frame when frameloop is 'never'
    }, [size, gl, material, invalidate]);

    // Theme-aware colors + blending (next-themes flips data-theme on <html>)
    useEffect(() => {
        const apply = () => {
            const theme =
                document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const c = THEME_COLORS[theme];
            (material.uniforms.uColorA.value as THREE.Color).set(c.a);
            (material.uniforms.uColorB.value as THREE.Color).set(c.b);
            material.uniforms.uOpacity.value = c.opacity;
            material.blending = c.blending;
            material.needsUpdate = true;
            invalidate();
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, [material, invalidate]);

    // Pointer tracking against the canvas rect (canvas is pointer-events: none)
    useEffect(() => {
        if (reduced) return;
        const el = gl.domElement;
        const onMove = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            const inside =
                e.clientX >= rect.left - 40 &&
                e.clientX <= rect.right + 40 &&
                e.clientY >= rect.top - 40 &&
                e.clientY <= rect.bottom + 40;
            sim.current.active = inside;
            if (inside) {
                sim.current.target.set(
                    e.clientX - rect.left - rect.width / 2,
                    rect.height / 2 - (e.clientY - rect.top)
                );
            }
        };
        const onLeave = () => {
            sim.current.active = false;
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
        };
    }, [gl, reduced]);

    // Scroll-out dispersal driven by hero scroll progress
    useEffect(() => {
        if (reduced) return;
        const st = ScrollTrigger.create({
            trigger: '#home',
            start: 'top top',
            end: 'bottom 25%',
            onUpdate: (self) => {
                sim.current.scatterTarget = self.progress;
            },
        });
        return () => st.kill();
    }, [reduced]);

    useFrame((_, delta) => {
        const s = sim.current;
        const u = material.uniforms;
        const dt = Math.min(delta, 0.05);
        s.elapsed += dt;

        u.uTime.value += dt;

        // Inertia: pointer position and strength both trail their targets
        s.pointer.lerp(s.target, 1 - Math.exp(-dt * 5.5));
        const strengthTarget = s.active ? 1 : 0;
        s.strength += (strengthTarget - s.strength) * (1 - Math.exp(-dt * (s.active ? 4 : 1.6)));
        u.uPointer.value.copy(s.pointer);
        u.uPointerStrength.value = s.strength;

        // Smooth scatter + load reveal (starts after the type begins landing)
        s.scatter += (s.scatterTarget - s.scatter) * (1 - Math.exp(-dt * 6));
        u.uScatter.value = s.scatter;
        if (s.elapsed > 0.6) {
            s.reveal = Math.min(1, s.reveal + dt / 1.6);
            u.uReveal.value = s.reveal * s.reveal * (3 - 2 * s.reveal);
        }
    });

    return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />;
}

export default function HeroParticleField() {
    const [reduced, setReduced] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [visible, setVisible] = useState(true);
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mqMobile = window.matchMedia('(max-width: 768px)');
        const sync = () => {
            setReduced(mq.matches);
            setIsMobile(mqMobile.matches);
        };
        sync();
        mq.addEventListener('change', sync);
        mqMobile.addEventListener('change', sync);
        return () => {
            mq.removeEventListener('change', sync);
            mqMobile.removeEventListener('change', sync);
        };
    }, []);

    // Pause the render loop entirely once the hero is off-screen
    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
            threshold: 0,
        });
        io.observe(host);
        return () => io.disconnect();
    }, []);

    const count = isMobile ? 2200 : 6000;

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        >
            <Canvas
                orthographic
                camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 200 }}
                dpr={[1, 1.5]}
                frameloop={reduced || !visible ? 'never' : 'always'}
                gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                style={{ pointerEvents: 'none' }}
            >
                <Field count={count} reduced={reduced} />
            </Canvas>
        </div>
    );
}
