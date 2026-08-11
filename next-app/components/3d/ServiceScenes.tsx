'use client';

import { MutableRefObject, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { advance, Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF, View } from '@react-three/drei';
import { Line2, LineGeometry, LineMaterial, LineSegments2, LineSegmentsGeometry } from 'three-stdlib';
import gsap from 'gsap';

/* ============================================
   Service signature scenes — eight structures
   drawn in constant-width "fat lines" (Line2)
   that stroke themselves on when their panel
   activates, all sharing ONE WebGL context via
   drei <View>. The stroke weight matches the
   site's 1.5px hairline language at any depth.
   ============================================ */

export type ScenePalette = {
    name: 'dark' | 'light';
    primary: string;
    accent: string;
    line: string;
};

export const DARK_PALETTE: ScenePalette = { name: 'dark', primary: '#5FB2FF', accent: '#F97316', line: '#7E93AE' };
export const LIGHT_PALETTE: ScenePalette = { name: 'light', primary: '#005EB8', accent: '#F97316', line: '#41556E' };

/* ---------------------------------------------
   Procedural matcaps — studio lighting painted
   onto a canvas, no downloaded assets. A matcap
   bakes the entire light response into one
   texture, so shaded "chrome" and "glass" solids
   cost barely more than flat-color materials.
   --------------------------------------------- */
type MatcapSet = { chrome: THREE.Texture; accent: THREE.Texture; ink: THREE.Texture };
const matcapCache: Partial<Record<'dark' | 'light', MatcapSet>> = {};

function paintMatcap(base: string, highlight: string, shadow: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Key light: soft top-left studio falloff
    let g = ctx.createRadialGradient(96, 92, 18, 128, 128, 152);
    g.addColorStop(0, highlight);
    g.addColorStop(0.45, base);
    g.addColorStop(1, shadow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);

    // Bounce light: subtle lower-right fill
    g = ctx.createRadialGradient(192, 200, 6, 192, 200, 72);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);

    // Specular hit
    g = ctx.createRadialGradient(82, 76, 2, 82, 76, 26);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function getMatcaps(name: 'dark' | 'light'): MatcapSet {
    if (!matcapCache[name]) {
        matcapCache[name] =
            name === 'dark'
                ? {
                      chrome: paintMatcap('#46618a', '#eef6ff', '#0b1017'),
                      accent: paintMatcap('#e06a14', '#fff0dc', '#401a05'),
                      ink: paintMatcap('#23262c', '#8ea6c4', '#08090b'),
                  }
                : {
                      chrome: paintMatcap('#7f9dc4', '#ffffff', '#33465e'),
                      accent: paintMatcap('#ea7519', '#fff3e3', '#5a2708'),
                      ink: paintMatcap('#3a3f48', '#cfd9e6', '#14161a'),
                  };
    }
    return matcapCache[name]!;
}

function useMatcaps(palette: ScenePalette) {
    const materials = useMemo(() => {
        const tex = getMatcaps(palette.name);
        return {
            chrome: new THREE.MeshMatcapMaterial({ matcap: tex.chrome }),
            accent: new THREE.MeshMatcapMaterial({ matcap: tex.accent }),
            ink: new THREE.MeshMatcapMaterial({ matcap: tex.ink }),
        };
    }, [palette]);
    useEffect(
        () => () => {
            materials.chrome.dispose();
            materials.accent.dispose();
            materials.ink.dispose();
        },
        [materials]
    );
    return materials;
}

/* Shared pointer for mouse parallax — one listener, all scenes read it. */
const pointer = { x: 0, y: 0 };

type DrawRef = MutableRefObject<number>;
type SceneProps = { active: boolean; palette: ScenePalette };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ---------------------------------------------
   Draw progress: strokes sweep on when active,
   settle to a faint skeleton when inactive.
   --------------------------------------------- */
function useDraw(active: boolean): DrawRef {
    const p = useRef(0);
    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05);
        const target = active ? 1 : 0.3;
        const rate = active ? 0.5 : 0.8;
        const diff = target - p.current;
        p.current += Math.sign(diff) * Math.min(Math.abs(diff), dt * rate);
    });
    return p;
}

/* ---------------------------------------------
   Fat-line primitives
   --------------------------------------------- */
function useFatMaterial(color: string, lineWidth: number, opacity: number, total: number) {
    const { size } = useThree();
    const material = useMemo(() => {
        const m = new LineMaterial({
            color: new THREE.Color(color).getHex(),
            linewidth: lineWidth,
            transparent: true,
            opacity,
            dashed: true,
            depthWrite: false,
            alphaToCoverage: false,
        });
        m.dashSize = total;
        m.gapSize = total;
        m.dashOffset = total;
        return m;
    }, [color, lineWidth, opacity, total]);

    useEffect(() => {
        material.resolution.set(size.width, size.height);
    }, [material, size]);

    useEffect(() => () => material.dispose(), [material]);
    return material;
}

function useDrawOffset(material: LineMaterial, total: number, draw?: DrawRef, delay = 0) {
    useFrame(() => {
        const p = draw ? clamp01((draw.current - delay) / Math.max(0.001, 1 - delay)) : 1;
        material.dashOffset = total * (1 - p);
    });
}

