'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        /* Gate on pointer capability, not width. A narrow desktop window still
           has a mouse and should keep the cursor; a wide tablet has no mouse and
           would otherwise be left with a ring frozen at the origin. */
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const cursor = cursorRef.current;
        const dot = dotRef.current;
        if (!cursor || !dot) return;

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let revealed = false;

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            /* Both elements start at opacity 0. Until the pointer first moves we
               have no idea where it is, and drawing them at 0,0 puts a stray ring
               in the top-left corner of every first paint — visible in screenshots
               and on any page loaded without mouse movement. */
            if (!revealed) {
                revealed = true;
                gsap.set([cursor, dot], { x: mouseX, y: mouseY });
                gsap.to([cursor, dot], { opacity: 1, duration: 0.3, ease: 'power2.out' });
            }

            // Instantly move the dot
            gsap.to(dot, {
                x: mouseX,
                y: mouseY,
                duration: 0.1,
                ease: 'power2.out'
            });
        };

        const render = () => {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            
            gsap.set(cursor, {
                x: cursorX,
                y: cursorY
            });
            
            requestAnimationFrame(render);
        };

        window.addEventListener('mousemove', onMouseMove);
        requestAnimationFrame(render);

        // Magnetic buttons hover effect
        const buttons = document.querySelectorAll('button, a, .btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(cursor, {
                    scale: 3.5,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    duration: 0.3
                });
                gsap.to(dot, { opacity: 0, duration: 0.2 });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(cursor, {
                    scale: 1,
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-primary)',
                    duration: 0.3
                });
                gsap.to(dot, { opacity: 1, duration: 0.2 });
                gsap.to(btn, { x: 0, y: 0, duration: 0.3 }); // Reset magnet
            });
            
            btn.addEventListener('mousemove', (e: Event) => {
                const mouseEvent = e as MouseEvent;
                const rect = (btn as HTMLElement).getBoundingClientRect();
                const x = mouseEvent.clientX - rect.left - rect.width / 2;
                const y = mouseEvent.clientY - rect.top - rect.height / 2;
                
                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            // clean up hover listeners normally, but they're on static elements
        };
    }, []);

    return (
        <>
            <div 
                ref={cursorRef} 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-primary)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    opacity: 0,
                    transform: 'translate(-50%, -50%)',
                    mixBlendMode: 'difference',
                    transition: 'border 0.3s, background-color 0.3s'
                }}
            />
            <div 
                ref={dotRef} 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-secondary)',
                    pointerEvents: 'none',
                    zIndex: 10000,
                    opacity: 0,
                    transform: 'translate(-50%, -50%)',
                    mixBlendMode: 'difference'
                }}
            />
        </>
    );
}
