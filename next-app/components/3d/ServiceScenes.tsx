'use client';

import { MutableRefObject, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { advance, Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber';
import { Environment, Lightformer, useGLTF, View } from '@react-three/drei';
import { Line2, LineGeometry, LineMaterial, LineSegments2, LineSegmentsGeometry } from 'three-stdlib';
import { clone as cloneSkinned, retargetClip } from 'three/examples/jsm/utils/SkeletonUtils.js';
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

/* Every mounted view registers its host element so the shared canvas can skip
   rendering entirely when none of them is anywhere near the viewport. */
const viewHosts = new Set<HTMLElement>();

/* Maps this avatar's Mixamo-style skeleton onto the Rigify skeleton used by
   Quaternius' CC0 animation library, so its walk cycle can be retargeted.
   Keys are the Mixamo base names; the avatar suffixes them with an index
   (Hips_53, LeftUpLeg_3), which is resolved at runtime. Fingers are left
   unmapped — they simply hold their rest pose, which reads fine at this size. */
const WALK_BONE_MAP: Record<string, string> = {
    Hips: 'DEF-hips',
    Spine: 'DEF-spine001',
    Spine1: 'DEF-spine002',
    Spine2: 'DEF-spine003',
    Neck: 'DEF-neck',
    Head: 'DEF-head',
    LeftShoulder: 'DEF-shoulderL',
    LeftArm: 'DEF-upper_armL',
    LeftForeArm: 'DEF-forearmL',
    LeftHand: 'DEF-handL',
    RightShoulder: 'DEF-shoulderR',
    RightArm: 'DEF-upper_armR',
    RightForeArm: 'DEF-forearmR',
    RightHand: 'DEF-handR',
    LeftUpLeg: 'DEF-thighL',
    LeftLeg: 'DEF-shinL',
    LeftFoot: 'DEF-footL',
    LeftToeBase: 'DEF-toeL',
    RightUpLeg: 'DEF-thighR',
    RightLeg: 'DEF-shinR',
    RightFoot: 'DEF-footR',
    RightToeBase: 'DEF-toeR',
};

/* The avatar is split into many skinned meshes (body, hair, eyes, teeth,
   shoes...). Some are bound to only a handful of bones, so retargeting against
   the first one found yields a clip covering almost no joints. Always pick the
   mesh carrying the fullest skeleton. */
function richestSkinnedMesh(root: THREE.Object3D): THREE.SkinnedMesh | null {
    let best: THREE.SkinnedMesh | null = null;
    root.traverse((o) => {
        const sm = o as THREE.SkinnedMesh;
        if (!sm.isSkinnedMesh || !sm.skeleton) return;
        if (!best || sm.skeleton.bones.length > best.skeleton.bones.length) best = sm;
    });
    return best;
}

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
type CastEntry = {
    url: string;
    skinned?: boolean;
    animSpeed?: number;
    offset?: [number, number, number];
    rotation?: [number, number, number];
    /** relative size once every figure has been normalised to one height */
    scale?: number;
};

type ModelConfig = {
    url: string;
    /** largest dimension in world units after normalisation */
    fit: number;
    tilt?: [number, number, number];
    /** idle turn in rad/sec — kept very slow */
    spin?: number;
    /** which axis the idle turn uses; 'z' for things that face the camera */
    spinAxis?: 'y' | 'z';
    /** play the model's own baked animation clips */
    animated?: boolean;
    /** playback rate for those clips (1 = authored speed) */
    animSpeed?: number;
    /** recolour each part in brand primary, with accent on every third */
    tintAlternate?: boolean;
    /** move one hue band of the albedo onto a brand colour; optionally only
     *  on the named material */
    hueShift?: { from: number; tol: number; to: 'primary' | 'accent'; material?: string };
    /** extra overhead light, for models whose detail is on an upward face */
    faceLight?: number;
    /** rigged mesh — must be deep-cloned with the skeleton, not Object3D.clone */
    skinned?: boolean;
    /** borrow a clip from another rig and retarget it onto this skeleton */
    retargetFrom?: string;
    /** several models staged together in one view, each with its own clip */
    cast?: CastEntry[];
    /** run the clip once when the card activates instead of looping */
    playOnActive?: boolean;
    /** restyle materials by name: colour, drop the albedo, set metal/rough */
    materialOverrides?: Record<
        string,
        {
            color?: 'primary' | 'accent' | string;
            dropMap?: boolean;
            metalness?: number;
            roughness?: number;
        }
    >;
    /**
     * Size the model by the outline it projects once `tilt` is applied, rather
     * than by its authored extent. Needed for anything tipped steeply out of
     * plane, which otherwise renders larger than the fit assumed.
     */
    fitPose?: boolean;
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
    /* ---- Core Pillars (capabilities cards) ---- */

    // world [1.75, 1.84, 0.37] — upright, depth is the thin axis so he already
    // faces the camera. Rigged, with an idle clip that loops.
    'manufacturing-recruitment': {
        url: '/models/man_suit.glb',
        fit: 2.35,
        tilt: [0, 0.08, 0],
        skinned: true,
        animated: true,
        animSpeed: 0.7,
        /* Three figures staged as a group: the suited man front and centre,
           the other two set back and angled slightly inward. Each plays the
           idle it shipped with, at marginally different rates so they don't
           breathe in lockstep. */
        cast: [
            // front and centre, full size
            {
                url: '/models/man_suit.glb',
                skinned: true,
                animSpeed: 0.7,
                offset: [0, 0, 0.7],
                scale: 1,
            },
            // set back and angled in, smaller so the depth reads clearly
            {
                url: '/models/businessman.glb',
                skinned: true,
                animSpeed: 0.62,
                offset: [-0.78, 0, -0.5],
                rotation: [0, 0.32, 0],
                scale: 0.78,
            },
            {
                url: '/models/woman_saree.glb',
                skinned: true,
                animSpeed: 0.55,
                offset: [0.8, 0, -0.5],
                rotation: [0, -0.32, 0],
                scale: 0.78,
            },
        ],
        /* Plays the avatar's own idle. A CC0 walk (Quaternius Walk_Formal_Loop)
           sits at /models/walk_formal.glb and the retarget path below is
           wired up, but Rigify -> Mixamo retargeting still resolves to the
           bind pose, so it is left off rather than shipping a T-pose. Set
           retargetFrom to re-enable once that is solved — or drop in a clip
           authored on this avatar's own rig, which needs no retargeting. */
    },
    // world [0.82, 0.28, 0.30] — sits flat like a deck; look down on it a
    // little. Its single clip rotates the lid open, so it plays once when the
    // card arrives rather than looping.
    'manufacturing-digital-transformation': {
        url: '/models/computer.glb',
        fit: 2.25,
        tilt: [0.5, -0.5, 0],
        animated: true,
        animSpeed: 0.6,
        playOnActive: true,
    },
    // Pole becomes blue metal and the cloth plain brand orange: the albedo
    // (the stars and stripes) is dropped so only the flat colour remains.
    'marketing-sales-strategy': {
        url: '/models/flag.glb',
        fit: 2.25,
        tilt: [0, -0.45, 0],
        skinned: true,
        animated: true,
        animSpeed: 0.5,
        materialOverrides: {
            Flag_Mat: { color: 'accent', dropMap: true, metalness: 0.05, roughness: 0.62 },
            Flag_Pole_Mat: { color: 'primary', metalness: 0.85, roughness: 0.25 },
        },
    },
    // The label art is cyan (measured: hue 180-195 dominates), shifted onto
    // brand blue while keeping the print detail and the glass transmission.
    'digital-product-marketing': {
        url: '/models/medicine.glb',
        fit: 2.25,
        tilt: [0, -0.3, 0],
        spin: 0.05,
        hueShift: { from: 187, tol: 42, to: 'primary' },
    },

    /* ---- Services panels ---- */

    // Animated gear train (world [1.83, 1.58, 2.09] — a 3D cluster, not a flat
    // plate). Its own clip turns eight gears on their own axles, so no manual
    // rotation is needed; timeScale holds it to a slow churn.
    'marketing-automation': {
        url: '/models/gears.glb',
        // pulled in so the whole train clears the frame at any panel aspect
        fit: 2.25,
        // strong top-down so the train is read from above, with a slight turn
        // for depth
        tilt: [1.05, -0.3, 0],
        // that tilt swings the train's silhouette well past its authored
        // extent, so measure the tipped outline or it overflows the panel
        fitPose: true,
        animated: true,
        // 3.33s clip at a third speed -> a full turn about every 10 seconds.
        // Slow enough to read as a churn, fast enough to be visibly moving.
        animSpeed: 0.33,
        tintAlternate: true,
    },
    // world [0.618, 0.434, 0.418] — upright; slight turn for a 3/4 read
    'marketing-communications': {
        url: '/models/radio_transceiver.glb',
        fit: 2.25,
        tilt: [0, -0.22, 0],
        spin: 0.035,
    },
    // tipped forward so the open dial face reads from above
    // tipped forward so the dial reads; lit from overhead so the face is bright
    strategy: {
        url: '/models/compass.glb',
        fit: 2.25,
        tilt: [0.6, -0.25, 0],
        spin: 0.035,
        faceLight: 30,
    },
    // low, near-side-on viewing angle with a slight isometric lean
    'tech-solutions': {
        url: '/models/circuit_board.glb',
        fit: 2.25,
        tilt: [0.3, -0.2, 0],
        spin: 0.05,
    },
    // faces -X, so +90deg Y turns the front to camera. fit pulled in from 2.3
    // because the frame only shows ~2.15 units vertically and it was clipping.
    'ai-solutions': {
        url: '/models/robot.glb',
        fit: 2.25,
        tilt: [0, 1.5708, 0],
        spin: 0.055,
        float: 0.03,
    },
    // body stands upright — the wide flat footprint is the STRAP, not the
    // camera lying down. Lens points +Z, so zero tilt faces the viewer.
    'social-media': { url: '/models/camera.glb', fit: 2.25, tilt: [0, 0, 0], spin: 0.04 },
    // horn mouth is the wide end at -X, so a POSITIVE Y turn opens it up
    // red shell -> brand orange; the grey horn and all detail maps are untouched
    pr: {
        url: '/models/megaphone.glb',
        fit: 2.25,
        tilt: [0, 0.65, 0],
        spin: 0.03,
        hueShift: { from: 0, tol: 30, to: 'accent' },
    },
    // flatter, lower viewing angle than face-on
    lms: { url: '/models/notebook.glb', fit: 2.25, tilt: [0.6, -0.18, 0], spin: 0.045 },
};

/* Shift one hue band of a texture to a brand colour, leaving every other pixel
   alone. Used to turn the megaphone's red shell brand-orange without touching
   its grey horn, its shading, or its normal/roughness maps. */
function hueShiftedTexture(
    src: THREE.Texture | null,
    fromHue: number,
    tolerance: number,
    toHex: string
): THREE.Texture | null {
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
    const targetHsl = { h: 0, s: 0, l: 0 };
    new THREE.Color(toHex).getHSL(targetHsl);
    const probe = new THREE.Color();
    const hsl = { h: 0, s: 0, l: 0 };

    for (let i = 0; i < px.length; i += 4) {
        probe.setRGB(px[i] / 255, px[i + 1] / 255, px[i + 2] / 255);
        probe.getHSL(hsl);
        // hue distance on the colour wheel, in degrees
        const deg = hsl.h * 360;
        const delta = Math.min(Math.abs(deg - fromHue), 360 - Math.abs(deg - fromHue));
        // saturation gate keeps greys, blacks and whites untouched
        if (delta > tolerance || hsl.s < 0.22) continue;

        // Blend saturation and lightness toward the brand colour too. Keeping
        // the source lightness alone just turns dark red into dark orange,
        // which still reads as red; the per-pixel value still contributes, so
        // shading and highlights survive.
        probe.setHSL(
            targetHsl.h,
            THREE.MathUtils.lerp(hsl.s, targetHsl.s, 0.6),
            THREE.MathUtils.lerp(hsl.l, targetHsl.l, 0.45)
        );
        px[i] = probe.r * 255;
        px[i + 1] = probe.g * 255;
        px[i + 2] = probe.b * 255;
    }
    ctx.putImageData(frame, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    // glTF textures load with flipY false — match it or the map lands inverted
    tex.flipY = src ? src.flipY : false;
    if (src) {
        tex.wrapS = src.wrapS;
        tex.wrapT = src.wrapT;
    }
    tex.needsUpdate = true;
    return tex;
}

/* Auto-centres and rescales any model to a consistent on-screen size, so
   real-world glTF scale and arbitrary origins don't need hand-tuning. */

function NormalizedModel({
    cfg,
    palette,
    active,
}: {
    cfg: ModelConfig;
    palette: ScenePalette;
    active: boolean;
}) {
    const { scene, animations } = useGLTF(cfg.url);
    const size = useThree((s) => s.size);
    const camera = useThree((s) => s.camera);

    const built = useMemo(() => {
        /* Always clone. Never reparent the cached scene: React invokes render
           twice, so moving the shared object into a group happens twice and the
           committed group is left empty (the model ends up under the discarded
           one). Cloning is idempotent, and GLTFLoader names animation tracks
           after node names — which clone() preserves — so clips still bind.

           Rigged meshes need SkeletonUtils: Object3D.clone() copies the bones
           but leaves every SkinnedMesh bound to the ORIGINAL skeleton, so the
           copy either never moves or collapses. */
        const root = cfg.skinned ? cloneSkinned(scene) : scene.clone(true);

        // Restyle named materials (flag cloth and pole, etc.)
        if (cfg.materialOverrides) {
            const overrides = cfg.materialOverrides;
            root.traverse((o) => {
                const mesh = o as THREE.Mesh;
                if (!mesh.isMesh) return;
                const src = mesh.material as THREE.MeshStandardMaterial;
                const rule = overrides[src.name];
                if (!rule) return;
                const m = src.clone();
                if (rule.dropMap) m.map = null;
                if (rule.metalness !== undefined) m.metalness = rule.metalness;
                if (rule.roughness !== undefined) m.roughness = rule.roughness;
                m.envMapIntensity = 1.4;
                mesh.material = m;
                mesh.userData.overrideColor = rule.color;
                m.needsUpdate = true;
            });
        }

        /* Brand recolour. This asset is untextured metal, so a flat colour per
           part is enough — no albedo to preserve. Materials are cloned because
           useGLTF caches and shares them across instances. */
        if (cfg.tintAlternate) {
            let i = 0;
            root.traverse((o) => {
                const mesh = o as THREE.Mesh;
                if (!mesh.isMesh) return;
                const m = (mesh.material as THREE.MeshStandardMaterial).clone();
                m.envMapIntensity = 1.5;
                mesh.material = m;
                mesh.userData.tintIndex = i++;
            });
        }

        // Clone materials so the hue shift can't leak into the cached original
        if (cfg.hueShift) {
            const only = cfg.hueShift.material;
            root.traverse((o) => {
                const mesh = o as THREE.Mesh;
                if (!mesh.isMesh) return;
                const src = mesh.material as THREE.MeshStandardMaterial;
                if (only && src.name !== only) return;
                mesh.material = src.clone();
                mesh.userData.srcMap = src.map ?? null;
            });
        }

        // Centre at unit scale; the wrapper is scaled separately below so the
        // fit can react to the panel's aspect without rebuilding the model.
        const box = new THREE.Box3().setFromObject(root);
        const extent = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        /* Centre via a pivot rather than by moving the model. The animated
           model is the loaded scene itself, so writing to its position would
           persist across remounts and the offset would compound. */
        const pivot = new THREE.Group();
        pivot.add(root);
        pivot.position.set(-center.x, -center.y, -center.z);

        const wrapper = new THREE.Group();
        wrapper.add(pivot);
        return {
            wrapper,
            extent,
            largest: Math.max(extent.x, extent.y, extent.z) || 1,
            // box diagonal == bounding-sphere diameter: the widest the model can
            // ever project, whatever angle it is turned to
            diagonal: extent.length() || 1,
        };
    }, [scene, cfg.tintAlternate, cfg.hueShift, cfg.skinned, cfg.materialOverrides]);

    const object = built.wrapper;
    /* Only a turntable spin needs the conservative bounding-sphere fit. Models
       that merely animate in place (an idle, a waving flag, a lid opening)
       keep their silhouette, so fitting them by the sphere just shrinks them
       for no reason. */
    const turns = Boolean(cfg.spin);

    /* Silhouette under the card's fixed tilt. `largest` measures the model in
       its authored pose, but a model tipped out of plane projects a taller or
       wider outline than that — which is why the gear train, tipped 1.05 rad
       toward the viewer, spilled past every edge of its panel. Rotating the
       bounding box's corners gives the extent actually seen on screen. Opt-in
       per model, since the shallow Y-only turns elsewhere barely change the
       outline and their sizes are already settled. */
    const posed = useMemo(() => {
        const [rx, ry, rz] = cfg.tilt ?? [0, 0, 0];
        if (!cfg.fitPose || (!rx && !ry && !rz)) return built.largest;
        const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz));
        const h = built.extent.clone().multiplyScalar(0.5);
        const corner = new THREE.Vector3();
        let maxX = 0;
        let maxY = 0;
        for (let i = 0; i < 8; i += 1) {
            corner
                .set(i & 1 ? h.x : -h.x, i & 2 ? h.y : -h.y, i & 4 ? h.z : -h.z)
                .applyMatrix4(m);
            maxX = Math.max(maxX, Math.abs(corner.x));
            maxY = Math.max(maxY, Math.abs(corner.y));
        }
        // depth is ignored: it does not widen the outline, only the perspective
        return Math.max(maxX, maxY) * 2 || built.largest;
    }, [built.extent, built.largest, cfg.tilt, cfg.fitPose]);

    /* Fit to the view's own aspect. The visual column is portrait on narrow
       screens and landscape on wide ones, so whichever axis is tighter decides
       the size. Anything that turns is measured by its bounding sphere, so it
       stays inside the frame at every angle instead of clipping mid-rotation. */
    useEffect(() => {
        const cam = camera as THREE.PerspectiveCamera;
        const dist = Math.abs(cam.position.z) || 2.8;
        const visibleH = 2 * dist * Math.tan(((cam.fov || 42) * Math.PI) / 360);
        const visibleW = visibleH * (size.width / Math.max(1, size.height));
        const room = Math.min(visibleH, visibleW) * 0.96;
        const reference = turns ? built.diagonal : posed;
        object.scale.setScalar(Math.min(cfg.fit, room) / reference);
    }, [object, posed, built.diagonal, turns, size, cfg.fit, camera]);

    // Brand colours, re-applied when the theme flips. Mostly primary with an
    // accent every third part, so it reads branded rather than harlequin.
    useEffect(() => {
        if (!cfg.tintAlternate) return;
        object.traverse((o) => {
            const mesh = o as THREE.Mesh;
            const idx = mesh.userData?.tintIndex as number | undefined;
            if (!mesh.isMesh || idx === undefined) return;
            const m = mesh.material as THREE.MeshStandardMaterial;
            m.color.set(idx % 3 === 0 ? palette.accent : palette.primary);
            m.needsUpdate = true;
        });
    }, [object, palette, cfg.tintAlternate]);

    // Named-material colours, re-applied when the theme flips
    useEffect(() => {
        if (!cfg.materialOverrides) return;
        object.traverse((o) => {
            const mesh = o as THREE.Mesh;
            const want = mesh.userData?.overrideColor as string | undefined;
            if (!mesh.isMesh || !want) return;
            const m = mesh.material as THREE.MeshStandardMaterial;
            m.color.set(
                want === 'primary' ? palette.primary : want === 'accent' ? palette.accent : want
            );
            m.needsUpdate = true;
        });
    }, [object, palette, cfg.materialOverrides]);

    // Hue-shift the albedo, re-run on theme change so the brand colour tracks.
    useEffect(() => {
        const shift = cfg.hueShift;
        if (!shift) return;
        const made: THREE.Texture[] = [];
        const hex = shift.to === 'accent' ? palette.accent : palette.primary;

        object.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh || !mesh.userData.srcMap) return;
            const tex = hueShiftedTexture(
                mesh.userData.srcMap as THREE.Texture,
                shift.from,
                shift.tol,
                hex
            );
            if (!tex) return;
            const m = mesh.material as THREE.MeshStandardMaterial;
            m.map = tex;
            m.needsUpdate = true;
            made.push(tex);
        });

        return () => made.forEach((t) => t.dispose());
    }, [object, palette, cfg.hueShift]);

    /* Baked animation: the file drives each gear on its own axle, which is far
       more convincing than rotating nodes by hand. The mixer is driven by hand
       rather than through useAnimations, because this canvas is advanced
       manually and the raw per-frame delta arrives uneven — feeding that
       straight into a mixer is what made the motion stutter. */
    /* Retarget a clip from a different skeleton. Loading cfg.url when no
       retarget is configured is deliberate: the hook must run unconditionally
       and that model is already cached, so it costs nothing. */
    const donor = useGLTF(cfg.retargetFrom ?? cfg.url);

    const clips = useMemo(() => {
        if (!cfg.retargetFrom) return animations;
        const target = richestSkinnedMesh(object);
        // clone the donor so sampling can't disturb the cached original
        const source = richestSkinnedMesh(cloneSkinned(donor.scene));
        const clip = donor.animations[0];
        if (!target || !source || !clip) return animations;

        const names: Record<string, string> = {};
        Object.entries(WALK_BONE_MAP).forEach(([base, defName]) => {
            let hit: string | null = null;
            object.traverse((o) => {
                if (!hit && (o.name === base || o.name.startsWith(`${base}_`))) hit = o.name;
            });
            if (hit) names[hit] = defName;
        });

        try {
            // Find the actual target hip bone name dynamically
            let targetHip = 'Hips';
            Object.keys(names).forEach((k) => {
                if (names[k] === 'DEF-hips') targetHip = k;
            });

            // Force both skeletons to bind pose before calculating retargeting
            target.skeleton.pose();
            source.skeleton.pose();

            const out = retargetClip(target, source, clip, {
                names,
                hip: targetHip,
                fps: 30,
            });

            /* retargetClip emits skeleton-relative tracks (".bones[Hips_53]
               .quaternion"), which only bind against a SkinnedMesh root. Our
               mixer is rooted on the wrapper group, so rewrite them to plain
               node paths ("Hips_53.quaternion") — otherwise every track fails
               to bind and the avatar sits in its bind pose. */
            out.tracks.forEach((track) => {
                track.name = track.name.replace(/^\.bones\[(.+?)\]\./, '$1.');
            });
            out.name = 'Walk';
            return [...animations, out];
        } catch {
            return animations;
        }
    }, [cfg.retargetFrom, donor, object, animations]);

    const anim = useMemo(() => {
        if (!cfg.animated || !clips.length) return null;
        const mx = new THREE.AnimationMixer(object);
        const actions = clips.map((clip) => {
            const action = mx.clipAction(clip);
            if (cfg.playOnActive) {
                // one-shot that holds its final pose (the lid stays open)
                action.setLoop(THREE.LoopOnce, 1);
                action.clampWhenFinished = true;
                action.paused = true;
            }
            action.play();
            return action;
        });

        /* Hold and APPLY frame zero for one-shots. Simply pausing leaves the
           model in its bind pose, which for the laptop is the lid already
           open — the viewer would never see it shut. Evaluating at t=0 puts
           it in the closed state before the card arrives. */
        if (cfg.playOnActive) {
            actions.forEach((a) => {
                a.time = 0;
                a.paused = true;
            });
            mx.update(0);
        }
        return { mixer: mx, actions };
    }, [cfg.animated, cfg.playOnActive, cfg.url, clips, object]);

    const mixer = anim?.mixer ?? null;

    // Handle animation play states and crossfading
    useEffect(() => {
        if (!anim) return;

        if (cfg.playOnActive) {
            anim.actions.forEach((action) => {
                if (active) {
                    action.paused = false;
                } else {
                    action.reset();
                    action.time = 0;
                    action.paused = true;
                }
            });
            if (!active) anim.mixer.update(0);
        } else if (anim.actions.length >= 2) {
            const idle = anim.actions[0];
            const walk = anim.actions[1];
            
            idle.enabled = true;
            walk.enabled = true;
            
            if (active) {
                idle.setEffectiveTimeScale(1);
                idle.setEffectiveWeight(1);
                idle.play();
                walk.crossFadeTo(idle, 0.5, true);
            } else {
                walk.setEffectiveTimeScale(1);
                walk.setEffectiveWeight(1);
                walk.play();
                idle.crossFadeTo(walk, 0.5, true);
            }
        }
    }, [anim, active, cfg.playOnActive]);

    /* Activate on every mount. This must NOT have a stopAllAction cleanup. */
    useEffect(() => {
        if (!anim) return;
        
        if (anim.actions.length >= 2 && !cfg.playOnActive) {
            const idle = anim.actions[0];
            const walk = anim.actions[1];
            idle.enabled = true;
            walk.enabled = true;
            
            // Start according to active state immediately on mount
            if (active) {
                idle.setEffectiveWeight(1).play();
                walk.setEffectiveWeight(0).play();
            } else {
                idle.setEffectiveWeight(0).play();
                walk.setEffectiveWeight(1).play();
            }
        } else {
            anim.actions.forEach((action) => {
                action.enabled = true;
                action.setEffectiveWeight(1);
                action.play();
                if (cfg.playOnActive) {
                    action.time = 0;
                    action.paused = true;
                }
            });
            if (cfg.playOnActive) anim.mixer.update(0);
        }
    }, [anim, cfg.playOnActive, active]);

    /* Wall-clock timing. This canvas is advanced manually and its frame
       callbacks can fire more than once per rendered frame, so accumulating the
       delta handed to useFrame ran everything several times too fast (measured
       at ~7x). Deriving the step from real elapsed time makes every rate exact
       no matter how often the callback runs, and keeps it smooth. */
    const last = useRef<number | null>(null);
    const elapsed = useRef(0);

    useFrame(() => {
        const now = performance.now();
        if (last.current === null) last.current = now;
        const dt = Math.max(0, Math.min((now - last.current) / 1000, 0.05));
        last.current = now;
        elapsed.current += dt;

        if (mixer) {
            mixer.update(dt * (cfg.animSpeed ?? 1));
        }

        if (cfg.float) {
            // ~18s cycle — a slow drift, not a bob
            object.position.y = Math.sin(elapsed.current * 0.35) * cfg.float;
        }
    });

    return <primitive object={object} />;
}

