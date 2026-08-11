import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import '../styles/tokens.css';
import '../styles/reset.css';
import '../styles/animations.css';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

/* Display face for headlines, numerals and marquee type
   (Clash Display — Fontshare/ITF free license, self-hosted) */
const clashDisplay = localFont({
  src: [
    { path: '../fonts/ClashDisplay-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/ClashDisplay-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/ClashDisplay-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/ClashDisplay-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TechVedyaa | Strategic Growth & Transformation Partner for Manufacturing',
  description:
    'TechVedyaa India Pvt Ltd is a strategic growth and transformation partner for modern businesses, with deep domain expertise in manufacturing: specialized manufacturing recruitment, digital transformation, marketing & sales strategy consulting, and digital & product marketing services.',
  keywords:
    'manufacturing recruitment, manufacturing digital transformation, smart factory, IIoT advisory, marketing strategy consulting, go-to-market strategy, product marketing, B2B lead generation, marketing automation, TechVedyaa',
};

import Navbar from '@/components/sections/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import CustomCursor from '@/components/CustomCursor';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${clashDisplay.variable}`} suppressHydrationWarning>
      <body>
        {/* Motion gate: adds .anim before first paint so reveal targets
            start hidden — skipped entirely under reduced motion. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('anim')}}catch(e){}})()",
          }}
        />
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <CustomCursor />
          <SmoothScrollProvider>
            <Navbar />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
