'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface HeroVideoProps {
    mp4: string;
    webm?: string;
    poster: string;
}

export default function HeroVideo({ mp4, webm, poster }: HeroVideoProps) {
    const [isPlaying, setIsPlaying] = useState(true);
    const [shouldPlay, setShouldPlay] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Check for reduced motion preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
            setShouldPlay(false);
            setIsPlaying(false);
        }

        const handleChange = () => {
            if (mediaQuery.matches) {
                setShouldPlay(false);
                setIsPlaying(false);
                if (videoRef.current) videoRef.current.pause();
            } else {
                setShouldPlay(true);
                setIsPlaying(true);
                if (videoRef.current) videoRef.current.play();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="relative w-full h-[80vh] overflow-hidden bg-black">
            <video
                ref={videoRef}
                autoPlay={shouldPlay}
                muted
                loop
                playsInline
                poster={poster}
                className="absolute inset-0 w-full h-full object-cover"
                crossOrigin="anonymous"
            >
                {webm && <source src={webm} type="video/webm" />}
                <source src={mp4} type="video/mp4" />
                {/* Fallback image if video fails or not supported */}
                <div className="absolute inset-0 -z-10">
                    <Image src={poster} alt="Hero Background" fill className="object-cover" />
                </div>
            </video>

            <div className="absolute inset-0 bg-black/40" />

            <button
                onClick={togglePlay}
                className="absolute bottom-8 right-8 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-tv-teal hover:text-black transition-colors"
                aria-label={isPlaying ? "Pause background video" : "Play background video"}
            >
                {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
            </button>
        </div>
    );
}