/* Studio rig: a key light plus brand-tinted fill and rim, and a small
   procedural environment so the scanned metal and plastic actually reflect
   something. No external HDRI needed. */
function StudioLighting({ palette, faceLight }: { palette: ScenePalette; faceLight?: number }) {
    const isDark = palette.name === 'dark';
    return (
        <>
            {/* Overhead wash for models read from above (the compass dial), so
                the face isn't left in the key light's shadow */}
            {faceLight ? (
                <>
                    <pointLight
                        position={[0.5, 3.4, 2.2]}
                        intensity={faceLight * (isDark ? 1 : 0.7)}
                        distance={12}
                    />
                    <directionalLight position={[0, 5, 1.5]} intensity={isDark ? 1.8 : 2.1} />
                </>
            ) : null}
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

/** every staged figure is normalised to this height before being scaled */
const CAST_HEIGHT = 1.8;

/* One staged character: its own clone, its own mixer, its own idle. */
function CastMemberModel({ entry }: { entry: CastEntry }) {
    const { scene, animations } = useGLTF(entry.url);

    /* These avatars are authored at wildly different scales (the saree model is
       several times the size of the suited figures), so staging them by raw
       offsets alone makes one tower over the rest. Normalise every figure to
       the same height and stand them all on y=0 first; the per-entry scale
       then expresses depth rather than fighting the source units. */
    const object = useMemo(() => {
        const root = entry.skinned ? cloneSkinned(scene) : scene.clone(true);
        const box = new THREE.Box3().setFromObject(root);
        const extent = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const unit = CAST_HEIGHT / (extent.y || 1);

        root.scale.setScalar(unit);
        // centred left-to-right and front-to-back, feet on the ground plane
        root.position.set(-center.x * unit, -box.min.y * unit, -center.z * unit);

        const holder = new THREE.Group();
        holder.add(root);
        return holder;
    }, [scene, entry.skinned]);

    const mixer = useMemo(() => {
        if (!animations.length) return null;
        return new THREE.AnimationMixer(object);
    }, [animations, object]);

    /* Activated here with no destructive cleanup: React runs effects twice, and
       a stopAllAction teardown would deactivate the clip after the first mount
       and leave the avatar frozen in its bind pose. */
    useEffect(() => {
        if (!mixer) return;
        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.enabled = true;
            action.setEffectiveWeight(1);
            action.play();
        });
    }, [mixer, animations]);

    // wall-clock stepping, for the same reason as the single-model path
    const last = useRef<number | null>(null);
    useFrame(() => {
        if (!mixer) return;
        const now = performance.now();
        if (last.current === null) last.current = now;
        const dt = Math.max(0, Math.min((now - last.current) / 1000, 0.05));
        last.current = now;
        mixer.update(dt * (entry.animSpeed ?? 1));
    });

    return (
        <primitive
            object={object}
            position={entry.offset ?? [0, 0, 0]}
            rotation={entry.rotation ?? [0, 0, 0]}
            scale={entry.scale ?? 1}
        />
    );
}

