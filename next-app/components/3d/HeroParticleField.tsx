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
   Hero Workflow Node Graph
   Abstract minimalist automation-workflow
   network: hairline connections, geometric
   diamond nodes, and data pulses traveling
   edges. All per-particle motion is GPU-driven.
   ============================================ */

/* ---------------------------------------------------------------
   Procedural graph generation — called once, produces typed arrays
   for all three draw layers (nodes, edges, pulses).
   --------------------------------------------------------------- */
interface GraphData {
    /** Flat xyz for each node (N*3) */
    nodePositions: Float32Array;
    /** Per-node random seed (N) */
    nodeSeeds: Float32Array;
    /** Per-node tier (0 = primary, 1 = accent, 2 = muted) */
    nodeTiers: Float32Array;
    /** Flat xyz pairs for each edge endpoint (E*6) */
    edgePositions: Float32Array;
    /** Per-edge random seed — two per edge, one per vertex (E*2) */
    edgeSeeds: Float32Array;
    /** Pulse data: for each pulse [edgeIndex, t, speed, seed] (P*4) */
    pulseData: Float32Array;
    /** Flat xyz for pulse positions (P*3) — updated per frame */
    pulsePositions: Float32Array;
    /** Edge lookup: for each edge [startNodeIdx, endNodeIdx] (E*2) */
    edgePairs: Uint16Array;
    /** Per-node adjacency list for pulse routing */
    adjacency: number[][];
    nodeCount: number;
    edgeCount: number;
    pulseCount: number;
}

function generateGraph(
    viewW: number,
    viewH: number,
    nodeCount: number,
    pulseCount: number
): GraphData {
    const halfW = viewW * 0.58;
    const halfH = viewH * 0.58;
    const zSpread = 120;

    // Grid-with-jitter placement
    const cols = Math.ceil(Math.sqrt(nodeCount * (halfW / halfH)));
    const rows = Math.ceil(nodeCount / cols);
    const cellW = (halfW * 2) / cols;
    const cellH = (halfH * 2) / rows;
    const actualCount = Math.min(cols * rows, nodeCount);

    const positions: number[] = [];
    const seeds: number[] = [];
    const tiers: number[] = [];

    for (let r = 0; r < rows && positions.length / 3 < actualCount; r++) {
        for (let c = 0; c < cols && positions.length / 3 < actualCount; c++) {
            const baseX = -halfW + cellW * (c + 0.5);
            const baseY = -halfH + cellH * (r + 0.5);
            const jitterX = (Math.random() - 0.5) * cellW * 0.35;
            const jitterY = (Math.random() - 0.5) * cellH * 0.35;
            const z = (Math.random() - 0.5) * zSpread;
            positions.push(baseX + jitterX, baseY + jitterY, z);
            seeds.push(Math.random());
            // ~18% accent, ~25% muted, rest primary
            const roll = Math.random();
            tiers.push(roll < 0.18 ? 1 : roll < 0.43 ? 2 : 0);
        }
    }

    const N = positions.length / 3;
    const nodePositions = new Float32Array(positions);
    const nodeSeeds = new Float32Array(seeds);
    const nodeTiers = new Float32Array(tiers);

    // Proximity graph: connect each node to its 2-3 nearest within radius
    const maxEdges = 3;
    const radiusThreshold = Math.max(cellW, cellH) * 1.8;
    const edgePairsList: [number, number][] = [];
    const edgeSet = new Set<string>();
    const adjacency: number[][] = Array.from({ length: N }, () => []);

    for (let i = 0; i < N; i++) {
        const ix = nodePositions[i * 3];
        const iy = nodePositions[i * 3 + 1];
        const iz = nodePositions[i * 3 + 2];

        // Gather distances to all other nodes
        const dists: { idx: number; d: number }[] = [];
        for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const dx = nodePositions[j * 3] - ix;
            const dy = nodePositions[j * 3 + 1] - iy;
            const dz = nodePositions[j * 3 + 2] - iz;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d < radiusThreshold) dists.push({ idx: j, d });
        }
        dists.sort((a, b) => a.d - b.d);

        let count = 0;
        for (const { idx: j } of dists) {
            if (count >= maxEdges) break;
            const key = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (edgeSet.has(key)) continue;
            edgeSet.add(key);
            edgePairsList.push([i, j]);
            adjacency[i].push(j);
            adjacency[j].push(i);
            count++;
        }
    }

    const E = edgePairsList.length;
    const edgePositions = new Float32Array(E * 6);
    const edgeSeedsArr = new Float32Array(E * 2);
    const edgePairs = new Uint16Array(E * 2);

    for (let e = 0; e < E; e++) {
        const [a, b] = edgePairsList[e];
        edgePositions[e * 6 + 0] = nodePositions[a * 3 + 0];
        edgePositions[e * 6 + 1] = nodePositions[a * 3 + 1];
        edgePositions[e * 6 + 2] = nodePositions[a * 3 + 2];
        edgePositions[e * 6 + 3] = nodePositions[b * 3 + 0];
        edgePositions[e * 6 + 4] = nodePositions[b * 3 + 1];
        edgePositions[e * 6 + 5] = nodePositions[b * 3 + 2];
        edgeSeedsArr[e * 2 + 0] = Math.random();
        edgeSeedsArr[e * 2 + 1] = Math.random();
        edgePairs[e * 2 + 0] = a;
        edgePairs[e * 2 + 1] = b;
    }

    // Pulse particles
    const P = Math.min(pulseCount, E);
    const pulseData = new Float32Array(P * 4);
    const pulsePositions = new Float32Array(P * 3);

    for (let p = 0; p < P; p++) {
        const edgeIdx = Math.floor(Math.random() * E);
        pulseData[p * 4 + 0] = edgeIdx;
        pulseData[p * 4 + 1] = Math.random(); // t
        pulseData[p * 4 + 2] = 0.15 + Math.random() * 0.35; // speed
        pulseData[p * 4 + 3] = Math.random(); // seed (for color)
        // Initial position
        const t = pulseData[p * 4 + 1];
        const ei = edgeIdx;
        pulsePositions[p * 3 + 0] = THREE.MathUtils.lerp(edgePositions[ei * 6 + 0], edgePositions[ei * 6 + 3], t);
        pulsePositions[p * 3 + 1] = THREE.MathUtils.lerp(edgePositions[ei * 6 + 1], edgePositions[ei * 6 + 4], t);
        pulsePositions[p * 3 + 2] = THREE.MathUtils.lerp(edgePositions[ei * 6 + 2], edgePositions[ei * 6 + 5], t);
    }

    return {
        nodePositions,
        nodeSeeds,
        nodeTiers,
        edgePositions,
        edgeSeeds: edgeSeedsArr,
        pulseData,
        pulsePositions,
        edgePairs,
        adjacency,
        nodeCount: N,
        edgeCount: E,
        pulseCount: P,
    };
}

