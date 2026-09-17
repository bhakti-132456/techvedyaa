'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Contact.module.css';

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        whatsappEnabled: false,
        consent: false,
        requirements: '',
        // Honeypot — hidden from humans, checked server-side.
        website: ''
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            /* Same-origin POST to our own route handler, which forwards to
               Apps Script server-side. Personal data stays in the body, the
               upstream endpoint stays private, and — unlike the previous
               no-cors call — this response is real, so a failure actually
               surfaces to the visitor instead of showing a false success. */
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json().catch(() => ({ ok: false }));

            if (!res.ok || !result.ok) {
                setErrorMessage(
                    result.error || 'We could not send that just now. Please try again.'
                );
                setStatus('error');
                return;
            }

            setStatus('success');
            setFormData({
                name: '',
                phone: '',
                email: '',
                whatsappEnabled: false,
                consent: false,
                requirements: '',
                website: ''
            });
        } catch (error) {
            console.error('Submission error:', error);
            setErrorMessage('We could not reach the server. Please try again.');
            setStatus('error');
        }
    };

    return (
        <section className={styles.contactSection} id="contact" data-flow>
            <div className="container">
                <div className={styles.contactHeader}>
                    <p className={styles.contactLabel} data-reveal="fade">Get In Touch</p>
                    <h2 className={styles.contactTitle} data-reveal="lines">
                        Let&apos;s Discuss Your <span className="gradient-text">Requirements</span>
                    </h2>
                    <p className={styles.contactDescription} data-reveal="fade">
                        Fill out the form below and our team will get back to you shortly to discuss how we can help elevate your business.
                    </p>
                </div>

                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name" className={styles.formLabel}>Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={styles.formInput}
                                    placeholder="Priya Sharma"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.formLabel}>Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={styles.formInput}
                                    placeholder="priya@company.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone" className={styles.formLabel}>Phone Number (International Format)</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className={styles.formInput}
                                placeholder="+91 98765 43210"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="whatsappEnabled"
                                name="whatsappEnabled"
                                className={styles.checkboxInput}
                                checked={formData.whatsappEnabled}
                                onChange={handleChange}
                            />
                            <label htmlFor="whatsappEnabled" className={styles.checkboxLabel}>
                                You may contact me on WhatsApp at this number
                            </label>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="requirements" className={styles.formLabel}>Your Requirements</label>
                            <textarea
                                id="requirements"
                                name="requirements"
                                className={styles.formTextarea}
                                placeholder="Tell us about your project or service needs..."
                                required
                                value={formData.requirements}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Honeypot. Hidden from people, irresistible to bots —
                            anything that fills it is discarded server-side. */}
                        <div className={styles.honeypot} aria-hidden="true">
                            <label htmlFor="website">Website</label>
                            <input
                                type="text"
                                id="website"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Consent. Unticked by default and required — a
                            pre-ticked box or an "by submitting you agree" line
                            is not a clear affirmative action, and so is not
                            valid consent under the DPDP Act. */}
                        <div className={styles.consentGroup}>
                            <input
                                type="checkbox"
                                id="consent"
                                name="consent"
                                className={styles.checkboxInput}
                                required
                                checked={formData.consent}
                                onChange={handleChange}
                            />
                            <label htmlFor="consent" className={styles.consentLabel}>
                                I agree to TechVedyaa storing these details to respond to my
                                enquiry, as described in the{' '}
                                <Link href="/privacy" className={styles.consentLink}>
                                    Privacy Policy
                                </Link>
                                . I can withdraw this at any time.
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Sending...' : 'Submit Request'}
                        </button>

                        {status === 'success' && (
                            <div className={`${styles.statusMessage} ${styles.statusSuccess}`}>
                                Thank you! Your request has been received. We&apos;ll be in touch soon.
                            </div>
                        )}
                        
                        {status === 'error' && (
                            <div className={`${styles.statusMessage} ${styles.statusError}`} role="alert">
                                {errorMessage || 'Something went wrong. Please try again later.'}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