/* Stages the whole cast, then fits the GROUP (not each figure) to the view so
   the arrangement keeps its relative spacing. */
function CastGroup({ cast, fit }: { cast: CastEntry[]; fit: number }) {
    const group = useRef<THREE.Group>(null);
    const size = useThree((s) => s.size);
    const camera = useThree((s) => s.camera);

    useEffect(() => {
        const g = group.current;
        if (!g) return;
        g.scale.setScalar(1);
        g.position.set(0, 0, 0);
        g.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(g);
        const extent = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const cam = camera as THREE.PerspectiveCamera;
        const dist = Math.abs(cam.position.z) || 2.8;
        const visibleH = 2 * dist * Math.tan(((cam.fov || 42) * Math.PI) / 360);
        const visibleW = visibleH * (size.width / Math.max(1, size.height));
        const room = Math.min(visibleH, visibleW) * 0.96;

        const largest = Math.max(extent.x, extent.y, extent.z) || 1;
        const s = Math.min(fit, room) / largest;
        g.scale.setScalar(s);
        g.position.set(-center.x * s, -center.y * s, -center.z * s);
    }, [size, camera, fit, cast]);

    return (
        <group ref={group}>
            {cast.map((entry) => (
                <CastMemberModel key={entry.url} entry={entry} />
            ))}
        </group>
    );
}

