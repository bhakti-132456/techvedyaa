'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface HeroImageProps {
    src: string;
    alt: string;
    overlay?: boolean;
    priority?: boolean;
}

export default function HeroImage({ src, alt, overlay = true, priority = false }: HeroImageProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
        <div ref={ref} className="relative w-full h-[80vh] overflow-hidden">
            <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    className="object-cover"
                    sizes="100vw"
                />
            </motion.div>

            {overlay && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-tv-bg backdrop-blur-[2px]" />
            )}
        </div>
    );
}
