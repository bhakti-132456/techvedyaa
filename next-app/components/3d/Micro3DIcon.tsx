'use client';

import { useRef, useState, useMemo } from 'react';
import { View } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInView } from 'framer-motion';

// Premium Material Helpers for Pure, Vibrant Neon Colors
const getMatProps = (color: string, hovered: boolean) => ({
    color,
    roughness: 0.15,
    metalness: 0.1,
    emissive: color,
    emissiveIntensity: hovered ? 1.2 : 0.6
});

// 1. Antenna (marketing communications)
function AntennaMesh({ hovered }: { hovered: boolean }) {
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);
    const ring3 = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        const t = state.clock.elapsedTime * (hovered ? 3 : 1);
        [ring1, ring2, ring3].forEach((r, i) => {
            if (!r.current) return;
            const scale = ((t + i * 0.33) % 1) * 2 + 0.1;
            r.current.scale.set(scale, scale, scale);
            (r.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 1 - scale / 2);
        });
    });
    return (
        <group scale={0.8}>
            <mesh position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.06, 0.12, 0.8, 16]} />
                <meshStandardMaterial {...getMatProps("#005EB8", hovered)} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
            </mesh>
            {[ring1, ring2, ring3].map((ref, idx) => (
                <mesh key={idx} ref={ref} position={[0, 0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
                    <torusGeometry args={[0.4, 0.02, 16, 32]} />
                    <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={1} transparent opacity={0.8} />
                </mesh>
            ))}
        </group>
    );
}

// 2. Strategy Cone (strategy & brand)
function StrategyConeMesh({ hovered }: { hovered: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const sphereRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (!groupRef.current || !sphereRef.current) return;
        groupRef.current.rotation.y += delta * 0.5 * (hovered ? 3 : 1);
        sphereRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    });
    return (
        <group ref={groupRef} scale={0.8}>
            <mesh>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshStandardMaterial color="#005EB8" emissive="#005EB8" emissiveIntensity={0.8} wireframe={true} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, -0.2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.4, 0.8, 16]} />
                <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
            </mesh>
            <mesh ref={sphereRef} position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial {...getMatProps("#005EB8", hovered)} />
            </mesh>
        </group>
    );
}

// 3. Tech Cube (tech solutions)
function TechCubeMesh({ hovered }: { hovered: boolean }) {
    const innerRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (!innerRef.current || !outerRef.current) return;
        const speed = hovered ? 3 : 1;
        innerRef.current.rotation.y += delta * speed;
        innerRef.current.rotation.x += delta * 0.5 * speed;
        outerRef.current.rotation.y -= delta * 0.5 * speed;
        outerRef.current.rotation.z -= delta * 0.3 * speed;
    });
    return (
        <group scale={0.8}>
            <mesh ref={outerRef}>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshStandardMaterial color="#005EB8" emissive="#005EB8" emissiveIntensity={1} wireframe={true} />
            </mesh>
            <mesh ref={innerRef}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
            </mesh>
        </group>
    );
}

// 4. AI Network (ai solutions)
function AINetworkMesh({ hovered }: { hovered: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const lineMatRef = useRef<THREE.LineBasicMaterial>(null);
    const s1 = useMemo(() => new THREE.Vector3(-0.5, -0.4, 0), []);
    const s2 = useMemo(() => new THREE.Vector3(0.5, -0.4, 0.3), []);
    const s3 = useMemo(() => new THREE.Vector3(0, 0.5, -0.2), []);
    
    const linesObj = useMemo(() => {
        const points = [s1, s2, s2, s3, s3, s1];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0xF97316, transparent: true, opacity: 0.8 });
        return new THREE.LineSegments(geo, mat);
    }, [s1, s2, s3]);
    
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y += delta * 0.5 * (hovered ? 3 : 1);
    });

    return (
        <group ref={groupRef} scale={0.9}>
            {[s1, s2, s3].map((pos, idx) => (
                <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial {...getMatProps(idx === 0 ? "#F97316" : "#005EB8", hovered)} />
                </mesh>
            ))}
            <primitive object={linesObj} />
        </group>
    );
}

