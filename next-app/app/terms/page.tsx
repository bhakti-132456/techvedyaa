import type { Metadata } from 'next';
import Link from 'next/link';
import { company } from '@/lib/company';
import { Val, ReviewNotice } from '@/components/legal/LegalUI';
import Footer from '@/components/sections/Footer';
import styles from '../legal.module.css';

export const metadata: Metadata = {
    title: 'Terms of Use | TechVedyaa',
    description:
        'The terms governing use of the TechVedyaa website, including intellectual property, acceptable use, and limitation of liability.',
    alternates: { canonical: '/terms' },
    openGraph: {
        type: 'article',
        url: '/terms',
        title: 'Terms of Use | TechVedyaa',
    },
};

export default function Terms() {
    return (
        <>
            <main className={styles.page}>
                <div className="container">
                    <div className={styles.wrap}>
                        <p className={styles.eyebrow}>Legal</p>
                        <h1 className={styles.title}>Terms of Use</h1>
                        <p className={styles.updated}>
                            Last updated: <Val value={company.policyLastUpdated} label="policy date" />
                        </p>

                        <ReviewNotice />

                        <section className={styles.section}>
                            <h2>1. These terms</h2>
                            <p>
                                This website is operated by {company.legalName}. By using it you agree
                                to these terms. If you do not agree, please do not use the site.
                            </p>
                            <p>
                                These terms cover use of the website only. Any engagement for our
                                services is governed by a separate written agreement, which takes
                                precedence over anything here.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>2. What this site is</h2>
                            <p>
                                The content here describes our services and is provided for general
                                information. It is not professional, legal, financial, or technical
                                advice, and it is not an offer capable of acceptance. Nothing on this
                                site creates a client relationship. That begins only when we both
                                sign an engagement agreement.
                            </p>
                            <p>
                                We may change, suspend, or withdraw any part of the site at any time
                                without notice.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>3. Accuracy</h2>
                            <p>
                                We take care to keep the site accurate and current, but we make no
                                warranty that it is complete, error-free, or continuously available.
                                Service descriptions are indicative; actual scope, timelines, and
                                deliverables are agreed per engagement.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>4. Intellectual property</h2>
                            <p>
                                All content on this site, including text, design, graphics, code, and the
                                TechVedyaa name and logo, belongs to us or our licensors and is
                                protected by applicable intellectual property law.
                            </p>
                            <p>
                                You may view and print pages for your own reference. You may not
                                republish, sell, systematically copy, or use our branding without our
                                written permission. Certain third-party assets used on this site are
                                licensed to us and remain the property of their creators; those are
                                credited in the site footer.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>5. Acceptable use</h2>
                            <p>You agree not to:</p>
                            <ul>
                                <li>
                                    Use the enquiry form to send unsolicited advertising, spam, or
                                    unlawful, deceptive, or abusive content.
                                </li>
                                <li>
                                    Submit another person&rsquo;s personal data without their
                                    permission.
                                </li>
                                <li>
                                    Attempt to gain unauthorised access to the site or its underlying
                                    systems, or interfere with its normal operation.
                                </li>
                                <li>
                                    Scrape, harvest, or automatically extract content or data from
                                    the site.
                                </li>
                            </ul>
                        </section>

                        <section className={styles.section}>
                            <h2>6. Your submissions</h2>
                            <p>
                                Information you send through the enquiry form is handled as described
                                in our <Link href="/privacy">Privacy Policy</Link>. Please do not send
                                confidential or commercially sensitive information through the form.
                                We will tell you a secure route once we are in contact.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>7. External links</h2>
                            <p>
                                Where we link to third-party sites, we do so for convenience. We do
                                not control them and are not responsible for their content, security,
                                or privacy practices.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>8. Limitation of liability</h2>
                            <p>
                                To the fullest extent permitted by law, we are not liable for any
                                indirect, incidental, or consequential loss, or for loss of profit,
                                revenue, data, or business, arising from your use of, or inability to
                                use, this website.
                            </p>
                            <p>
                                Nothing in these terms limits liability that cannot lawfully be
                                limited, including for fraud or for death or personal injury caused by
                                negligence.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>9. Governing law</h2>
                            <p>
                                These terms are governed by the laws of India. The courts at{' '}
                                <Val value={company.jurisdiction} label="jurisdiction" /> have
                                exclusive jurisdiction over any dispute arising from them.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>10. Contact</h2>
                            <p>
                                Questions about these terms:{' '}
                                <Val value={company.email} label="contact email" />
                                <br />
                                {company.legalName}
                                <br />
                                <Val value={company.registeredAddress} label="registered address" />
                                <br />
                                CIN: <Val value={company.cin} label="CIN" />
                            </p>
                        </section>

                        <Link href="/" className={styles.backLink}>
                            <span aria-hidden="true">&larr;</span> Back to home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
