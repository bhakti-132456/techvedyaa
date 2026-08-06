'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Float, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import { useTheme } from 'next-themes';
import * as THREE from 'three';
import { useInView } from 'framer-motion';

/* ---------------------------------------------------------------
   Shared cursor state (smoothed in useFrame)
---------------------------------------------------------------- */
function useSmoothedCursor(isMobile: boolean) {
    const cursor = useRef({ x: 0, y: 0 });
    useEffect(() => {
        if (isMobile) return;
        const onMove = (e: MouseEvent) => {
            cursor.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            cursor.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, [isMobile]);
    return cursor;
}

/* ---------------------------------------------------------------
   Liquid-glass core — icosahedron with organic vertex displacement
   and a premium physical material (transmission + iridescence).
---------------------------------------------------------------- */
function LiquidCore({ isMobile, isDark, primary, secondary }: {
    isMobile: boolean; isDark: boolean; primary: string; secondary: string;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const baseGeo = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(1.35, isMobile ? 24 : 48);
        // Cache original positions for displacement
        geo.setAttribute('basePosition', geo.attributes.position.clone());
        return geo;
    }, [isMobile]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        const t = state.clock.elapsedTime;
        const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
        const base = mesh.geometry.attributes.basePosition as THREE.BufferAttribute;

        // Organic pseudo-noise displacement — layered trig, no external lib
        for (let i = 0; i < pos.count; i++) {
            const bx = base.getX(i), by = base.getY(i), bz = base.getZ(i);
            const n =
                Math.sin(bx * 2.1 + t * 0.6) * 0.35 +
                Math.sin(by * 2.7 + t * 0.45) * 0.3 +
                Math.sin(bz * 3.3 + t * 0.7) * 0.25 +
                Math.sin((bx + by + bz) * 1.4 + t * 0.9) * 0.2;
            const d = 1 + n * 0.085;
            pos.setXYZ(i, bx * d, by * d, bz * d);
        }
        pos.needsUpdate = true;
        mesh.geometry.computeVertexNormals();

        mesh.rotation.y = t * 0.12;
        mesh.rotation.z = Math.sin(t * 0.2) * 0.08;
    });

    return (
        <mesh ref={meshRef} geometry={baseGeo}>
            <meshPhysicalMaterial
                color={isDark ? '#141824' : '#eef3fa'}
                metalness={0.1}
                roughness={0.12}
                transmission={isMobile ? 0.6 : 0.92}
                thickness={1.6}
                ior={1.4}
                clearcoat={1}
                clearcoatRoughness={0.08}
                iridescence={0.9}
                iridescenceIOR={1.3}
                iridescenceThicknessRange={[120, 480]}
                attenuationColor={new THREE.Color(primary)}
                attenuationDistance={2.2}
                envMapIntensity={isDark ? 1.6 : 1.2}
            />
        </mesh>
    );
}

/* ---------------------------------------------------------------
   Inner energy nucleus — glowing octahedron inside the glass shell
---------------------------------------------------------------- */
function Nucleus({ isDark, primary, secondary }: { isDark: boolean; primary: string; secondary: string }) {
    const ref = useRef<THREE.Mesh>(null);
    const wireRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (ref.current) {
            ref.current.rotation.x = t * 0.4;
            ref.current.rotation.y = -t * 0.55;
            const s = 1 + Math.sin(t * 1.8) * 0.06;
            ref.current.scale.setScalar(s);
        }
        if (wireRef.current) {
            wireRef.current.rotation.x = -t * 0.25;
            wireRef.current.rotation.y = t * 0.35;
        }
    });
    return (
        <group>
            <mesh ref={ref}>
                <octahedronGeometry args={[0.55, 0]} />
                <meshPhysicalMaterial
                    color={secondary}
                    emissive={secondary}
                    emissiveIntensity={isDark ? 2.2 : 1.4}
                    metalness={0.4}
                    roughness={0.2}
                />
            </mesh>
            <mesh ref={wireRef}>
                <icosahedronGeometry args={[0.82, 1]} />
                <meshBasicMaterial color={primary} wireframe transparent opacity={isDark ? 0.35 : 0.25} />
            </mesh>
        </group>
    );
}