/* Edges of a solid geometry as fat line segments. */
function EdgeShape({
    source,
    color,
    lineWidth = 1.5,
    opacity = 1,
    draw,
    delay = 0,
    ...groupProps
}: {
    source: THREE.BufferGeometry;
    color: string;
    lineWidth?: number;
    opacity?: number;
    draw?: DrawRef;
    delay?: number;
} & Omit<ThreeElements['group'], 'children'>) {
    const { geometry, total } = useMemo(() => {
        const edges = new THREE.EdgesGeometry(source, 1);
        const geo = new LineSegmentsGeometry().fromEdgesGeometry(edges);
        const pos = edges.attributes.position;
        let length = 0;
        for (let i = 0; i < pos.count; i += 2) {
            length += Math.hypot(
                pos.getX(i) - pos.getX(i + 1),
                pos.getY(i) - pos.getY(i + 1),
                pos.getZ(i) - pos.getZ(i + 1)
            );
        }
        edges.dispose();
        return { geometry: geo, total: length };
    }, [source]);

    const material = useFatMaterial(color, lineWidth, opacity, total);
    useDrawOffset(material, total, draw, delay);

    const line = useMemo(() => {
        const l = new LineSegments2(geometry, material);
        l.computeLineDistances();
        return l;
    }, [geometry, material]);

    useEffect(() => () => geometry.dispose(), [geometry]);

    return (
        <group {...groupProps}>
            <primitive object={line} />
        </group>
    );
}

/* A continuous polyline / loop as one fat stroke. */
function DrawnLine({
    points,
    color,
    lineWidth = 1.5,
    opacity = 1,
    draw,
    delay = 0,
    ...groupProps
}: {
    points: THREE.Vector3[];
    color: string;
    lineWidth?: number;
    opacity?: number;
    draw?: DrawRef;
    delay?: number;
} & Omit<ThreeElements['group'], 'children'>) {
    const { geometry, total } = useMemo(() => {
        const flat: number[] = [];
        let length = 0;
        points.forEach((p, i) => {
            flat.push(p.x, p.y, p.z);
            if (i > 0) length += p.distanceTo(points[i - 1]);
        });
        const geo = new LineGeometry();
        geo.setPositions(flat);
        return { geometry: geo, total: length };
    }, [points]);

    const material = useFatMaterial(color, lineWidth, opacity, total);
    useDrawOffset(material, total, draw, delay);

    const line = useMemo(() => {
        const l = new Line2(geometry, material);
        l.computeLineDistances();
        return l;
    }, [geometry, material]);

    useEffect(() => () => geometry.dispose(), [geometry]);

    return (
        <group {...groupProps}>
            <primitive object={line} />
        </group>
    );
}

/* Shaded solid rendered beneath fat-line edges — the "metal under the
   blueprint". Fades in with the draw progress. */
function Solid({
    geometry,
    material,
    draw,
    delay = 0,
    solidScale = 0.985,
    ...groupProps
}: {
    geometry: THREE.BufferGeometry;
    material: THREE.MeshMatcapMaterial;
    draw?: DrawRef;
    delay?: number;
    solidScale?: number;
} & Omit<ThreeElements['group'], 'children'>) {
    const mat = useMemo(() => {
        const m = material.clone();
        m.transparent = true;
        m.opacity = 0;
        return m;
    }, [material]);
    useEffect(() => () => mat.dispose(), [mat]);
    useFrame(() => {
        const e = draw ? clamp01((draw.current - delay) / Math.max(0.001, 1 - delay)) : 1;
        mat.opacity = e;
    });
    return (
        <group {...groupProps}>
            <mesh geometry={geometry} material={mat} scale={solidScale} />
        </group>
    );
}

/* Small shaded node dot. */
function Dot({
    position,
    mat,
    size = 0.045,
}: {
    position: [number, number, number] | THREE.Vector3;
    mat: THREE.Material;
    size?: number;
}) {
    return (
        <mesh position={position} material={mat}>
            <sphereGeometry args={[size, 12, 12]} />
        </mesh>
    );
}

/* A pulse travelling along a curve, fading at the ends. */
function Pulse({
    curve,
    mat,
    speed = 0.35,
    offset = 0,
    size = 0.045,
}: {
    curve: THREE.Curve<THREE.Vector3>;
    mat: THREE.Material;
    speed?: number;
    offset?: number;
    size?: number;
}) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        const m = ref.current;
        if (!m) return;
        const t = (clock.elapsedTime * speed + offset) % 1;
        m.position.copy(curve.getPoint(t));
        m.scale.setScalar(Math.max(Math.sin(t * Math.PI), 0.001));
    });
    return (
        <mesh ref={ref} material={mat}>
            <sphereGeometry args={[size, 10, 10]} />
        </mesh>
    );
}

/* ---------------------------------------------
   Point-set helpers
   --------------------------------------------- */
function circlePoints(r: number, segments = 72): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    return pts;
}

function arcPoints(r: number, a0: number, a1: number, segments = 40): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
        const a = a0 + ((a1 - a0) * i) / segments;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    return pts;
}

function gearPoints(r: number, teeth: number, depth: number): THREE.Vector3[] {
    const pts: THREE.Vector3[] = [];
    const seg = teeth * 8;
    for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * Math.PI * 2;
        const phase = (i % 8) / 8;
        const outer = phase >= 0.25 && phase < 0.75;
        const rr = r + (outer ? depth : 0);
        pts.push(new THREE.Vector3(Math.cos(a) * rr, Math.sin(a) * rr, 0));
    }
    return pts;
}

function rectPoints(w: number, h: number): THREE.Vector3[] {
    const x = w / 2;
    const y = h / 2;
    return [
        new THREE.Vector3(-x, -y, 0),
        new THREE.Vector3(x, -y, 0),
        new THREE.Vector3(x, y, 0),
        new THREE.Vector3(-x, y, 0),
        new THREE.Vector3(-x, -y, 0),
    ];
}

function latCircle(r: number, lat: number): THREE.Vector3[] {
    const rr = r * Math.cos(lat);
    const y = r * Math.sin(lat);
    return circlePoints(rr).map((p) => new THREE.Vector3(p.x, y, p.y));
}

/* ---------------------------------------------
   Rig: entrance scale, cursor parallax, idle spin
   --------------------------------------------- */
