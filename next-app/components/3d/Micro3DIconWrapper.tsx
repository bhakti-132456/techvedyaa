'use client';
import dynamic from 'next/dynamic';
const Micro3DIcon = dynamic(() => import('./Micro3DIcon'), { ssr: false });
export default Micro3DIcon;
