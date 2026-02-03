'use client';

import { useState } from 'react';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => setStatus('success'), 1500);
    };

    return (
        <div className="pt-32 pb-20 container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-tv-offwhite mb-6">
                        Get in <span className="text-tv-teal">Touch</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Ready to start your automation journey? Fill out the form below and we&apos;ll get back to you within 24 hours.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-tv-teal transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-tv-teal transition-colors"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                        <textarea
                            id="message"
                            rows={4}
                            required
                            className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-tv-teal transition-colors"
                            placeholder="Tell us about your project..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'submitting' || status === 'success'}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${status === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-tv-teal text-tv-bg hover:bg-white'
                            }`}
                    >
                        {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
}