function SceneRig({
    active,
    idleSpeed = 0.09,
    spinAxis = 'y',
    parallax = 'rotate',
    baseRotation = [0, 0, 0] as [number, number, number],
    children,
}: {
    active: boolean;
    idleSpeed?: number;
    spinAxis?: 'y' | 'z';
    parallax?: 'rotate' | 'shift';
    baseRotation?: [number, number, number];
    children: React.ReactNode;
}) {
    const outer = useRef<THREE.Group>(null);
    const inner = useRef<THREE.Group>(null);
    const scale = useRef(0.88);

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05);
        const o = outer.current;
        const i = inner.current;
        if (!o || !i) return;

        // Gentle settle rather than a pop — inactive panels sit only slightly back
        const target = active ? 1 : 0.92;
        scale.current += (target - scale.current) * (1 - Math.exp(-dt * 2.4));
        o.scale.setScalar(scale.current);

        // Cursor parallax is the primary motion, eased so it trails the
        // pointer rather than snapping to it.
        const k = 1 - Math.exp(-dt * 2.6);
        if (parallax === 'shift') {
            // Keep the pose fixed and slide instead, so coplanar parts stay
            // coplanar and cannot intersect.
            o.rotation.set(baseRotation[0], baseRotation[1], baseRotation[2]);
            o.position.x += (pointer.x * 0.11 - o.position.x) * k;
            o.position.y += (pointer.y * 0.08 - o.position.y) * k;
        } else {
            const tx = baseRotation[0] + pointer.y * 0.14;
            const ty = baseRotation[1] + pointer.x * 0.18;
            o.rotation.x += (tx - o.rotation.x) * k;
            o.rotation.y += (ty - o.rotation.y) * k;
            o.rotation.z = baseRotation[2];
        }

        // idleSpeed defaults to 0; where set it is a very slow turntable
        if (idleSpeed) {
            if (spinAxis === 'z') i.rotation.z += dt * idleSpeed;
            else i.rotation.y += dt * idleSpeed;
        }
    });

    return (
        <group ref={outer}>
            <group ref={inner}>{children}</group>
        </group>
    );
}

/* =============================================
   01 Marketing Automation — meshed gear train
   ============================================= */
function AutomationScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const gearA = useRef<THREE.Group>(null);
    const gearB = useRef<THREE.Group>(null);
    const bigGear = useMemo(() => gearPoints(0.52, 9, 0.1), []);
    const smallGear = useMemo(() => gearPoints(0.3, 6, 0.09), []);
    const hubA = useMemo(() => circlePoints(0.16), []);
    const hubB = useMemo(() => circlePoints(0.1), []);
    const hubSolid = useMemo(() => new THREE.CylinderGeometry(0.11, 0.11, 0.09, 24), []);
    const orbit = useMemo(
        () => new THREE.EllipseCurve(-0.32, 0.18, 0.78, 0.78, 0, Math.PI * 2, false, 0),
        []
    );
    const orbitCurve = useMemo(() => {
        const pts = orbit.getPoints(80).map((p) => new THREE.Vector3(p.x, p.y, 0));
        return new THREE.CatmullRomCurve3(pts, true);
    }, [orbit]);

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05);
        if (gearA.current) gearA.current.rotation.z += dt * 0.14;
        if (gearB.current) gearB.current.rotation.z -= dt * 0.21;
    });

    return (
        <SceneRig active={active} idleSpeed={0} baseRotation={[0.32, -0.35, 0]}>
            <group ref={gearA} position={[-0.32, 0.18, 0]}>
                <DrawnLine points={bigGear} color={palette.primary} lineWidth={1.6} draw={draw} />
                <DrawnLine points={hubA} color={palette.line} draw={draw} delay={0.25} />
                <Solid geometry={hubSolid} material={m.chrome} draw={draw} delay={0.3} rotation={[Math.PI / 2, 0, 0]} />
            </group>
            <group ref={gearB} position={[0.52, -0.38, 0]}>
                <DrawnLine points={smallGear} color={palette.accent} lineWidth={1.6} draw={draw} delay={0.15} />
                <DrawnLine points={hubB} color={palette.line} draw={draw} delay={0.35} />
                <Solid geometry={hubSolid} material={m.accent} draw={draw} delay={0.4} solidScale={0.7} rotation={[Math.PI / 2, 0, 0]} />
            </group>
            <Pulse curve={orbitCurve} mat={m.accent} speed={0.07} />
        </SceneRig>
    );
}

/* =============================================
   02 Marketing Communications — broadcast core
   ============================================= */
function CommunicationsScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const core = useMemo(() => new THREE.IcosahedronGeometry(0.42, 0), []);
    const orbitRing = useMemo(() => circlePoints(0.95), []);
    const w1 = useRef<THREE.Group>(null);
    const w2 = useRef<THREE.Group>(null);
    const sats = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
    const wave = useMemo(() => circlePoints(0.55), []);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        [w1.current, w2.current].forEach((g, i) => {
            if (!g) return;
            const p = (t * 0.13 + i * 0.5) % 1;
            g.scale.setScalar(0.7 + p * 1.5);
            // DrawnLine renders <group><Line2/></group> — reach the material
            const mat = (g.children[0]?.children[0] as Line2 | undefined)
                ?.material as LineMaterial | undefined;
            if (mat) mat.opacity = 0.85 * (1 - p);
        });
        sats.forEach((s, i) => {
            const m = s.current;
            if (!m) return;
            const a = t * 0.17 + (i * Math.PI * 2) / 3;
            m.position.set(Math.cos(a) * 0.95, Math.sin(a) * 0.28, Math.sin(a) * 0.6);
        });
    });

    return (
        <SceneRig active={active} idleSpeed={0.11}>
            <Solid geometry={core} material={m.chrome} draw={draw} delay={0.1} />
            <EdgeShape source={core} color={palette.primary} lineWidth={1.6} draw={draw} />
            <group rotation={[Math.PI / 2.3, 0, 0]}>
                <DrawnLine points={orbitRing} color={palette.line} opacity={0.4} draw={draw} delay={0.2} />
            </group>
            {[w1, w2].map((ref, i) => (
                <group key={i} ref={ref} rotation={[Math.PI / 2.3, 0, 0]}>
                    <DrawnLine points={wave} color={palette.accent} lineWidth={1.3} draw={draw} delay={0.3} />
                </group>
            ))}
            {sats.map((ref, i) => (
                <mesh key={`s-${i}`} ref={ref} material={i === 1 ? m.accent : m.chrome}>
                    <sphereGeometry args={[0.05, 10, 10]} />
                </mesh>
            ))}
        </SceneRig>
    );
}

