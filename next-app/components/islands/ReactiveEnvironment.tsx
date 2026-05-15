'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import styles from './ReactiveEnvironment.module.css';

// ============================================
// GLSL Shaders — Circuit Board + Wave Ripples
// ============================================

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader:
 * - Procedural circuit board pattern via 2D simplex noise
 * - Wave interference ripples from cursor velocity
 * - 150px glow radius around cursor
 * - Light traces along circuit paths near cursor
 * - mediump precision for mobile (injected via prefix)
 */
const fragmentShaderBody = /* glsl */ `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_mouseVelocity;
  uniform sampler2D u_noiseTexture;
  uniform float u_theme; // 0.0 = light, 1.0 = dark

  varying vec2 vUv;

  // ---- 2D Simplex Noise (Ashima Arts) ----
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x_) - 0.5;
    vec3 ox = floor(x_ + 0.5);
    vec3 a0 = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // ---- Circuit Board Pattern ----
  float circuitPattern(vec2 uv, float scale) {
    vec2 grid = fract(uv * scale);
    vec2 center = abs(grid - 0.5);

    // Horizontal and vertical traces
    float hLine = smoothstep(0.48, 0.5, 1.0 - center.y) * step(center.x, 0.4);
    float vLine = smoothstep(0.48, 0.5, 1.0 - center.x) * step(center.y, 0.4);

    // Circuit nodes at intersections
    float node = 1.0 - smoothstep(0.05, 0.08, length(grid - 0.5));

    // Noise-driven path selection
    float noise = snoise(uv * scale * 0.5 + u_time * 0.02);
    float pathSelect = step(0.1, noise);

    return (hLine * pathSelect + vLine * (1.0 - pathSelect)) * 0.5 + node * 0.8;
  }

  // ---- Wave Interference ----
  float waveInterference(vec2 uv, vec2 center, float velocity) {
    float dist = length(uv - center);
    float wave1 = sin(dist * 40.0 - u_time * 3.0) * 0.5 + 0.5;
    float wave2 = sin(dist * 60.0 - u_time * 4.5 + 1.57) * 0.5 + 0.5;
    float interference = wave1 * wave2;
    float falloff = 1.0 - smoothstep(0.0, 0.25, dist);
    return interference * falloff * min(velocity * 2.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 uvAspect = uv * aspect;

    // Base noise from PCB texture
    vec4 noiseTex = texture2D(u_noiseTexture, uv * 2.0 + u_time * 0.005);

    // Multi-octave circuit pattern
    float circuit = 0.0;
    circuit += circuitPattern(uvAspect, 8.0) * 0.5;
    circuit += circuitPattern(uvAspect + 0.33, 16.0) * 0.3;
    circuit += circuitPattern(uvAspect + vec2(noiseTex.r * 0.1), 32.0) * 0.2;

    // Subtle noise overlay
    float bgNoise = snoise(uvAspect * 3.0 + u_time * 0.03) * 0.5 + 0.5;

    // Mouse position in UV space
    vec2 mouseUV = u_mouse * aspect;
    float mouseDist = length(uvAspect - mouseUV);

    // 150px radius glow (normalized to UV space, ~150px / viewport avg)
    float glowRadius = 150.0 / min(u_resolution.x, u_resolution.y);
    float glow = 1.0 - smoothstep(0.0, glowRadius, mouseDist);

    // Wave interference near cursor
    float waves = waveInterference(uvAspect, mouseUV, u_mouseVelocity);

    // Light traces: boost circuit brightness near cursor
    float lightTrace = circuit * glow * 3.0;

    // Theme-dependent colors
    vec3 bgColor = mix(vec3(0.98, 0.98, 1.0), vec3(0.06, 0.067, 0.09), u_theme);
    vec3 circuitColor = mix(
      vec3(0.0, 0.37, 0.72),  // Light theme: blue
      vec3(0.29, 0.66, 1.0),  // Dark theme: bright blue
      u_theme
    );
    vec3 glowColor = mix(
      vec3(0.0, 0.37, 0.72),
      vec3(0.41, 0.73, 1.0),
      u_theme
    );
    vec3 waveColor = mix(
      vec3(1.0, 0.48, 0.3),   // Light theme: orange
      vec3(1.0, 0.58, 0.44),  // Dark theme: warm orange
      u_theme
    );

    // Compose final color
    vec3 color = bgColor;
    color += circuitColor * circuit * mix(0.03, 0.06, u_theme);
    color += circuitColor * bgNoise * 0.015;
    color += glowColor * lightTrace * 0.15;
    color += waveColor * waves * 0.12;
    color += glowColor * glow * u_mouseVelocity * 0.08;

    // Very subtle overall opacity to not overpower content
    float alpha = mix(0.04, 0.08, u_theme) + circuit * 0.02 + lightTrace * 0.06 + waves * 0.04;

    gl_FragColor = vec4(color, alpha);
  }
`;