/* ---------------------------------------------------------------
   Orbital system — precision rings + light-trail particles
---------------------------------------------------------------- */
function Orbitals({ isMobile, isDark, primary, secondary }: {
    isMobile: boolean; isDark: boolean; primary: string; secondary: string;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);

    const particleCount = isMobile ? 260 : 620;
    const { positions, seeds } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const seeds = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const radius = 2.1 + Math.random() * 2.6;
            const angle = Math.random() * Math.PI * 2;
            const tilt = (Math.random() - 0.5) * 1.1;
            seeds[i * 3] = radius;
            seeds[i * 3 + 1] = angle;
            seeds[i * 3 + 2] = tilt;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = tilt;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return { positions, seeds };
    }, [particleCount]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.rotation.y = -t * 0.16;
            groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.12;
        }
        const pts = particlesRef.current;
        if (pts) {
            const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i < particleCount; i++) {
                const r = seeds[i * 3];
                const a = seeds[i * 3 + 1] + t * (0.12 + (r - 2.1) * 0.03);
                const tilt = seeds[i * 3 + 2];
                pos.setXYZ(
                    i,
                    Math.cos(a) * r,
                    tilt + Math.sin(a * 2 + t * 0.5) * 0.12,
                    Math.sin(a) * r
                );
            }
            pos.needsUpdate = true;
        }
    });

    return (
        <group>
            <points ref={particlesRef} rotation={[0.45, 0, -0.18]}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    color={isDark ? primary : '#3d7fc4'}
                    size={isMobile ? 0.028 : 0.022}
                    sizeAttenuation
                    transparent
                    opacity={isDark ? 0.75 : 0.55}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            <group ref={groupRef}>
                {[
                    { r: 2.35, tube: 0.008, rot: [Math.PI / 2.2, 0.2, 0], color: primary, op: 0.5 },
                    { r: 2.95, tube: 0.006, rot: [Math.PI / 1.8, -0.35, 0.3], color: secondary, op: 0.35 },
                    { r: 3.6, tube: 0.005, rot: [Math.PI / 2.6, 0.5, -0.2], color: primary, op: 0.22 },
                ].map((ring, i) => (
                    <mesh key={i} rotation={ring.rot as [number, number, number]}>
                        <torusGeometry args={[ring.r, ring.tube, 8, 160]} />
                        <meshBasicMaterial color={ring.color} transparent opacity={ring.op} />
                    </mesh>
                ))}

                {/* Satellite nodes riding the mid ring */}
                {[...Array(3)].map((_, i) => {
                    const angle = (i / 3) * Math.PI * 2;
                    return (
                        <group key={`sat-${i}`} rotation={[Math.PI / 1.8, -0.35, 0.3]}>
                            <mesh position={[Math.cos(angle) * 2.95, Math.sin(angle) * 2.95, 0]}>
                                <sphereGeometry args={[0.06, 16, 16]} />
                                <meshPhysicalMaterial
                                    color={i % 2 === 0 ? secondary : primary}
                                    emissive={i % 2 === 0 ? secondary : primary}
                                    emissiveIntensity={isDark ? 3 : 1.8}
                                    roughness={0.2}
                                />
                            </mesh>
                        </group>
                    );
                })}
            </group>
        </group>
    );
}

/* ---------------------------------------------------------------
   Scene root — parallax rig + composition
---------------------------------------------------------------- */
function Scene({ isMobile }: { isMobile: boolean }) {
    const rigRef = useRef<THREE.Group>(null);
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isDark = mounted && theme === 'dark';
    const primary = isDark ? '#4AA8FF' : '#005EB8';
    const secondary = isDark ? '#FF9570' : '#F97316';

    const cursor = useSmoothedCursor(isMobile);
    const smooth = useRef({ x: 0, y: 0 });

    useFrame((state) => {
        if (!rigRef.current) return;
        smooth.current.x = THREE.MathUtils.lerp(smooth.current.x, cursor.current.x, 0.04);
        smooth.current.y = THREE.MathUtils.lerp(smooth.current.y, cursor.current.y, 0.04);
        rigRef.current.rotation.y = smooth.current.x * 0.22;
        rigRef.current.rotation.x = -smooth.current.y * 0.16;
        rigRef.current.position.x = smooth.current.x * 0.25;
        rigRef.current.position.y = smooth.current.y * 0.2;
    });

    return (
        <>
            {/* Studio-style local environment (no network fetch) */}
            <Environment resolution={isMobile ? 64 : 256} frames={1}>
                <Lightformer intensity={isDark ? 2.5 : 4} position={[0, 5, -9]} scale={[10, 10, 1]} color="#ffffff" />
                <Lightformer intensity={isDark ? 1.8 : 2.5} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[12, 4, 1]} color={primary} />
                <Lightformer intensity={isDark ? 1.5 : 2} position={[6, -1, 1]} rotation-y={-Math.PI / 2} scale={[12, 4, 1]} color={secondary} />
                <Lightformer intensity={1} position={[0, -5, 3]} scale={[8, 3, 1]} color="#ffffff" />
            </Environment>

            <ambientLight intensity={isDark ? 0.25 : 0.5} />
            <pointLight position={[4, 4, 5]} intensity={isDark ? 8 : 14} color={secondary} distance={20} decay={2} />
            <pointLight position={[-5, -3, 4]} intensity={isDark ? 10 : 16} color={primary} distance={20} decay={2} />

            <group ref={rigRef}>
                <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
                    <LiquidCore isMobile={isMobile} isDark={isDark} primary={primary} secondary={secondary} />
                    <Nucleus isDark={isDark} primary={primary} secondary={secondary} />
                </Float>
                <Orbitals isMobile={isMobile} isDark={isDark} primary={primary} secondary={secondary} />
                <ContactShadows position={[0, -2.6, 0]} opacity={isDark ? 0.5 : 0.28} scale={9} blur={2.8} far={4} resolution={isMobile ? 128 : 256} frames={1} />
            </group>

            {!isMobile && (
                <EffectComposer multisampling={0}>
                    <Bloom
                        intensity={isDark ? 0.9 : 0.45}
                        luminanceThreshold={isDark ? 0.35 : 0.6}
                        luminanceSmoothing={0.3}
                        mipmapBlur
                    />
                    {/* Soft cinematic defocus — recedes the scene behind the copy */}
                    <DepthOfField
                        focusDistance={0.12}
                        focalLength={0.06}
                        bokehScale={2.4}
                    />
                </EffectComposer>
            )}
        </>
    );
}

export default function Hero3DCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, margin: '200px' });
    const [dpr, setDpr] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setDpr(Math.min(window.devicePixelRatio, 2));
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', minHeight: isMobile ? '100%' : '520px' }}>
            {isInView && (
                <Canvas
                    camera={{ position: [0, 0, 7], fov: 42 }}
                    dpr={dpr}
                    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                >
                    <Scene isMobile={isMobile} />
                </Canvas>
            )}
        </div>
    );
}