/* ---------------------------------------------------------------
   Shaders — Nodes (n8n-style rounded rectangle cards)
   --------------------------------------------------------------- */
const NODE_VERTEX = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uRadius;
uniform float uScatter;
uniform float uReveal;
uniform float uDpr;
attribute float aSeed;
attribute float aTier;
varying float vAlpha;
varying float vTier;
varying float vGlow;

void main() {
    vec3 pos = position;

    // Subtle organic drift
    float drift = sin(pos.x * 0.008 + uTime * 0.3 + aSeed * 6.28) * 4.0
                + cos(pos.y * 0.006 + uTime * 0.25 + aSeed * 3.14) * 3.5;
    pos.x += drift;
    pos.y += sin(pos.y * 0.009 + uTime * 0.22 + aSeed * 5.0) * 3.5;
    pos.z += cos(pos.x * 0.005 + uTime * 0.18) * 2.0;

    // Scroll dispersal
    pos *= 1.0 + uScatter * (0.4 + aSeed * 0.6);

    // Cursor proximity glow
    vec2 d = pos.xy - uPointer;
    float dist = length(d);
    float proximity = exp(-(dist * dist) / (uRadius * uRadius * 1.8));
    vGlow = proximity * uPointerStrength;

    // Slight attraction toward cursor
    pos.xy -= d * proximity * uPointerStrength * 0.06;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    // Rounded-rect card size: varied by tier
    // Primary = standard, Accent = slightly larger, Muted = compact
    float tierScale = aTier < 0.5 ? 1.0 : (aTier < 1.5 ? 1.2 : 0.75);
    gl_PointSize = uDpr * tierScale * (18.0 + aSeed * 12.0);

    // Breathing
    float breathe = 0.88 + 0.12 * sin(uTime * (0.2 + aSeed * 0.15) + aSeed * 40.0);
    vAlpha = breathe * max(1.0 - uScatter * 1.4, 0.0) * uReveal;
    vTier = aTier;
}
`;

const NODE_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uColorPrimary;
uniform vec3 uColorAccent;
uniform vec3 uColorMuted;
uniform float uOpacity;
varying float vAlpha;
varying float vTier;
varying float vGlow;

// Signed distance for a rounded rectangle
float sdRoundedRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + r;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

void main() {
    // Map gl_PointCoord to centered coords, slightly wider than tall (card aspect)
    vec2 p = (gl_PointCoord - 0.5) * vec2(1.0, 0.75);

    // Rounded rectangle: half-size, corner radius
    float dist = sdRoundedRect(p, vec2(0.42, 0.28), 0.06);

    // Crisp edge with 1px anti-alias
    float border = smoothstep(0.008, -0.008, dist);
    if (border < 0.003) discard;

    // Color by tier
    vec3 col = vTier < 0.5 ? uColorPrimary : (vTier < 1.5 ? uColorAccent : uColorMuted);

    // Subtle inner divider line at ~30% from top (like an n8n node header)
    float headerLine = smoothstep(0.003, 0.0, abs(p.y + 0.08));
    float innerMask = step(abs(dist + 0.03), 0.03); // only inside the rect

    // Fill: very subtle tinted fill, stronger border outline
    float fillAlpha = 0.12 + headerLine * innerMask * 0.15;
    float borderStroke = smoothstep(0.0, -0.02, dist) - smoothstep(-0.02, -0.045, dist);

    float a = (fillAlpha + borderStroke * 0.6) * border * vAlpha * uOpacity;

    // Cursor glow: brighten toward white and boost alpha
    col = mix(col, vec3(1.0), vGlow * 0.5);
    a += vGlow * border * 0.25;

    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
}
`;

