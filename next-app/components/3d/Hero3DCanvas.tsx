'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useInView } from 'framer-motion';

// --- Miniature 3D Primitives for Service Icons ---

function NestedHypercube({ color = "#F97316", isHovered = false }) {
    const outerRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);
    
    useFrame((state, delta) => {
        const speed = isHovered ? 2.5 : 1.0;
        if (outerRef.current) {
            outerRef.current.rotation.x += delta * 0.4 * speed;
            outerRef.current.rotation.y += delta * 0.5 * speed;
        }
        if (innerRef.current) {
            innerRef.current.rotation.x -= delta * 0.6 * speed;
            innerRef.current.rotation.y -= delta * 0.7 * speed;
        }
    });

    return (
        <group position={[0, 0, 0.15]}>
            <mesh ref={outerRef}>
                <boxGeometry args={[0.38, 0.38, 0.38]} />
                <meshStandardMaterial color={color} wireframe={true} emissive={color} emissiveIntensity={isHovered ? 1.5 : 0.8} />
            </mesh>
            <mesh ref={innerRef}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color="#005EB8" roughness={0.1} metalness={0.8} emissive="#005EB8" emissiveIntensity={isHovered ? 1.2 : 0.6} />
            </mesh>
        </group>
    );
}

function SynapticCluster({ color = "#005EB8", isHovered = false }) {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        const speed = isHovered ? 2.5 : 1.0;
        if (groupRef.current) {
            groupRef.current.rotation.z += delta * 0.3 * speed;
            groupRef.current.rotation.y += delta * 0.4 * speed;
        }
    });

    const p1: [number, number, number] = [0, 0.18, 0];
    const p2: [number, number, number] = [-0.18, -0.12, 0];
    const p3: [number, number, number] = [0.18, -0.12, 0];

    const linesObj = useMemo(() => {
        const points = [
            new THREE.Vector3(...p1), new THREE.Vector3(...p2),
            new THREE.Vector3(...p2), new THREE.Vector3(...p3),
            new THREE.Vector3(...p3), new THREE.Vector3(...p1)
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
        return new THREE.LineSegments(geo, mat);
    }, []);

    return (
        <group ref={groupRef} position={[0, 0, 0.15]}>
            <mesh position={p1}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHovered ? 1.5 : 0.8} />
            </mesh>
            <mesh position={p2}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={isHovered ? 1.5 : 0.8} />
            </mesh>
            <mesh position={p3}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isHovered ? 1.5 : 0.8} />
            </mesh>
            <primitive object={linesObj} />
        </group>
    );
}

function AscendingLadder({ color = "#005EB8", isHovered = false }) {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        const speed = isHovered ? 2.0 : 1.0;
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5 * speed;
        }
    });

    return (
        <group ref={groupRef} position={[0, -0.05, 0.15]}>
            <mesh position={[0, -0.12, 0]}>
                <boxGeometry args={[0.35, 0.08, 0.35]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.24, 0.08, 0.24]} />
                <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={isHovered ? 1.2 : 0.6} roughness={0.2} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[0.13, 0.08, 0.13]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={isHovered ? 1.5 : 0.8} roughness={0.1} metalness={0.9} />
            </mesh>
        </group>
    );
}

// --- Main Node Frame Component ---

interface WorkflowNodeProps {
    id: number;
    position: [number, number, number];
    title?: string;
    color?: string;
    delay?: number;
    hoveredNode: number | null;
    setHoveredNode: (id: number | null) => void;
    isMobile: boolean;
}

function WorkflowNode({ id, position, title = "", color = "#005eb8", delay = 0, hoveredNode, setHoveredNode, isMobile }: WorkflowNodeProps) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime + delay;
        const isHovered = hoveredNode === id && !isMobile;
        
        // Gentle floating
        groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.08;

        // Smooth scale on hover (+15%)
        const targetScale = isHovered ? 1.15 : 1.0;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    });

    const isHovered = hoveredNode === id && !isMobile;

    return (
        <group 
            ref={groupRef} 
            position={position}
            onPointerOver={(e) => {
                if (isMobile) return;
                e.stopPropagation();
                setHoveredNode(id);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                if (isMobile) return;
                setHoveredNode(null);
                document.body.style.cursor = 'auto';
            }}
        >
            {/* Pristine Frosted-Glass Rounded Box */}
            <RoundedBox args={[1.4, 0.95, 0.18]} radius={0.1} smoothness={10}>
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.15}
                    metalness={0.05}
                    transmission={0.6}
                    thickness={1.0}
                    ior={1.5}
                    transparent={true}
                    opacity={0.8}
                    emissive="#ffffff"
                    emissiveIntensity={0.1}
                />
            </RoundedBox>

            {/* Glowing border accent matching strict brand colors */}
            <RoundedBox args={[1.42, 0.97, 0.12]} radius={0.11} smoothness={10}>
                <meshStandardMaterial color={color} wireframe={true} transparent opacity={0.35} />
            </RoundedBox>

            {/* Specific Service Visual based on ID */}
            {id === 1 && <NestedHypercube color={color} isHovered={isHovered} />}
            {id === 2 && <SynapticCluster color={color} isHovered={isHovered} />}
            {id === 3 && <AscendingLadder color={color} isHovered={isHovered} />}
        </group>
    );
}

