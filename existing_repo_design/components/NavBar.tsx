'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-tv-bg/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/images/techvedyaa_logo.png"
                        alt="TechVedyaa"
                        width={200}
                        height={60}
                        priority
                        className="h-12 w-auto"
                    />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/services" className="text-tv-offwhite hover:text-tv-teal transition-colors">Services</Link>
                    <Link href="/automation" className="text-tv-offwhite hover:text-tv-teal transition-colors">Automation</Link>
                    <Link href="/ai-ads" className="text-tv-offwhite hover:text-tv-teal transition-colors">AI Ads</Link>
                    <Link href="/case-studies" className="text-tv-offwhite hover:text-tv-teal transition-colors">Case Studies</Link>
                    <Link href="/about" className="text-tv-offwhite hover:text-tv-teal transition-colors">About</Link>
                    <Link href="/contact" className="px-6 py-2 bg-tv-teal text-tv-bg font-bold rounded-full hover:bg-white transition-colors">
                        Book a Strategy Call
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-tv-offwhite"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-tv-bg border-t border-gray-800"
                    >
                        <div className="flex flex-col p-6 space-y-4">
                            <Link href="/services" className="text-tv-offwhite hover:text-tv-teal" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
                            <Link href="/automation" className="text-tv-offwhite hover:text-tv-teal" onClick={() => setIsMobileMenuOpen(false)}>Automation</Link>
                            <Link href="/ai-ads" className="text-tv-offwhite hover:text-tv-teal" onClick={() => setIsMobileMenuOpen(false)}>AI Ads</Link>
                            <Link href="/case-studies" className="text-tv-offwhite hover:text-tv-teal" onClick={() => setIsMobileMenuOpen(false)}>Case Studies</Link>
                            <Link href="/about" className="text-tv-offwhite hover:text-tv-teal" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                            <Link href="/contact" className="text-tv-teal font-bold" onClick={() => setIsMobileMenuOpen(false)}>Book a Strategy Call</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