function ModelScene({ active, palette, cfg }: SceneProps & { cfg: ModelConfig }) {
    return (
        <>
            <StudioLighting palette={palette} faceLight={cfg.faceLight} />
            <SceneRig
                active={active}
                idleSpeed={cfg.spin ?? 0}
                spinAxis={cfg.spinAxis ?? 'y'}
                parallax={cfg.parallax ?? 'rotate'}
                baseRotation={cfg.tilt ?? [0, 0, 0]}
            >
                {cfg.cast ? (
                    <CastGroup cast={cfg.cast} fit={cfg.fit} />
                ) : (
                    <NormalizedModel cfg={cfg} palette={palette} active={active} />
                )}
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

/* View wrapper placed inside a panel's visual area. Looks the model up by id,
   falling back to the procedural scenes for anything without one. */
export function ModelView({
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
        viewHosts.add(el);
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
        return () => {
            viewHosts.delete(el);
            io.disconnect();
        };
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

/* The single shared canvas — one WebGL context for every scene on the page.
   Mounted once globally (see ClientIslands) so both the services panels and
   the capability cards draw into it. */
export function SharedModelCanvas() {
    const [dpr, setDpr] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

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
        /* Render only when at least one registered view is near the viewport.
           The canvas is global now (services panels and capability cards both
           portal into it), so gating on a single section would starve the
           other one. */
        const tick = (time: number) => {
            let near = false;
            for (const el of viewHosts) {
                const r = el.getBoundingClientRect();
                if (r.bottom > -300 && r.top < window.innerHeight + 300) {
                    near = true;
                    break;
                }
            }
            if (!near) return;
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

