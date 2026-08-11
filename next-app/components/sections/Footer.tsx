'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styles from './Footer.module.css';

export default function Footer() {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <Link href="/" className={styles.logoLink}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={mounted && theme === 'dark' ? "/assets/techvedyaa_logo_dark.png" : "/assets/logo-full.png"}
                        alt="TechVedyaa"
                        className={styles.logo}
                    />
                </Link>

                <nav className={styles.links} aria-label="Footer" data-reveal-group>
                    <Link href="#services" className={styles.link} data-reveal-item>Services</Link>
                    <Link href="#methodology" className={styles.link} data-reveal-item>Approach</Link>
                    <Link href="#contact" className={styles.link} data-reveal-item>Contact</Link>
                </nav>

                <p className={styles.copyright} data-reveal="fade">
                    © {new Date().getFullYear()} TechVedyaa. All rights reserved.
                </p>

                {/* Attribution required by the Sketchfab Standard licence on two
                    of the 3D models. Kept deliberately quiet: smallest type on
                    the page, muted until hovered. */}
                <p className={styles.credits}>
                    3D models:{' '}
                    <a
                        href="https://sketchfab.com/assetfactory"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                    >
                        assetfactory
                    </a>
                    ,{' '}
                    <a
                        href="https://sketchfab.com/LandonWright"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                    >
                        Landon Wright
                    </a>{' '}
                    (Sketchfab) ·{' '}
                    <a href="https://polyhaven.com" target="_blank" rel="noopener noreferrer nofollow">
                        Poly Haven
                    </a>{' '}
                    (CC0)
                </p>
            </div>
        </footer>
    );
}
