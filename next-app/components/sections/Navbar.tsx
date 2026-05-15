'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    <img
                        src={mounted && theme === 'dark' ? "/assets/techvedyaa_logo_dark.png" : "/assets/techvedyaa_logo_new.png"}
                        alt="TechVedyaa"
                        className={styles.logoImg}
                    />
                </Link>

                <ul className={styles.navMenu}>
                    <li><Link href="#services" className={styles.navLink}>Services</Link></li>
                    <li><Link href="#methodology" className={styles.navLink}>Approach</Link></li>
                    <li><Link href="#process" className={styles.navLink}>Process</Link></li>
                    <li><Link href="#contact" className={`${styles.navLink} ${styles.navCta}`}>Get Started</Link></li>
                    {mounted && (
                        <li>
                            <button 
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={styles.themeToggle}
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
