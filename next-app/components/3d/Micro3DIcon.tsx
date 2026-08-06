'use client';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import {
    Cpu,
    Megaphone,
    Bot,
    BarChart,
    Code,
    TrendingUp,
    Layers,
    Zap,
    CircleDashed
} from 'lucide-react';

interface IconProps {
    type?: string;
    className?: string;
}

export default function Micro3DIcon({ type = 'default', className = '' }: IconProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [hovered, setHovered] = useState(false);

    const IconComponent = useMemo(() => {
        if (!type) return CircleDashed;

        switch (type.toLowerCase()) {
            case 'marketing-communications':
            case 'marketcom':
            case 'pr':
                return Megaphone;
            case 'tech-solutions':
            case 'tech':
                return Cpu;
            case 'ai-solutions':
            case 'ai':
                return Bot;
            case 'marketing-automation':
            case 'automation-first':
                return Zap;
            case 'lms':
                return Layers;
            case 'data-analytics':
            case 'analytics':
                return BarChart;
            case 'development':
            case 'dev':
                return Code;
            case 'growth':
            case 'scale':
                return TrendingUp;
            default:
                // Determine icon based on string hash for consistent fallback
                let hash = 0;
                for (let i = 0; i < type.length; i++) {
                    hash = type.charCodeAt(i) + ((hash << 5) - hash);
                }
                const icons = [Cpu, Megaphone, Bot, BarChart, Code, TrendingUp, Layers, Zap, CircleDashed];
                return icons[Math.abs(hash) % icons.length];
        }
    }, [type]);

    const accent = useMemo(() => {
        if (type.includes('marketing') || type.includes('pr')) return isDark ? '#FF9570' : '#FF7A4D';
        if (type.includes('tech') || type.includes('ai') || type.includes('strategic')) return isDark ? '#4AA8FF' : '#005EB8';
        return isDark ? '#A78BFA' : '#7C3AED';
    }, [type, isDark]);

    return (
        <div
            className={`micro-icon ${className}`}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: 'var(--neu-surface)',
                borderRadius: '50%',
                boxShadow: hovered
                    ? 'var(--neu-shadow-float)'
                    : 'var(--neu-shadow-btn)',
                transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
                transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
                cursor: 'default',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <IconComponent
                size={32}
                color={hovered ? accent : 'var(--color-text-primary)'}
                strokeWidth={1.5}
                style={{
                    transition: 'color 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                }}
            />
            {/* Accent tick — appears on hover */}
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: '16%',
                    left: '50%',
                    width: '16px',
                    height: '2px',
                    borderRadius: '2px',
                    background: accent,
                    transform: hovered
                        ? 'translateX(-50%) scaleX(1)'
                        : 'translateX(-50%) scaleX(0)',
                    transformOrigin: 'center',
                    transition: 'transform 0.35s cubic-bezier(0.65, 0, 0.35, 1)',
                }}
            />
        </div>
    );
}
