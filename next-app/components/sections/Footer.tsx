'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Footer() {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <footer style={{ padding: 'var(--spacing-2xl) 0', background: 'var(--color-bg-alt)', borderTop: '1px solid var(--color-border)' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                <Link href="/">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={mounted && theme === 'dark' ? "/assets/techvedyaa_logo_dark.png" : "/assets/logo-full.png"}
                        alt="TechVedyaa"
                        style={{ height: '100px', width: 'auto', objectFit: 'contain' }}
                    />
                </Link>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                        © {new Date().getFullYear()} TechVedyaa. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                        <Link href="#services" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>Services</Link>
                        <Link href="#methodology" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>Approach</Link>
                        <Link href="#contact" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
