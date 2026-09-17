import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import { company } from '@/lib/company';
import { siteUrl } from '@/lib/site';
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

const title = 'TechVedyaa | Digital Solutions & Business Intelligence Provider';
const description =
  'TechVedyaa India Pvt Ltd is a digital solutions and business intelligence provider for modern businesses: marketing automation, AI-powered solutions, analytics and reporting, custom technology, and brand strategy, plus a specialized recruitment practice for the manufacturing sector.';

export const metadata: Metadata = {
  /* Every relative URL in metadata — canonicals, OG images — resolves against
     this. Without it Next emits relative OG URLs, which crawlers reject. */
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords:
    'digital solutions provider, business intelligence, marketing automation, AI-powered solutions, predictive analytics, custom software development, brand strategy consulting, B2B lead generation, manufacturing recruitment, TechVedyaa',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: company.shortName,
    locale: 'en_US',
    url: '/',
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

import Navbar from '@/components/sections/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import CustomCursor from '@/components/CustomCursor';
import ScrollProgress from '@/components/ScrollProgress';
import Analytics from '@/components/Analytics';
import CookieConsent from '@/components/CookieConsent';
import ComplianceCheck from '@/components/ComplianceCheck';
import StructuredData from '@/components/StructuredData';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${clashDisplay.variable}`} suppressHydrationWarning>
      <body>
        <StructuredData />
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
          <ScrollProgress />
          <SmoothScrollProvider>
            <Navbar />
            {children}
          </SmoothScrollProvider>
          {/* Both render null today: no analytics provider is configured, so
              nothing loads and no consent is needed. See lib/analytics.ts. */}
          <Analytics />
          <CookieConsent />
          <ComplianceCheck />
        </ThemeProvider>
      </body>
    </html>
  );
}
