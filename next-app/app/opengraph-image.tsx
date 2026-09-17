import { ImageResponse } from 'next/og';

/* ============================================
   Open Graph / Twitter card, 1200x630

   The file convention means Next wires this into <meta property="og:image">
   and twitter:image for every route that inherits the root metadata, and
   fingerprints the URL so shares re-fetch after a change.

   Rendered with the bundled default face rather than Clash Display: satori
   cannot read woff2, and the four Clash weights in fonts/ are woff2 only.
   Supplying a .ttf or .otf here and passing it via `fonts` would put the real
   display face on the card.
   ============================================ */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt =
    'TechVedyaa: digital solutions and business intelligence for modern businesses';

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: '#0A0A0B',
                    padding: '72px 80px',
                    position: 'relative',
                }}
            >
                {/* Brand wash. Satori only understands the simple gradient forms,
                    so this is a plain angled linear-gradient rather than the
                    sized radial pair the site itself uses. */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'linear-gradient(120deg, rgba(0,94,184,0.55) 0%, rgba(0,94,184,0.10) 42%, rgba(10,10,11,0) 66%, rgba(249,115,22,0.20) 100%)',
                    }}
                />
                {/* accent rule along the bottom edge */}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 10,
                        background: 'linear-gradient(90deg, #005EB8 0%, #5FB2FF 48%, #F97316 100%)',
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div
                        style={{
                            width: 14,
                            height: 44,
                            borderRadius: 999,
                            background: 'linear-gradient(180deg, #5FB2FF 0%, #F97316 100%)',
                        }}
                    />
                    <div
                        style={{
                            fontSize: 30,
                            letterSpacing: '0.24em',
                            color: '#E8E8EA',
                            fontWeight: 600,
                        }}
                    >
                        TECHVEDYAA
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                    <div
                        style={{
                            fontSize: 74,
                            lineHeight: 1.06,
                            letterSpacing: '-0.03em',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            maxWidth: 940,
                        }}
                    >
                        Digital solutions and business intelligence
                    </div>
                    <div
                        style={{
                            fontSize: 31,
                            lineHeight: 1.4,
                            color: '#9A9AA2',
                            maxWidth: 880,
                        }}
                    >
                        Marketing automation, AI-powered solutions, analytics, custom technology
                        and brand strategy.
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        fontSize: 25,
                        letterSpacing: '0.16em',
                        color: '#5FB2FF',
                        fontWeight: 600,
                    }}
                >
                    <span>TALENT</span>
                    <span style={{ color: '#3A3A40' }}>/</span>
                    <span>TECHNOLOGY</span>
                    <span style={{ color: '#3A3A40' }}>/</span>
                    <span>MARKET GROWTH</span>
                </div>
            </div>
        ),
        size,
    );
}