/* =============================================
   03 Strategy — radar array with sweeping needle
   ============================================= */
function StrategyScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const rings = useMemo(() => [circlePoints(0.95), circlePoints(0.62), circlePoints(0.3)], []);
    const needle = useMemo(() => new THREE.OctahedronGeometry(0.16, 0), []);
    const sweep = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (sweep.current) sweep.current.rotation.z -= Math.min(delta, 0.05) * 0.18;
    });

    return (
        <SceneRig active={active} idleSpeed={0} baseRotation={[1.05, 0, 0]}>
            {rings.map((pts, i) => (
                <DrawnLine
                    key={i}
                    points={pts}
                    color={i === 1 ? palette.line : palette.primary}
                    opacity={i === 1 ? 0.55 : 1}
                    draw={draw}
                    delay={i * 0.18}
                />
            ))}
            <group ref={sweep}>
                <Solid
                    geometry={needle}
                    material={m.accent}
                    draw={draw}
                    delay={0.45}
                    position={[0.62, 0, 0.06]}
                    scale={[1.9, 0.7, 0.7]}
                />
                <EdgeShape
                    source={needle}
                    color={palette.accent}
                    lineWidth={1.6}
                    draw={draw}
                    delay={0.4}
                    position={[0.62, 0, 0.06]}
                    scale={[1.9, 0.7, 0.7]}
                />
            </group>
            <Dot position={[0, 0, 0.05]} mat={m.chrome} size={0.07} />
        </SceneRig>
    );
}

/* =============================================
   04 Tech Solutions — terminal cube + scanline
   ============================================= */
function TechScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const outerBox = useMemo(() => new THREE.BoxGeometry(1.45, 1.45, 1.45), []);
    const innerBox = useMemo(() => new THREE.BoxGeometry(0.7, 0.7, 0.7), []);
    const scanRect = useMemo(() => rectPoints(1.45, 1.45), []);
    const scan = useRef<THREE.Group>(null);
    const innerRef = useRef<THREE.Group>(null);
    const corners = useMemo(() => {
        const c = 0.725;
        const out: [number, number, number][] = [];
        for (const x of [-c, c]) for (const y of [-c, c]) for (const z of [-c, c]) out.push([x, y, z]);
        return out;
    }, []);

    useFrame(({ clock }, delta) => {
        const t = clock.elapsedTime;
        if (scan.current) {
            const p = (t * 0.12) % 1;
            scan.current.position.y = -0.72 + p * 1.44;
            const fade = Math.sin(p * Math.PI);
            scan.current.children.forEach((c) => {
                const mat = (c.children[0] as Line2 | undefined)?.material as LineMaterial | undefined;
                if (mat) mat.opacity = fade * 0.9;
            });
        }
        if (innerRef.current) innerRef.current.rotation.y -= Math.min(delta, 0.05) * 0.17;
    });

    return (
        <SceneRig active={active} idleSpeed={0.1}>
            <EdgeShape source={outerBox} color={palette.primary} lineWidth={1.7} draw={draw} />
            <group ref={innerRef}>
                <Solid geometry={innerBox} material={m.chrome} draw={draw} delay={0.3} />
                <EdgeShape source={innerBox} color={palette.line} opacity={0.75} draw={draw} delay={0.25} />
            </group>
            <group ref={scan} rotation={[0, 0, 0]}>
                <DrawnLine
                    points={scanRect}
                    color={palette.accent}
                    lineWidth={1.8}
                    draw={draw}
                    delay={0.45}
                    rotation={[-Math.PI / 2, 0, 0]}
                />
            </group>
            {corners.map((p, i) => (
                <Dot key={i} position={p} mat={i % 3 === 0 ? m.accent : m.chrome} size={0.035} />
            ))}
        </SceneRig>
    );
}

/* =============================================
   05 AI Solutions — neural constellation
   ============================================= */
function AiScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const shell = useMemo(() => new THREE.DodecahedronGeometry(1.05, 0), []);

    const nodes = useMemo(() => {
        const n: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)];
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + 0.5;
            n.push(new THREE.Vector3(Math.cos(a) * 0.48, (i % 2 ? 1 : -1) * 0.16, Math.sin(a) * 0.48));
        }
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            n.push(
                new THREE.Vector3(Math.cos(a) * 0.85, (i % 2 ? -1 : 1) * 0.34, Math.sin(a) * 0.85)
            );
        }
        return n;
    }, []);

    const links = useMemo(
        () =>
            [
                [0, 1], [0, 2], [0, 3], [0, 4],
                [1, 5], [1, 6], [2, 7], [2, 8], [3, 9], [3, 10], [4, 5], [4, 10],
            ] as [number, number][],
        []
    );

    const signals = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
    const signalState = useRef(
        [0, 4, 8].map((l) => ({ link: l, t: Math.random() }))
    );

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05);
        signals.forEach((s, i) => {
            const m = s.current;
            const st = signalState.current[i];
            if (!m) return;
            st.t += dt * 0.4;
            if (st.t >= 1) {
                st.t = 0;
                st.link = (st.link + 1 + ((i * 5) % 3)) % links.length;
            }
            const [a, b] = links[st.link];
            m.position.lerpVectors(nodes[a], nodes[b], st.t);
            m.scale.setScalar(Math.max(Math.sin(st.t * Math.PI), 0.001));
        });
    });

    return (
        <SceneRig active={active} idleSpeed={0.08}>
            <EdgeShape source={shell} color={palette.primary} opacity={0.45} draw={draw} />
            {links.map(([a, b], i) => (
                <DrawnLine
                    key={i}
                    points={[nodes[a], nodes[b]]}
                    color={palette.line}
                    lineWidth={1.2}
                    opacity={0.8}
                    draw={draw}
                    delay={0.15 + (i % 4) * 0.1}
                />
            ))}
            {nodes.map((p, i) => (
                <Dot
                    key={`n-${i}`}
                    position={p}
                    mat={i === 0 ? m.accent : m.chrome}
                    size={i === 0 ? 0.09 : 0.045}
                />
            ))}
            {signals.map((ref, i) => (
                <mesh key={`sig-${i}`} ref={ref} material={m.accent}>
                    <sphereGeometry args={[0.05, 10, 10]} />
                </mesh>
            ))}
        </SceneRig>
    );
}

