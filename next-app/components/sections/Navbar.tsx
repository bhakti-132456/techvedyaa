'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`} data-nav-reveal>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={mounted && theme === 'dark' ? "/assets/techvedyaa_logo_dark.png" : "/assets/techvedyaa_logo_new.png"}
                        alt="TechVedyaa"
                        className={styles.logoImg}
                    />
                </Link>

                <button 
                    className={`${styles.mobileMenuBtn} ${isMobileMenuOpen ? styles.open : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={styles.hamburgerLine}></span>
                    <span className={styles.hamburgerLine}></span>
                    <span className={styles.hamburgerLine}></span>
                </button>

                <ul className={`${styles.navMenu} ${isMobileMenuOpen ? styles.navMenuOpen : ''}`}>
                    {/* Order mirrors the page: pillars -> services -> about -> methodology -> process */}
                    <li><Link href="#pillars" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Capabilities</Link></li>
                    <li><Link href="#services" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Services</Link></li>
                    <li><Link href="#about" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
                    <li><Link href="#methodology" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Approach</Link></li>
                    <li><Link href="#process" className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Process</Link></li>
                    <li><Link href="#contact" className={`${styles.navLink} ${styles.navCta}`} onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link></li>
                    {mounted && (
                        <li>
                            <div className={styles.themeSwitchContainer}>
                                <label className={styles.themeSwitch}>
                                    <input 
                                        type="checkbox" 
                                        checked={theme === 'dark'}
                                        onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        aria-label="Toggle Dark Mode"
                                    />
                                    <span className={styles.themeSlider}>
                                        {/* Sun icon */}
                                        <svg className={styles.iconSun} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        {/* Moon icon */}
                                        <svg className={styles.iconMoon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
