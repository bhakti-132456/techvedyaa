'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
    {
        quote: "TechVedyaa transformed our marketing workflow. The automation saved us 20+ hours a week.",
        author: "Sarah J., Marketing Director",
        role: "SaaS Enterprise"
    },
    {
        quote: "The AI video ads generated were stunning and performed 3x better than our manual creatives.",
        author: "Mike T., CEO",
        role: "E-commerce Brand"
    },
    {
        quote: "Professional, efficient, and cutting-edge. Highly recommend for any digital transformation needs.",
        author: "Priya R., Operations Head",
        role: "FinTech Startup"
    }
];

export default function TestimonialSlider() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full max-w-4xl mx-auto px-6 py-12">
            <div className="relative h-64 md:h-48">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center"
                    >
                        <p className="text-2xl md:text-3xl text-tv-offwhite font-light italic mb-6">
                            &quot;{testimonials[current].quote}&quot;
                        </p>
                        <div>
                            <p className="text-tv-teal font-bold">{testimonials[current].author}</p>
                            <p className="text-gray-500 text-sm">{testimonials[current].role}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex justify-center space-x-2 mt-4">
                {testimonials.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-3 h-3 rounded-full transition-colors ${idx === current ? 'bg-tv-teal' : 'bg-gray-700 hover:bg-gray-500'
                            }`}
                        aria-label={`Go to testimonial ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