/* =============================================
   06 Social Media — globe with flight arcs
   ============================================= */
function SocialScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const lats = useMemo(() => [latCircle(0.7, 0), latCircle(0.7, 0.62), latCircle(0.7, -0.62)], []);
    const lon = useMemo(() => circlePoints(0.7), []);

    const arcs = useMemo(() => {
        const surface = (lat: number, lonA: number) =>
            new THREE.Vector3(
                0.7 * Math.cos(lat) * Math.cos(lonA),
                0.7 * Math.sin(lat),
                0.7 * Math.cos(lat) * Math.sin(lonA)
            );
        const pairs: [THREE.Vector3, THREE.Vector3][] = [
            [surface(0.5, 0.3), surface(-0.3, 2.4)],
            [surface(-0.55, 0.9), surface(0.35, 3.6)],
            [surface(0.15, 1.8), surface(0.55, 4.8)],
        ];
        return pairs.map(([a, b]) => {
            const mid = a.clone().add(b).normalize().multiplyScalar(1.15);
            return new THREE.CatmullRomCurve3([a, mid, b]);
        });
    }, []);

    return (
        <SceneRig active={active} idleSpeed={0.1}>
            {lats.map((pts, i) => (
                <DrawnLine key={i} points={pts} color={palette.primary} opacity={0.5} draw={draw} delay={i * 0.12} />
            ))}
            <DrawnLine points={lon} color={palette.primary} opacity={0.5} draw={draw} delay={0.1} rotation={[0, 0.6, Math.PI / 2]} />
            {arcs.map((curve, i) => (
                <group key={`a-${i}`}>
                    <DrawnLine
                        points={curve.getPoints(36)}
                        color={palette.accent}
                        lineWidth={1.3}
                        opacity={0.9}
                        draw={draw}
                        delay={0.35 + i * 0.12}
                    />
                    <Pulse curve={curve} mat={m.accent} speed={0.12} offset={i * 0.33} />
                    <Dot position={curve.getPoint(0)} mat={m.chrome} size={0.04} />
                    <Dot position={curve.getPoint(1)} mat={m.chrome} size={0.04} />
                </group>
            ))}
        </SceneRig>
    );
}

/* =============================================
   07 Public Relations — signal cone + wavefronts
   ============================================= */
function PrScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const cone = useMemo(() => new THREE.ConeGeometry(0.4, 0.85, 6, 1, true), []);
    const waveArc = useMemo(() => arcPoints(0.5, -0.9, 0.9), []);
    const waves = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        waves.forEach((w, i) => {
            const g = w.current;
            if (!g) return;
            const p = (t * 0.15 + i * 0.33) % 1;
            g.position.x = 0.1 + p * 1.0;
            g.scale.setScalar(0.55 + p * 1.0);
            const mat = (g.children[0]?.children[0] as Line2 | undefined)?.material as LineMaterial | undefined;
            if (mat) mat.opacity = 0.9 * (1 - p);
        });
    });

    return (
        <SceneRig active={active} idleSpeed={0.07} baseRotation={[0.15, 0, 0]}>
            <group position={[-0.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <Solid geometry={cone} material={m.ink} draw={draw} delay={0.1} />
                <EdgeShape source={cone} color={palette.primary} lineWidth={1.6} draw={draw} />
            </group>
            <Dot position={[-0.12, 0, 0]} mat={m.accent} size={0.055} />
            {waves.map((ref, i) => (
                <group key={i} ref={ref}>
                    <DrawnLine points={waveArc} color={palette.accent} lineWidth={1.4} draw={draw} delay={0.3 + i * 0.1} />
                </group>
            ))}
        </SceneRig>
    );
}

/* =============================================
   08 LMS — page stack with flipping top sheet
   ============================================= */
function LmsScene({ active, palette }: SceneProps) {
    const draw = useDraw(active);
    const m = useMatcaps(palette);
    const sheet = useMemo(() => new THREE.BoxGeometry(1.15, 0.045, 0.85), []);
    const cap = useMemo(() => new THREE.TetrahedronGeometry(0.16, 0), []);
    const layers = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
    const capRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        layers.forEach((l, i) => {
            const g = l.current;
            if (!g) return;
            g.position.y = (i - 1.5) * 0.28 + Math.sin(t * 0.42 + i * 0.7) * 0.035;
            if (i === 3) {
                // occasional page flip on the top sheet
                const cycle = (t * 0.13) % 4;
                g.rotation.x = cycle < 1 ? -Math.sin(cycle * Math.PI) * 0.5 : 0;
            }
        });
        if (capRef.current) {
            capRef.current.position.y = 0.92 + Math.sin(t * 0.5) * 0.04;
            capRef.current.rotation.y = t * 0.16;
        }
    });

    return (
        <SceneRig active={active} idleSpeed={0.09} baseRotation={[0.35, 0, 0]}>
            {layers.map((ref, i) => (
                <group key={i} ref={ref} position={[0, (i - 1.5) * 0.28, 0]} rotation={[0, i * 0.16, 0]}>
                    {/* Real sheet thickness — flat outlines read as empty */}
                    <Solid
                        geometry={sheet}
                        material={i === 3 ? m.accent : m.ink}
                        draw={draw}
                        delay={0.1 + i * 0.14}
                    />
                    <EdgeShape
                        source={sheet}
                        color={i === 3 ? palette.accent : palette.primary}
                        opacity={0.5 + i * 0.16}
                        draw={draw}
                        delay={i * 0.14}
                    />
                </group>
            ))}
            <group ref={capRef} position={[0, 0.92, 0]}>
                <Solid geometry={cap} material={m.accent} draw={draw} delay={0.55} />
                <EdgeShape source={cap} color={palette.accent} draw={draw} delay={0.5} />
            </group>
        </SceneRig>
    );
}

