'use client';

import dynamic from 'next/dynamic';
import ReactiveEnvironment from './ReactiveEnvironment';
import LocomotionEngine from './LocomotionEngine';

/* One WebGL context for every 3D view on the page. Mounted here rather than
   inside a section, because both the services panels and the capability cards
   portal into it via drei <View>. */
const SharedModelCanvas = dynamic(
    () => import('@/components/3d/ServiceScenes').then((m) => ({ default: m.SharedModelCanvas })),
    { ssr: false }
);

export default function ClientIslands() {
    return (
        <>
            <ReactiveEnvironment />
            <LocomotionEngine />
            <SharedModelCanvas />
        </>
    );
}
