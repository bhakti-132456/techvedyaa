'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const videos = [
    {
        id: 1,
        title: "Automation Workflow",
        thumbnail: "/images/automation_cinematic.png",
        videoSrc: "/videos/video_automation_hero_n8n.mp4"
    },
    {
        id: 2,
        title: "AI Video Ads",
        thumbnail: "/images/hero_ai_ads_cinematic.png",
        videoSrc: "/videos/video_ai_ads_hero.mp4"
    },
    // Add more placeholders if needed
];

export default function VideoGallery() {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
                <div
                    key={video.id}
                    className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-white/10"
                    onClick={() => setSelectedVideo(video.videoSrc)}
                >
                    <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 bg-tv-teal/90 rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-bold">{video.title}</h3>
                    </div>
                </div>
            ))}

            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="absolute top-4 right-4 z-10 text-white hover:text-tv-teal"
                                onClick={() => setSelectedVideo(null)}
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <video
                                src={selectedVideo}
                                controls
                                autoPlay
                                className="w-full h-full"
                                crossOrigin="anonymous"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
