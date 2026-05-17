'use client';

import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
import { useEffect, useState } from 'react';

export default function Global3DCanvas() {
    const [dpr, setDpr] = useState(1);
    
    useEffect(() => {
        setDpr(Math.min(window.devicePixelRatio, 2));
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 100 }}>
            <Canvas
                gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
                dpr={dpr}
                camera={{ position: [0, 0, 2.8], fov: 42 }}
                style={{ pointerEvents: 'none' }}
            >
                <View.Port />
            </Canvas>
        </div>
    );
}
