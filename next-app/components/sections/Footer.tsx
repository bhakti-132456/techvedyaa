'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styles from './Footer.module.css';

const LINKS = [
    { href: '#pillars', label: 'Capabilities' },
    { href: '#services', label: 'Services' },
    { href: '#about', label: 'About' },
    { href: '#methodology', label: 'Approach' },
    { href: '#process', label: 'Process' },
    { href: '#contact', label: 'Contact' },
];

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
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logoLink}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={
                                    mounted && theme === 'dark'
                                        ? '/assets/techvedyaa_logo_dark.png'
                                        : '/assets/logo-full.png'
                                }
                                alt="TechVedyaa"
                                className={styles.logo}
                            />
                        </Link>
                        <p className={styles.tagline}>
                            <span className={styles.dot} aria-hidden="true" />
                            Strategic growth and transformation partner
                        </p>
                    </div>

                    <nav className={styles.nav} aria-label="Footer">
                        <span className={styles.navLabel}>Navigate</span>
                        <ul className={styles.links} data-reveal-group>
                            {LINKS.map((item) => (
                                <li key={item.href} data-reveal-item>
                                    <Link href={item.href} className={styles.link}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Oversized ghost wordmark, echoing the outlined numerals used
                    in the services and process sections */}
                <div className={styles.wordmark} aria-hidden="true">
                    TechVedyaa
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} TechVedyaa India Pvt Ltd. All rights reserved.
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
                        <a
                            href="https://polyhaven.com"
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                        >
                            Poly Haven
                        </a>{' '}
                        (CC0)
                    </p>
                </div>
            </div>
        </footer>
    );
}