// 5. Social Media Orbit (social media)
function SocialOrbitMesh({ hovered }: { hovered: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const o1 = useRef<THREE.Group>(null);
    const o2 = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (!groupRef.current || !o1.current || !o2.current) return;
        const speed = hovered ? 3 : 1;
        o1.current.rotation.y += delta * 2 * speed;
        o2.current.rotation.x += delta * 1.5 * speed;
        groupRef.current.rotation.z += delta * 0.2 * speed;
    });
    return (
        <group ref={groupRef} scale={0.8}>
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial {...getMatProps("#005EB8", hovered)} />
            </mesh>
            <group ref={o1}>
                <mesh position={[0.8, 0, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
                </mesh>
                <mesh position={[-0.8, 0, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
                </mesh>
                <mesh rotation={[Math.PI/2, 0, 0]}>
                    <torusGeometry args={[0.8, 0.01, 16, 32]} />
                    <meshStandardMaterial color="#005EB8" emissive="#005EB8" emissiveIntensity={1} transparent opacity={0.6} />
                </mesh>
            </group>
            <group ref={o2}>
                <mesh position={[0, 0.8, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial {...getMatProps("#ffffff", hovered)} />
                </mesh>
                <mesh position={[0, -0.8, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial {...getMatProps("#ffffff", hovered)} />
                </mesh>
                <mesh>
                    <torusGeometry args={[0.8, 0.01, 16, 32]} />
                    <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={1} transparent opacity={0.6} />
                </mesh>
            </group>
        </group>
    );
}

// 6. PR Wave Cone (pr)
function PRWaveMesh({ hovered }: { hovered: boolean }) {
    const waveRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (!waveRef.current) return;
        const t = state.clock.elapsedTime * (hovered ? 4 : 2);
        waveRef.current.children.forEach((child, i) => {
            const scale = ((t + i * 0.3) % 1) * 1.5 + 0.1;
            child.scale.set(scale, scale, scale);
            (child as THREE.Mesh).position.x = 0.2 + scale * 0.5;
            ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - scale / 1.5);
        });
    });
    return (
        <group scale={0.8} rotation={[0, -Math.PI/4, 0]}>
            <mesh rotation={[0, 0, -Math.PI/2]} position={[-0.4, 0, 0]}>
                <coneGeometry args={[0.3, 0.8, 16]} />
                <meshStandardMaterial {...getMatProps("#005EB8", hovered)} />
            </mesh>
            <group ref={waveRef}>
                {[0, 1, 2].map((i) => (
                    <mesh key={i} rotation={[0, Math.PI/2, 0]}>
                        <torusGeometry args={[0.4, 0.03, 16, 16, Math.PI]} />
                        <meshBasicMaterial color="#F97316" transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

// 7. Strategic Alignment Brackets (strategic-alignment)
function BracketsMesh({ hovered }: { hovered: boolean }) {
    const leftRef = useRef<THREE.Mesh>(null);
    const rightRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (!leftRef.current || !rightRef.current) return;
        if (hovered) {
             leftRef.current.position.lerp(new THREE.Vector3(-0.25, 0, 0), 0.1);
             rightRef.current.position.lerp(new THREE.Vector3(0.25, 0, 0), 0.1);
             leftRef.current.rotation.z = THREE.MathUtils.lerp(leftRef.current.rotation.z, 0, 0.1);
             rightRef.current.rotation.z = THREE.MathUtils.lerp(rightRef.current.rotation.z, 0, 0.1);
        } else {
             leftRef.current.position.lerp(new THREE.Vector3(-0.4, Math.sin(state.clock.elapsedTime)*0.1, 0), 0.05);
             rightRef.current.position.lerp(new THREE.Vector3(0.4, -Math.sin(state.clock.elapsedTime)*0.1, 0), 0.05);
             leftRef.current.rotation.z += delta * 0.5;
             rightRef.current.rotation.z += delta * 0.5;
        }
    });
    return (
        <group scale={0.8}>
            <mesh ref={leftRef} position={[-0.4, 0, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.2]} />
                <meshStandardMaterial {...getMatProps("#005EB8", hovered)} />
            </mesh>
            <mesh ref={rightRef} position={[0.4, 0, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.2]} />
                <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
            </mesh>
        </group>
    );
}

// 8. Equalizer Bars (data-driven)
function EqualizerMesh({ hovered }: { hovered: boolean }) {
    const b1 = useRef<THREE.Mesh>(null);
    const b2 = useRef<THREE.Mesh>(null);
    const b3 = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        const t = state.clock.elapsedTime * (hovered ? 6 : 2);
        [b1, b2, b3].forEach((b, i) => {
            if (!b.current) return;
            const h = 0.5 + Math.sin(t + i * 2) * 0.4;
            b.current.scale.y = h;
            b.current.position.y = (h - 1) / 2;
        });
    });
    return (
        <group scale={0.8} position={[0, 0.2, 0]}>
            <mesh ref={b1} position={[-0.4, 0, 0]}>
                <boxGeometry args={[0.25, 1, 0.25]} />
                <meshStandardMaterial {...getMatProps("#005EB8", hovered)} />
            </mesh>
            <mesh ref={b2} position={[0, 0, 0]}>
                <boxGeometry args={[0.25, 1, 0.25]} />
                <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
            </mesh>
            <mesh ref={b3} position={[0.4, 0, 0]}>
                <boxGeometry args={[0.25, 1, 0.25]} />
                <meshStandardMaterial {...getMatProps("#ffffff", hovered)} />
            </mesh>
        </group>
    );
}

// 9. Channel Junction (channel-integration)
function JunctionMesh({ hovered }: { hovered: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y += delta * (hovered ? 2 : 0.5);
    });
    return (
        <group ref={groupRef} scale={0.8}>
            <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
                <meshStandardMaterial {...getMatProps("#005EB8", hovered)} />
            </mesh>
            {[-0.4, 0, 0.4].map((x, i) => (
                <mesh key={i} position={[x, 0.3, 0]} rotation={[0, 0, -x*0.8]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
                    <meshStandardMaterial {...getMatProps(i === 1 ? "#F97316" : "#ffffff", hovered)} />
                </mesh>
            ))}
        </group>
    );
}

// 10. Infinity Loop (automation-first / marketing-automation)
function InfinityMesh({ hovered }: { hovered: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y += delta * (hovered ? 3 : 1);
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
    });
    return (
        <mesh ref={meshRef} scale={0.6}>
            <torusKnotGeometry args={[0.6, 0.18, 64, 16, 2, 3]} />
            <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
        </mesh>
    );
}

// 11. Pillar (strategic-planning)
function PillarMesh({ hovered }: { hovered: boolean }) {
    const pillarRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!pillarRef.current) return;
        const h = hovered ? 1.4 : 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        pillarRef.current.scale.y = THREE.MathUtils.lerp(pillarRef.current.scale.y, h, 0.1);
        pillarRef.current.position.y = (pillarRef.current.scale.y - 1) / 2;
    });
    return (
        <group scale={0.8}>
            <mesh position={[0, -0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
                <planeGeometry args={[1.5, 1.5]} />
                <meshStandardMaterial color="#005EB8" emissive="#005EB8" emissiveIntensity={0.8} wireframe={true} />
            </mesh>
            <mesh ref={pillarRef} position={[0, 0, 0]}>
                <boxGeometry args={[0.4, 1, 0.4]} />
                <meshStandardMaterial {...getMatProps("#F97316", hovered)} />
            </mesh>
        </group>
    );
}

// 12. Funnel (lead-servicing)
function FunnelMesh({ hovered }: { hovered: boolean }) {
    const pRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const num = 8;
    useFrame((state) => {
        if (!pRef.current) return;
        const t = state.clock.elapsedTime * (hovered ? 2 : 1);
        for (let i = 0; i < num; i++) {
            const prog = (t + i / num) % 1;
            const y = 0.6 - prog * 1.2;
            const radius = Math.max(0.1, (y + 0.6) * 0.4);
            const angle = i * Math.PI * 0.8 + t * 2;
            dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
            dummy.scale.setScalar(0.06);
            dummy.updateMatrix();
            pRef.current.setMatrixAt(i, dummy.matrix);
        }
        pRef.current.instanceMatrix.needsUpdate = true;
    });
    return (
        <group scale={0.8}>
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.6, 0.8, 16, 1, true]} />
                <meshStandardMaterial color="#005EB8" emissive="#005EB8" emissiveIntensity={0.8} wireframe={true} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
                <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={0.8} transparent opacity={0.8} />
            </mesh>
            <instancedMesh ref={pRef} args={[undefined, undefined, num]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
            </instancedMesh>
        </group>
    );
}

// Default Fallback Primitive
function DefaultPrimitive({ hovered }: { hovered: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y += delta * (hovered ? 3 : 1);
        meshRef.current.rotation.x += delta * 0.5 * (hovered ? 3 : 1);
    });
    return (
        <mesh ref={meshRef} scale={hovered ? 1.2 : 1}>
            <dodecahedronGeometry args={[0.7]} />
            <meshStandardMaterial color="#005EB8" emissive="#005EB8" emissiveIntensity={0.8} roughness={0.15} metalness={0.1} wireframe={true} />
        </mesh>
    );
}

export default function Micro3DIcon({ type = 'default', className = '' }: { type?: string, className?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, margin: '100px' });
    const [hovered, setHover] = useState(false);

    const renderMesh = () => {
        switch (type) {
            case 'marketing-communications':
            case 'marketcom':
                return <AntennaMesh hovered={hovered} />;
            case 'strategy':
            case 'brand':
            case 'campaign-management':
                return <StrategyConeMesh hovered={hovered} />;
            case 'tech-solutions':
            case 'tech':
                return <TechCubeMesh hovered={hovered} />;
            case 'ai-solutions':
            case 'ai':
                return <AINetworkMesh hovered={hovered} />;
            case 'social-media':
            case 'social':
                return <SocialOrbitMesh hovered={hovered} />;
            case 'pr':
                return <PRWaveMesh hovered={hovered} />;
            case 'strategic-alignment':
                return <BracketsMesh hovered={hovered} />;
            case 'data-driven':
            case 'continuous-optimization':
                return <EqualizerMesh hovered={hovered} />;
            case 'channel-integration':
            case 'scalable-solutions':
                return <JunctionMesh hovered={hovered} />;
            case 'automation-first':
            case 'marketing-automation':
            case 'lms':
                return <InfinityMesh hovered={hovered} />;
            case 'strategic-planning':
            case 'project-based':
                return <PillarMesh hovered={hovered} />;
            case 'lead-servicing':
            case 'retainer-based':
            case 'hybrid':
                return <FunnelMesh hovered={hovered} />;
            default:
                return <DefaultPrimitive hovered={hovered} />;
        }
    };

    return (
        <div 
            ref={containerRef} 
            className={`micro-3d-icon-container ${className}`} 
            style={{ width: '100%', height: '100%', minWidth: '64px', minHeight: '64px', position: 'relative', cursor: 'pointer' }}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
        >
            {isInView && (
                <View style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
                    <pointLight position={[-10, -10, -10]} intensity={1.5} color="#005EB8" />
                    {renderMesh()}
                </View>
            )}
        </div>
    );
}
