'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    { title: "Discovery", description: "We analyze your current workflows and identify bottlenecks." },
    { title: "Strategy", description: "We design a custom automation blueprint tailored to your needs." },
    { title: "Implementation", description: "We build and integrate the automation systems seamlessly." },
    { title: "Optimization", description: "Continuous monitoring and refinement for maximum efficiency." }
];

export default function WorkflowInfographic() {
    const containerRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !lineRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(lineRef.current,
                { height: '0%' },
                {
                    height: '100%',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top center',
                        end: 'bottom center',
                        scrub: 0.5,
                    }
                }
            );

            (gsap.utils.toArray('.step-item') as Element[]).forEach((item) => {
                gsap.fromTo(item,
                    { opacity: 0, x: -50 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative py-20 px-6 max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-20 bottom-20 w-1 bg-gray-800 -translate-x-1/2">
                <div ref={lineRef} className="w-full bg-tv-teal origin-top" />
            </div>

            <div className="space-y-12">
                {steps.map((step, index) => (
                    <div key={index} className={`step-item relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                        {/* Dot */}
                        <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-tv-teal rounded-full -translate-x-1/2 z-10 shadow-[0_0_10px_#00d6d6]" />

                        {/* Content */}
                        <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`}>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-tv-teal/30 transition-colors">
                                <h3 className="text-xl font-bold text-tv-offwhite mb-2">{step.title}</h3>
                                <p className="text-gray-400">{step.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