/* =============================================
   Imported CC0 glTF models (Poly Haven)
   Used where the service maps to a real object.
   The abstract services keep their procedural
   scenes below — those read better as diagrams
   than as props.
   ============================================= */
type ModelConfig = {
    url: string;
    /** largest dimension in world units after normalisation */
    fit: number;
    tilt?: [number, number, number];
    /** idle turn in rad/sec — kept very slow */
    spin?: number;
    /** which axis the idle turn uses; 'z' for things that face the camera */
    spinAxis?: 'y' | 'z';
    /** named nodes to spin against each other about world Z (meshing gears) */
    counterRotate?: { names: [string, string]; speed: number };
    /** recolour those nodes in brand primary / accent metal */
    tintWheels?: boolean;
    /** amplitude of a slow vertical drift, in world units */
    float?: number;
    /**
     * How the cursor drives the model. 'rotate' tips it toward the pointer;
     * 'shift' slides it instead — needed for coplanar parts (meshing gears),
     * where any tilt makes them pass through one another.
     */
    parallax?: 'rotate' | 'shift';
};

/* Orientation policy: trust the model's authored pose and add NO rotation —
   these assets already carry the right root transform. Only assets that lie
   genuinely flat (thin axis Y, so they'd render edge-on) get stood up. Tilts
   are measured from world-space bounding boxes with node transforms applied.
   Nothing spins; the only motion is cursor parallax. */
const MODELS: Record<string, ModelConfig> = {
    // Gears face the camera (thin axis Z), so they turn about world Z — and
    // the two meshing wheels turn against each other.
    'marketing-automation': {
        url: '/models/gear.glb',
        fit: 2.0,
        // three-quarter view so the teeth and rim thickness read as solid
        // rather than as flat silhouettes. Safe now that both wheels are
        // coplanar siblings with clearance — a shared tilt cannot make them
        // intersect, unlike their original mismatched rotations.
        tilt: [0.42, -0.36, 0],
        counterRotate: { names: ['Gear', 'GearRust'], speed: 0.055 },
        tintWheels: true,
    },
    // world [0.618, 0.434, 0.418] — upright; slight turn for a 3/4 read
    'marketing-communications': {
        url: '/models/radio_transceiver.glb',
        fit: 1.95,
        tilt: [0, -0.22, 0],
        spin: 0.035,
    },
    // tipped forward so the open dial face reads from above
    strategy: { url: '/models/compass.glb', fit: 1.85, tilt: [0.6, -0.25, 0], spin: 0.035 },
    // low, near-side-on viewing angle with a slight isometric lean
    'tech-solutions': {
        url: '/models/circuit_board.glb',
        fit: 2.1,
        tilt: [0.3, -0.2, 0],
        spin: 0.05,
    },
    // faces -X, so +90deg Y turns the front to camera. fit pulled in from 2.3
    // because the frame only shows ~2.15 units vertically and it was clipping.
    'ai-solutions': {
        url: '/models/robot.glb',
        fit: 1.7,
        tilt: [0, 1.5708, 0],
        spin: 0.055,
        float: 0.03,
    },
    // body stands upright — the wide flat footprint is the STRAP, not the
    // camera lying down. Lens points +Z, so zero tilt faces the viewer.
    'social-media': { url: '/models/camera.glb', fit: 1.95, tilt: [0, 0, 0], spin: 0.04 },
    // horn mouth is the wide end at -X, so a POSITIVE Y turn opens it up
    pr: { url: '/models/megaphone.glb', fit: 2.0, tilt: [0, 0.65, 0], spin: 0.03 },
    // flatter, lower viewing angle than face-on
    lms: { url: '/models/notebook.glb', fit: 1.9, tilt: [0.6, -0.18, 0], spin: 0.045 },
};

/* Auto-centres and rescales any model to a consistent on-screen size, so
   real-world glTF scale and arbitrary origins don't need hand-tuning. */
const WORLD_Z = new THREE.Vector3(0, 0, 1);

/* Recolour a texture into a brand hue while keeping its detail: every pixel's
   luminance is preserved as a brightness ramp over the target colour. Beats
   material.color (which only multiplies, so a near-black source stays black)
   and beats dropping the map (which loses the cast-metal grain entirely). */
function tintedTexture(src: THREE.Texture | null, hex: string): THREE.Texture | null {
    const img = src?.image as HTMLImageElement | ImageBitmap | undefined;
    if (!img || !('width' in img) || !img.width) return null;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img as CanvasImageSource, 0, 0);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = frame.data;
    const col = new THREE.Color(hex);

    for (let i = 0; i < px.length; i += 4) {
        const lum = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
        // lift the dark source so the hue reads, but keep relative variation
        const k = 0.5 + lum * 1.25;
        px[i] = Math.min(255, col.r * 255 * k);
        px[i + 1] = Math.min(255, col.g * 255 * k);
        px[i + 2] = Math.min(255, col.b * 255 * k);
    }
    ctx.putImageData(frame, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    // glTF textures load with flipY false — match it or the map lands upside down
    tex.flipY = src ? src.flipY : false;
    if (src) {
        tex.wrapS = src.wrapS;
        tex.wrapT = src.wrapT;
    }
    tex.needsUpdate = true;
    return tex;
}

