'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
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
                        src="/assets/techvedyaa_logo_new.png"
                        alt="TechVedyaa"
                        className={styles.logoImg}
                    />
                </Link>

                <ul className={styles.navMenu}>
                    <li><Link href="#services" className={styles.navLink}>Services</Link></li>
                    <li><Link href="#methodology" className={styles.navLink}>Approach</Link></li>
                    <li><Link href="#process" className={styles.navLink}>Process</Link></li>
                    <li><Link href="#contact" className={`${styles.navLink} ${styles.navCta}`}>Get Started</Link></li>
                </ul>
            </div>
        </nav>
    );
}