// --- Glowing Neon Bezier Tube Connections ---

function NeonConnectingTube({ start, end, color = "#F97316", startId, endId, hoveredNode }: { start: [number, number, number], end: [number, number, number], color?: string, startId: number, endId: number, hoveredNode: number | null }) {
    const curve = useMemo(() => {
        const p1 = new THREE.Vector3(...start);
        const p2 = new THREE.Vector3(...end);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        mid.y += (Math.random() - 0.5) * 0.6;
        mid.z += (Math.random() - 0.5) * 0.8;
        return new THREE.CatmullRomCurve3([p1, mid, p2]);
    }, [start, end]);

    const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.035, 8, false), [curve]);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state) => {
        if (!matRef.current) return;
        const isConnectedHovered = hoveredNode === startId || hoveredNode === endId;
        const baseIntensity = isConnectedHovered ? 2.5 : 1.0;
        // Sophisticated breathing pulse sine wave
        const pulse = Math.sin(state.clock.elapsedTime * 3 + startId * 2) * 0.4 + 0.6; // 0.2 to 1.0
        matRef.current.emissiveIntensity = THREE.MathUtils.lerp(matRef.current.emissiveIntensity, baseIntensity * pulse, 0.1);
        matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, isConnectedHovered ? 0.9 : 0.6, 0.1);
    });

    return (
        <mesh geometry={tubeGeo}>
            <meshStandardMaterial 
                ref={matRef} 
                color={color} 
                emissive={color} 
                emissiveIntensity={1.0} 
                roughness={0.2} 
                metalness={0.1} 
                transparent={true} 
                opacity={0.6} 
            />
        </mesh>
    );
}

function WebSceneContainer() {
    const groupRef = useRef<THREE.Group>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const targetRotationX = useRef(0);
    const targetRotationY = useRef(0);
    const scrollYRef = useRef(0);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);

        const handleScroll = () => {
            scrollYRef.current = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        
        // Scroll tilt: tilt backward when scrolled down, forward scrolling up. NO zoom.
        const maxScroll = 800;
        const scrollProgress = Math.min(scrollYRef.current / maxScroll, 1.0);
        const scrollTiltX = scrollProgress * 0.7;

        if (!isMobile) {
            const { x, y } = state.pointer; // Normalized -1 to 1
            targetRotationX.current = THREE.MathUtils.lerp(targetRotationX.current, y * 0.35 + scrollTiltX, 0.08);
            targetRotationY.current = THREE.MathUtils.lerp(targetRotationY.current, x * 0.45, 0.08);
        } else {
            targetRotationX.current = THREE.MathUtils.lerp(targetRotationX.current, scrollTiltX, 0.08);
            targetRotationY.current = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
        }

        groupRef.current.rotation.x = targetRotationX.current;
        groupRef.current.rotation.y = targetRotationY.current;
    });

    // 3 Major Hero Hub Nodes in Triangular Constellation
    const scaleFactor = isMobile ? 0.6 : 0.85;
    
    const n1: [number, number, number] = [-2.6 * scaleFactor, 1.2 * scaleFactor, -0.2]; // Tech & AI Hub (Left)
    const n2: [number, number, number] = [0, -1.2 * scaleFactor, 0.3];                  // Strategy & Network (Bottom Center)
    const n3: [number, number, number] = [2.6 * scaleFactor, 1.2 * scaleFactor, -0.2];  // Growth & Scale Hub (Right)

    return (
        <group ref={groupRef}>
            {/* 3 Major Floating Hero Nodes */}
            <WorkflowNode id={1} position={n1} color="#F97316" delay={0} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} isMobile={isMobile} />
            <WorkflowNode id={2} position={n2} color="#005EB8" delay={0.8} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} isMobile={isMobile} />
            <WorkflowNode id={3} position={n3} color="#F97316" delay={1.6} hoveredNode={hoveredNode} setHoveredNode={setHoveredNode} isMobile={isMobile} />
            
            {/* Triangular Neon Light Pipe Circuit */}
            <NeonConnectingTube start={n1} end={n2} color="#F97316" startId={1} endId={2} hoveredNode={hoveredNode} />
            <NeonConnectingTube start={n2} end={n3} color="#005EB8" startId={2} endId={3} hoveredNode={hoveredNode} />
            <NeonConnectingTube start={n3} end={n1} color="#F97316" startId={3} endId={1} hoveredNode={hoveredNode} />
        </group>
    );
}

export default function Hero3DCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, margin: '200px' });
    const [dpr, setDpr] = useState(1);
    
    useEffect(() => {
        setDpr(Math.min(window.devicePixelRatio, 2));
    }, []);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', minHeight: '500px' }}>
            {isInView && (
                <Canvas
                    camera={{ position: [0, 0, 11.5], fov: 42 }}
                    dpr={dpr}
                    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'auto' }}
                >
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#005eb8" />
                    <WebSceneContainer />
                </Canvas>
            )}
        </div>
    );
}