function NormalizedModel({ cfg, palette }: { cfg: ModelConfig; palette: ScenePalette }) {
    const { scene } = useGLTF(cfg.url);

    const object = useMemo(() => {
        const root = scene.clone(true);

        /* The gear file's two wheels carry DIFFERENT rotation quaternions, so
           they are not coplanar and interpenetrate. Rebuild their placement
           from scratch: strip the inherited tilt, turn each wheel's thin axis
           to face the camera, centre it on its own pivot, then set them
           side by side with a small clearance so they can never intersect. */
        if (cfg.counterRotate) {
            const found = cfg.counterRotate.names
                .map((n) => root.getObjectByName(n))
                .filter((o): o is THREE.Object3D => Boolean(o));

            if (found.length === 2) {
                const holder = new THREE.Group();
                const wheels = found.map((w) => {
                    holder.add(w); // reparent: drops the tilted parent chain
                    w.position.set(0, 0, 0);
                    w.quaternion.identity();
                    w.updateMatrixWorld(true);

                    // face the disc at the camera by putting its thin axis on Z
                    const s = new THREE.Box3().setFromObject(w).getSize(new THREE.Vector3());
                    if (s.x <= s.y && s.x <= s.z) w.rotateY(Math.PI / 2);
                    else if (s.y <= s.x && s.y <= s.z) w.rotateX(Math.PI / 2);
                    w.updateMatrixWorld(true);

                    // centre on its own hub so it spins in place, not in an orbit
                    const box2 = new THREE.Box3().setFromObject(w);
                    w.position.sub(box2.getCenter(new THREE.Vector3()));
                    const size2 = box2.getSize(new THREE.Vector3());
                    return { obj: w, radius: Math.max(size2.x, size2.y) / 2 };
                });

                // 3% clearance — adjacent, never overlapping
                const span = (wheels[0].radius + wheels[1].radius) * 1.03;
                wheels[0].obj.position.x -= span / 2;
                wheels[1].obj.position.x += span / 2;
                root.add(holder);

                /* The source wheels are near-black and rusty, which reads as a
                   dead silhouette. Drop the albedo map but keep the normal and
                   roughness detail, so each wheel becomes brand-coloured metal
                   that still shows its cast surface. Materials are cloned
                   because useGLTF caches and shares them. */
                if (cfg.tintWheels) {
                    wheels.forEach(({ obj }, i) => {
                        obj.traverse((o) => {
                            const mesh = o as THREE.Mesh;
                            if (!mesh.isMesh) return;
                            const src = mesh.material as THREE.MeshStandardMaterial;
                            const m = src.clone();
                            // real metal so the environment gives it form
                            m.metalness = 0.85;
                            m.roughness = 0.3;
                            m.envMapIntensity = 1.5;
                            mesh.material = m;
                            mesh.userData.wheel = i;
                            // keep the original albedo to re-tint from
                            mesh.userData.srcMap = src.map ?? null;
                        });
                    });
                }
            }
        }

        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const largest = Math.max(size.x, size.y, size.z) || 1;
        const s = cfg.fit / largest;
        root.scale.setScalar(s);
        root.position.set(-center.x * s, -center.y * s, -center.z * s);

        const wrapper = new THREE.Group();
        wrapper.add(root);
        return wrapper;
    }, [scene, cfg.fit, cfg.counterRotate, cfg.tintWheels]);

    // Re-applied on theme change: primary on one wheel, accent on the other.
    // The albedo is recoloured pixel-wise, so the cast grain survives.
    useEffect(() => {
        if (!cfg.tintWheels) return;
        const generated: THREE.Texture[] = [];

        object.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh || mesh.userData.wheel === undefined) return;
            const m = mesh.material as THREE.MeshStandardMaterial;
            const hex = mesh.userData.wheel === 0 ? palette.primary : palette.accent;
            const tex = tintedTexture(mesh.userData.srcMap as THREE.Texture | null, hex);
            if (tex) {
                m.map = tex;
                m.color.set('#ffffff');
                generated.push(tex);
            } else {
                m.map = null;
                m.color.set(hex);
            }
            m.needsUpdate = true;
        });

        return () => generated.forEach((t) => t.dispose());
    }, [object, palette, cfg.tintWheels]);

    // Meshing wheels: spin each named node about the world axis facing the
    // viewer, in opposite directions and at rates that differ like real gears.
    const wheels = useMemo(() => {
        if (!cfg.counterRotate) return null;
        const found = cfg.counterRotate.names
            .map((n) => object.getObjectByName(n))
            .filter((o): o is THREE.Object3D => Boolean(o));
        return found.length ? found : null;
    }, [object, cfg.counterRotate]);

    // Local, monotonic time. The shared canvas is advanced manually, so the
    // global clock can hand back uneven deltas — reading it directly made the
    // float jitter. Accumulating a clamped, non-negative delta keeps it smooth.
    const t = useRef(0);

    useFrame((_, delta) => {
        const dt = Math.max(0, Math.min(delta, 0.05));
        t.current += dt;

        if (wheels && cfg.counterRotate) {
            const base = cfg.counterRotate.speed;
            wheels.forEach((w, i) => {
                w.rotateOnWorldAxis(WORLD_Z, dt * (i === 0 ? base : -base * 1.35));
            });
        }
        if (cfg.float) {
            // ~18s cycle — a slow drift, not a bob
            object.position.y = Math.sin(t.current * 0.35) * cfg.float;
        }
    });

    return <primitive object={object} />;
}

/* Studio rig: a key light plus brand-tinted fill and rim, and a small
   procedural environment so the scanned metal and plastic actually reflect
   something. No external HDRI needed. */
