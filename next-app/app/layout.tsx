import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/reset.css';
import '../styles/animations.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TechVedyaa | Marketing & Automation Services | Digital Solutions Provider',
  description:
    'Comprehensive digital solutions provider specializing in integrated marketing, automation, and technology services. Elevate your brand with our expert services.',
  keywords:
    'marketing automation, AI solutions, tech solutions, brand strategy, social media marketing, PR services, LMS',
};

import Navbar from '@/components/sections/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
