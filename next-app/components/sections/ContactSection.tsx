'use client';

import { useState } from 'react';
import styles from './Contact.module.css';

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        whatsappEnabled: false,
        requirements: ''
    });
    
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

        // URL configured via environment variables (.env.local)
        const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';

        try {
            // Use GET with query parameters to avoid CORS preflight issues entirely.
            // Google Apps Script's doGet receives these via e.parameter.
            const params = new URLSearchParams();
            Object.keys(formData).forEach(key => {
                params.append(key, String(formData[key as keyof typeof formData]));
            });

            await fetch(`${SCRIPT_URL}?${params.toString()}`, {
                method: 'GET',
                mode: 'no-cors',
            });

            // With 'no-cors', response is opaque (status 0), so we assume success if no error is thrown
            setStatus('success');
            setFormData({ name: '', phone: '', email: '', whatsappEnabled: false, requirements: '' });
            
        } catch (error) {
            console.error('Submission error:', error);
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
                                    placeholder="John Doe"
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
                                    placeholder="john@example.com"
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
                                placeholder="+1 234 567 8900"
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
                                This number is available on WhatsApp
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
                            <div className={`${styles.statusMessage} ${styles.statusError}`}>
                                Oops! Something went wrong. Please try again later.
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}
