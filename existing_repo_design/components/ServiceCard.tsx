'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ServiceCardProps {
    title: string;
    description: string;
    link: string;
    delay?: number;
}

export default function ServiceCard({ title, description, link, delay = 0 }: ServiceCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className="group p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-tv-teal/50"
        >
            <h3 className="text-2xl font-bold text-tv-offwhite mb-4 group-hover:text-tv-teal transition-colors">
                {title}
            </h3>
            <p className="text-gray-400 mb-6 line-clamp-3">
                {description}
            </p>
            <Link href={link} className="inline-flex items-center text-tv-teal font-semibold hover:underline">
                Learn More
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </Link>
        </motion.div>
    );
}