/* ---------------------------------------------------------------
   Shaders — Edges (hairline connections)
   --------------------------------------------------------------- */
const EDGE_VERTEX = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uRadius;
uniform float uScatter;
uniform float uReveal;
attribute float aSeed;
varying float vAlpha;
varying float vGlow;

void main() {
    vec3 pos = position;

    // Match the same drift as nodes so edges stay attached
    float drift = sin(pos.x * 0.008 + uTime * 0.3 + aSeed * 6.28) * 4.0
                + cos(pos.y * 0.006 + uTime * 0.25 + aSeed * 3.14) * 3.5;
    pos.x += drift;
    pos.y += sin(pos.y * 0.009 + uTime * 0.22 + aSeed * 5.0) * 3.5;
    pos.z += cos(pos.x * 0.005 + uTime * 0.18) * 2.0;

    // Scroll dispersal
    pos *= 1.0 + uScatter * (0.4 + aSeed * 0.6);

    // Cursor attraction
    vec2 d = pos.xy - uPointer;
    float dist = length(d);
    float proximity = exp(-(dist * dist) / (uRadius * uRadius * 1.8));
    vGlow = proximity * uPointerStrength;
    pos.xy -= d * proximity * uPointerStrength * 0.06;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    float breathe = 0.9 + 0.1 * sin(uTime * 0.15 + aSeed * 20.0);
    vAlpha = breathe * max(1.0 - uScatter * 1.4, 0.0) * uReveal;
}
`;

const EDGE_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uColorLine;
uniform float uOpacity;
varying float vAlpha;
varying float vGlow;

void main() {
    float a = vAlpha * uOpacity;
    vec3 col = uColorLine;
    col = mix(col, vec3(1.0), vGlow * 0.4);
    a += vGlow * 0.15;
    if (a < 0.003) discard;
    gl_FragColor = vec4(col, a);
}
`;

/* ---------------------------------------------------------------
   Shaders — Pulses (bright dots traveling edges)
   --------------------------------------------------------------- */
const PULSE_VERTEX = /* glsl */ `
uniform float uDpr;
uniform float uScatter;
uniform float uReveal;
attribute float aSeed;
varying float vAlpha;
varying float vSeed;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uDpr * (5.0 + aSeed * 4.0);
    vAlpha = max(1.0 - uScatter * 1.4, 0.0) * uReveal;
    vSeed = aSeed;
}
`;

const PULSE_FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uColorPrimary;
uniform vec3 uColorAccent;
uniform float uOpacity;
varying float vAlpha;
varying float vSeed;