function StudioLighting({ palette }: { palette: ScenePalette }) {
    const isDark = palette.name === 'dark';
    return (
        <>
            <ambientLight intensity={isDark ? 0.85 : 1.6} />
            {/* key light: high and to the right, angled in toward the viewer */}
            <directionalLight position={[6, 6.5, 4.5]} intensity={isDark ? 3.6 : 4} />
            {/* soft top-right bounce so highlights don't collapse to one spot */}
            <pointLight position={[4.5, 4, 3]} intensity={isDark ? 26 : 18} distance={16} />
            <pointLight
                position={[-4, 1.5, 3]}
                intensity={isDark ? 18 : 12}
                color={palette.primary}
                distance={14}
            />
            <pointLight
                position={[2.5, -2.5, -3]}
                intensity={isDark ? 14 : 9}
                color={palette.accent}
                distance={14}
            />
            <Environment resolution={256} frames={1}>
                {/* large soft source upper-right — the dominant reflection */}
                <Lightformer
                    form="rect"
                    intensity={3.4}
                    position={[3.5, 4, 2.5]}
                    rotation={[-0.4, 0.5, 0]}
                    scale={[8, 4, 1]}
                />
                <Lightformer
                    form="rect"
                    intensity={1.5}
                    color={palette.primary}
                    position={[-4.5, 0, 2]}
                    rotation={[0, Math.PI / 2, 0]}
                    scale={[5, 5, 1]}
                />
                <Lightformer
                    form="rect"
                    intensity={1}
                    color={palette.accent}
                    position={[4.5, -1, -2]}
                    rotation={[0, -Math.PI / 2, 0]}
                    scale={[5, 5, 1]}
                />
            </Environment>
        </>
    );
}

function ModelScene({ active, palette, cfg }: SceneProps & { cfg: ModelConfig }) {
    return (
        <>
            <StudioLighting palette={palette} />
            <SceneRig
                active={active}
                idleSpeed={cfg.spin ?? 0}
                spinAxis={cfg.spinAxis ?? 'y'}
                parallax={cfg.parallax ?? 'rotate'}
                baseRotation={cfg.tilt ?? [0, 0, 0]}
            >
                <NormalizedModel cfg={cfg} palette={palette} />
            </SceneRig>
        </>
    );
}

const SCENES: Record<string, (p: SceneProps) => React.ReactElement> = {
    'marketing-automation': AutomationScene,
    'marketing-communications': CommunicationsScene,
    strategy: StrategyScene,
    'tech-solutions': TechScene,
    'ai-solutions': AiScene,
    'social-media': SocialScene,
    pr: PrScene,
    lms: LmsScene,
};

/* View wrapper placed inside each panel's visual third. */
export function ServiceSceneView({
    id,
    active,
    className,
}: {
    id: string;
    active: boolean;
    className?: string;
}) {
    const [palette, setPalette] = useState<ScenePalette>(DARK_PALETTE);

    useEffect(() => {
        const apply = () =>
            setPalette(
                document.documentElement.getAttribute('data-theme') === 'light'
                    ? LIGHT_PALETTE
                    : DARK_PALETTE
            );
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

    // Defer mounting until the panel is roughly a viewport away, so the
    // glTF payloads are fetched on approach rather than at first paint.
    const host = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const el = host.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setReady(true);
                    io.disconnect();
                }
            },
            { rootMargin: '100% 100%' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const model = MODELS[id];
    const Scene = SCENES[id] ?? AutomationScene;

    return (
        <div ref={host} className={className}>
            <View style={{ width: '100%', height: '100%' }}>
                {ready ? (
                    <Suspense fallback={null}>
                        {model ? (
                            <ModelScene active={active} palette={palette} cfg={model} />
                        ) : (
                            <Scene active={active} palette={palette} />
                        )}
                    </Suspense>
                ) : null}
            </View>
        </div>
    );
}

/* The single shared canvas — one WebGL context for every scene. */
export function SharedServicesCanvas() {
    const [dpr, setDpr] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const sync = () => {
            setIsMobile(mq.matches);
            setDpr(Math.min(window.devicePixelRatio, mq.matches ? 1.5 : 2));
        };
        sync();
        mq.addEventListener('change', sync);

        const onMove = (e: PointerEvent) => {
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', onMove, { passive: true });

        // Render sync: drive r3f manually from GSAP's ticker, registered one
        // frame late so it runs AFTER Lenis has applied this frame's scroll.
        // Every render then measures panel rects that are already final —
        // the scenes can never trail the cards vertically. Skips entirely
        // while the services section is out of view.
        const section = hostRef.current?.closest('section') ?? null;
        const tick = (time: number) => {
            if (section) {
                const r = section.getBoundingClientRect();
                if (r.bottom < -300 || r.top > window.innerHeight + 300) return;
            }
            advance(time * 1000);
        };
        let added = false;
        const raf = requestAnimationFrame(() => {
            gsap.ticker.add(tick);
            added = true;
        });

        return () => {
            mq.removeEventListener('change', sync);
            window.removeEventListener('pointermove', onMove);
            cancelAnimationFrame(raf);
            if (added) gsap.ticker.remove(tick);
        };
    }, []);

    return (
        // Fixed overlay: keeps the canvas origin static (drei View caches it),
        // while the manual GSAP-ticker render above keeps per-frame panel
        // tracking exact. Together: scenes stay locked to their cards.
        <div
            ref={hostRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 4,
            }}
        >
            <Canvas
                gl={{ alpha: true, antialias: !isMobile, powerPreference: 'high-performance' }}
                dpr={dpr}
                camera={{ position: [0, 0, 2.8], fov: 42 }}
                frameloop="never"
                style={{ pointerEvents: 'none' }}
            >
                <View.Port />
            </Canvas>
        </div>
    );
}