// Inject precision qualifier based on device
function getFragmentShader(isMobile: boolean): string {
    const precision = isMobile ? 'precision mediump float;' : 'precision highp float;';
    return `${precision}\n${fragmentShaderBody}`;
}

// ============================================
// CircuitBoardMesh — The full-screen quad
// ============================================

function CircuitBoardMesh({ isMobile }: { isMobile: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport, size } = useThree();
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const prevMouseRef = useRef({ x: 0.5, y: 0.5 });
    const velocityRef = useRef(0);
    const themeRef = useRef(0);

    const noiseTexture = useTexture('/textures/pcb-noise.jpg');
    noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

    const fragmentShader = useMemo(() => getFragmentShader(isMobile), [isMobile]);

    const uniforms = useMemo(
        () => ({
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(size.width, size.height) },
            u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_mouseVelocity: { value: 0 },
            u_noiseTexture: { value: noiseTexture },
            u_theme: { value: 0 },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [noiseTexture]
    );

    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX / window.innerWidth,
                y: 1.0 - e.clientY / window.innerHeight,
            };
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Track theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            const theme = document.documentElement.getAttribute('data-theme');
            themeRef.current = theme === 'dark' ? 1.0 : 0.0;
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        // Initial check
        const theme = document.documentElement.getAttribute('data-theme');
        themeRef.current = theme === 'dark' ? 1.0 : 0.0;
        return () => observer.disconnect();
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.ShaderMaterial;

        material.uniforms.u_time.value = state.clock.elapsedTime;
        material.uniforms.u_resolution.value.set(size.width, size.height);

        // Smooth mouse tracking
        const targetX = mouseRef.current.x;
        const targetY = mouseRef.current.y;
        const currentMouse = material.uniforms.u_mouse.value;
        currentMouse.x += (targetX - currentMouse.x) * 0.08;
        currentMouse.y += (targetY - currentMouse.y) * 0.08;

        // Mouse velocity (distance moved per frame)
        const dx = mouseRef.current.x - prevMouseRef.current.x;
        const dy = mouseRef.current.y - prevMouseRef.current.y;
        const rawVelocity = Math.sqrt(dx * dx + dy * dy);
        velocityRef.current += (rawVelocity * 10 - velocityRef.current) * 0.1;
        material.uniforms.u_mouseVelocity.value = Math.min(velocityRef.current, 1.0);

        prevMouseRef.current = { ...mouseRef.current };

        // Smooth theme transition
        material.uniforms.u_theme.value +=
            (themeRef.current - material.uniforms.u_theme.value) * 0.05;
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
}

// ============================================
// ReactiveEnvironment — Public Component
// ============================================

export default function ReactiveEnvironment() {
    const [isMobile, setIsMobile] = useState(false);
    const [dpr, setDpr] = useState(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        const check = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            setDpr(mobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
        };
        check();
        window.addEventListener('resize', check);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', check);
        };
    }, []);

    if (!mounted) return null;

    return (
        <div className={styles.canvas} aria-hidden="true">
            <Canvas
                dpr={dpr}
                gl={{
                    alpha: true,
                    antialias: false,
                    powerPreference: isMobile ? 'low-power' : 'high-performance',
                    precision: isMobile ? 'mediump' : 'highp',
                }}
                camera={{ position: [0, 0, 1] }}
                frameloop="always"
                style={{ pointerEvents: 'none' }}
            >
                <CircuitBoardMesh isMobile={isMobile} />
            </Canvas>
        </div>
    );
}

