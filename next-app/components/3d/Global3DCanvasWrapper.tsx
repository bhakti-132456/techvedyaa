'use client';
import dynamic from 'next/dynamic';
const Global3DCanvas = dynamic(() => import('./Global3DCanvas'), { ssr: false });
export default Global3DCanvas;
