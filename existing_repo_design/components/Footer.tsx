import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-black py-12 border-t border-gray-900">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <Link href="/" className="mb-4 block">
                            <Image
                                src="/images/techvedyaa_logo.png"
                                alt="TechVedyaa"
                                width={180}
                                height={50}
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm">
                            Empowering businesses with intelligent automation and AI-driven marketing solutions.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-tv-offwhite font-bold mb-4">Services</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/automation" className="hover:text-tv-teal">Business Automation</Link></li>
                            <li><Link href="/ai-ads" className="hover:text-tv-teal">AI Video Ads</Link></li>
                            <li><Link href="/services" className="hover:text-tv-teal">Consulting</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-tv-offwhite font-bold mb-4">Company</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/about" className="hover:text-tv-teal">About Us</Link></li>
                            <li><Link href="/case-studies" className="hover:text-tv-teal">Case Studies</Link></li>
                            <li><Link href="/insights" className="hover:text-tv-teal">Insights</Link></li>
                            <li><Link href="/contact" className="hover:text-tv-teal">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-tv-offwhite font-bold mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            {/* Social icons placeholders */}
                            <a href="#" className="text-gray-400 hover:text-tv-teal">LinkedIn</a>
                            <a href="#" className="text-gray-400 hover:text-tv-teal">Twitter</a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-900 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} TechVedyaa. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