void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha * uOpacity;
    if (a < 0.003) discard;
    vec3 col = vSeed > 0.7 ? uColorAccent : uColorPrimary;
    gl_FragColor = vec4(col, a);
}
`;

/* ---------------------------------------------------------------
   Theme palettes
   --------------------------------------------------------------- */
const THEME_COLORS = {
    dark: {
        primary: '#5FB2FF',
        accent: '#F97316',
        muted: '#3A5A80',
        line: '#2A4060',
        nodeOpacity: 0.55,
        edgeOpacity: 0.14,
        pulseOpacity: 0.8,
        blending: THREE.AdditiveBlending,
    },
    light: {
        primary: '#005EB8',
        accent: '#F97316',
        muted: '#8EAEC8',
        line: '#B0C4D8',
        nodeOpacity: 0.38,
        edgeOpacity: 0.1,
        pulseOpacity: 0.55,
        blending: THREE.NormalBlending,
    },
};

/* ---------------------------------------------------------------
   The scene component — nodes + edges + pulses
   --------------------------------------------------------------- */
function WorkflowGraph({ nodeCount, pulseCount, reduced }: {
    nodeCount: number;
    pulseCount: number;
    reduced: boolean;
}) {
    const { size, gl, invalidate } = useThree();
    const groupRef = useRef<THREE.Group>(null);
    const nodesRef = useRef<THREE.Points>(null);
    const edgesRef = useRef<THREE.LineSegments>(null);
    const pulsesRef = useRef<THREE.Points>(null);

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

    // Generate graph once based on viewport size
    const graph = useMemo(
        () => generateGraph(size.width, size.height, nodeCount, pulseCount),
        [size.width, size.height, nodeCount, pulseCount]
    );

    // --- Node geometry + material ---
    const nodeGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(graph.nodePositions.slice(), 3));
        geo.setAttribute('aSeed', new THREE.BufferAttribute(graph.nodeSeeds, 1));
        geo.setAttribute('aTier', new THREE.BufferAttribute(graph.nodeTiers, 1));
        return geo;
    }, [graph]);

    const nodeMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: NODE_VERTEX,
        fragmentShader: NODE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2(0, 0) },
            uPointerStrength: { value: 0 },
            uRadius: { value: 160 },
            uScatter: { value: 0 },
            uReveal: { value: reduced ? 1 : 0 },
            uDpr: { value: 1 },
            uColorPrimary: { value: new THREE.Color(THEME_COLORS.dark.primary) },
            uColorAccent: { value: new THREE.Color(THEME_COLORS.dark.accent) },
            uColorMuted: { value: new THREE.Color(THEME_COLORS.dark.muted) },
            uOpacity: { value: THEME_COLORS.dark.nodeOpacity },
        },
    }), [reduced]);

    // --- Edge geometry + material ---
    const edgeGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(graph.edgePositions.slice(), 3));
        geo.setAttribute('aSeed', new THREE.BufferAttribute(graph.edgeSeeds, 1));
        return geo;
    }, [graph]);

    const edgeMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: EDGE_VERTEX,
        fragmentShader: EDGE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2(0, 0) },
            uPointerStrength: { value: 0 },
            uRadius: { value: 160 },
            uScatter: { value: 0 },
            uReveal: { value: reduced ? 1 : 0 },
            uColorLine: { value: new THREE.Color(THEME_COLORS.dark.line) },
            uOpacity: { value: THEME_COLORS.dark.edgeOpacity },
        },
    }), [reduced]);

    // --- Pulse geometry + material ---
    const pulseGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(graph.pulsePositions, 3));
        const pulseSeeds = new Float32Array(graph.pulseCount);
        for (let i = 0; i < graph.pulseCount; i++) {
            pulseSeeds[i] = graph.pulseData[i * 4 + 3];
        }
        geo.setAttribute('aSeed', new THREE.BufferAttribute(pulseSeeds, 1));
        return geo;
    }, [graph]);

    const pulseMat = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: PULSE_VERTEX,
        fragmentShader: PULSE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uDpr: { value: 1 },
            uScatter: { value: 0 },
            uReveal: { value: reduced ? 1 : 0 },
            uColorPrimary: { value: new THREE.Color(THEME_COLORS.dark.primary) },
            uColorAccent: { value: new THREE.Color(THEME_COLORS.dark.accent) },
            uOpacity: { value: THEME_COLORS.dark.pulseOpacity },
        },
    }), [reduced]);

    // Cleanup
    useEffect(() => () => { nodeGeo.dispose(); }, [nodeGeo]);
    useEffect(() => () => { nodeMat.dispose(); }, [nodeMat]);
    useEffect(() => () => { edgeGeo.dispose(); }, [edgeGeo]);
    useEffect(() => () => { edgeMat.dispose(); }, [edgeMat]);
    useEffect(() => () => { pulseGeo.dispose(); }, [pulseGeo]);
    useEffect(() => () => { pulseMat.dispose(); }, [pulseMat]);

    // Viewport + DPR
    useEffect(() => {
        const dpr = gl.getPixelRatio();
        const radius = Math.max(120, Math.min(size.width, size.height) * 0.18);
        nodeMat.uniforms.uDpr.value = dpr;
        nodeMat.uniforms.uRadius.value = radius;
        edgeMat.uniforms.uRadius.value = radius;
        pulseMat.uniforms.uDpr.value = dpr;
        invalidate();
    }, [size, gl, nodeMat, edgeMat, pulseMat, invalidate]);

    // Theme colors
    useEffect(() => {
        const apply = () => {
            const theme =
                document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const c = THEME_COLORS[theme];

            (nodeMat.uniforms.uColorPrimary.value as THREE.Color).set(c.primary);
            (nodeMat.uniforms.uColorAccent.value as THREE.Color).set(c.accent);
            (nodeMat.uniforms.uColorMuted.value as THREE.Color).set(c.muted);
            nodeMat.uniforms.uOpacity.value = c.nodeOpacity;
            nodeMat.blending = c.blending;
            nodeMat.needsUpdate = true;

            (edgeMat.uniforms.uColorLine.value as THREE.Color).set(c.line);
            edgeMat.uniforms.uOpacity.value = c.edgeOpacity;
            edgeMat.blending = c.blending;
            edgeMat.needsUpdate = true;

            (pulseMat.uniforms.uColorPrimary.value as THREE.Color).set(c.primary);
            (pulseMat.uniforms.uColorAccent.value as THREE.Color).set(c.accent);
            pulseMat.uniforms.uOpacity.value = c.pulseOpacity;
            pulseMat.blending = c.blending;
            pulseMat.needsUpdate = true;

            invalidate();
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, [nodeMat, edgeMat, pulseMat, invalidate]);

    // Pointer tracking
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
        const onLeave = () => { sim.current.active = false; };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
        };
    }, [gl, reduced]);

    // Scroll dispersal
    useEffect(() => {
        if (reduced) return;
        const st = ScrollTrigger.create({
            trigger: '#home',
            start: 'top top',
            end: 'bottom 25%',
            onUpdate: (self) => { sim.current.scatterTarget = self.progress; },
        });
        return () => st.kill();
    }, [reduced]);

    // Per-frame update
    useFrame((_, delta) => {
        const s = sim.current;
        const dt = Math.min(delta, 0.05);
        s.elapsed += dt;

        const time = s.elapsed;

        // Shared uniforms
        nodeMat.uniforms.uTime.value = time;
        edgeMat.uniforms.uTime.value = time;

        // Pointer inertia
        s.pointer.lerp(s.target, 1 - Math.exp(-dt * 5.5));
        const strengthTarget = s.active ? 1 : 0;
        s.strength += (strengthTarget - s.strength) * (1 - Math.exp(-dt * (s.active ? 4 : 1.6)));
        nodeMat.uniforms.uPointer.value.copy(s.pointer);
        nodeMat.uniforms.uPointerStrength.value = s.strength;
        edgeMat.uniforms.uPointer.value.copy(s.pointer);
        edgeMat.uniforms.uPointerStrength.value = s.strength;

        // Scatter
        s.scatter += (s.scatterTarget - s.scatter) * (1 - Math.exp(-dt * 6));
        nodeMat.uniforms.uScatter.value = s.scatter;
        edgeMat.uniforms.uScatter.value = s.scatter;
        pulseMat.uniforms.uScatter.value = s.scatter;

        // Reveal
        if (s.elapsed > 0.4) {
            s.reveal = Math.min(1, s.reveal + dt / 2.0);
            const smoothReveal = s.reveal * s.reveal * (3 - 2 * s.reveal);
            nodeMat.uniforms.uReveal.value = smoothReveal;
            edgeMat.uniforms.uReveal.value = smoothReveal;
            pulseMat.uniforms.uReveal.value = smoothReveal;
        }

        // Cursor parallax on the group
        if (groupRef.current) {
            const g = groupRef.current;
            g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, s.pointer.x * 0.00015, 0.04);
            g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -s.pointer.y * 0.00012, 0.04);
        }

        // --- Edge drift: keep edge vertex positions synced with node drift ---
        // The edge shader applies the same drift function, so no CPU sync needed.
        // The edge positions in the geometry are the BASE positions; the shader
        // applies drift identically to the node shader. We just need the aSeed
        // attribute to carry each vertex's node seed so the drift matches.
        // This is already handled: edge aSeed carries the node's seed.

        // --- Pulse positions: advance t and interpolate on CPU ---
        const pd = graph.pulseData;
        const pp = graph.pulsePositions;
        const ep = graph.edgePositions;
        for (let p = 0; p < graph.pulseCount; p++) {
            let edgeIdx = pd[p * 4 + 0];
            let t = pd[p * 4 + 1];
            const speed = pd[p * 4 + 2];

            t += dt * speed;
            if (t >= 1) {
                // Jump to a random connected edge
                const endNode = graph.edgePairs[Math.floor(edgeIdx) * 2 + 1];
                const adj = graph.adjacency[endNode];
                if (adj && adj.length > 0) {
                    const nextNode = adj[Math.floor(Math.random() * adj.length)];
                    // Find an edge connecting endNode and nextNode
                    let found = false;
                    for (let e = 0; e < graph.edgeCount; e++) {
                        const a = graph.edgePairs[e * 2];
                        const b = graph.edgePairs[e * 2 + 1];
                        if ((a === endNode && b === nextNode) || (a === nextNode && b === endNode)) {
                            edgeIdx = e;
                            found = true;
                            break;
                        }
                    }
                    if (!found) edgeIdx = Math.floor(Math.random() * graph.edgeCount);
                }
                t = 0;
            }

            pd[p * 4 + 0] = edgeIdx;
            pd[p * 4 + 1] = t;

            const ei = Math.floor(edgeIdx);

            // Base positions (before drift)
            const ax = ep[ei * 6 + 0], ay = ep[ei * 6 + 1], az = ep[ei * 6 + 2];
            const bx = ep[ei * 6 + 3], by = ep[ei * 6 + 4], bz = ep[ei * 6 + 5];

            // Lerp base position
            let px = ax + (bx - ax) * t;
            let py = ay + (by - ay) * t;
            let pz = az + (bz - az) * t;

            // Apply the same drift as the node/edge shaders so pulses track the edges
            const seed = pd[p * 4 + 3];
            const driftX = Math.sin(px * 0.008 + time * 0.3 + seed * 6.28) * 4.0
                         + Math.cos(py * 0.006 + time * 0.25 + seed * 3.14) * 3.5;
            const driftY = Math.sin(py * 0.009 + time * 0.22 + seed * 5.0) * 3.5;
            const driftZ = Math.cos(px * 0.005 + time * 0.18) * 2.0;
            px += driftX;
            py += driftY;
            pz += driftZ;

            // Scatter
            const scatterMul = 1.0 + s.scatter * (0.4 + seed * 0.6);
            px *= scatterMul;
            py *= scatterMul;
            pz *= scatterMul;

            pp[p * 3 + 0] = px;
            pp[p * 3 + 1] = py;
            pp[p * 3 + 2] = pz;
        }
        if (pulsesRef.current) {
            (pulsesRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        }
    });

    return (
        <group ref={groupRef}>
            <lineSegments ref={edgesRef} geometry={edgeGeo} material={edgeMat} frustumCulled={false} />
            <points ref={nodesRef} geometry={nodeGeo} material={nodeMat} frustumCulled={false} />
            <points ref={pulsesRef} geometry={pulseGeo} material={pulseMat} frustumCulled={false} />
        </group>
    );
}

/* ---------------------------------------------------------------
   Exported component — same signature as the original
   --------------------------------------------------------------- */
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

    // Pause render when hero is off-screen
    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
            threshold: 0,
        });
        io.observe(host);
        return () => io.disconnect();
    }, []);

    const nodeCount = isMobile ? 55 : 120;
    const pulseCount = isMobile ? 12 : 28;

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        >
            <Canvas
                orthographic
                camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 400 }}
                dpr={[1, 1.5]}
                frameloop={reduced || !visible ? 'never' : 'always'}
                gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                style={{ pointerEvents: 'none' }}
            >
                <WorkflowGraph
                    nodeCount={nodeCount}
                    pulseCount={pulseCount}
                    reduced={reduced}
                />
            </Canvas>
        </div>
    );
}
