import Link from 'next/link';

interface CTASectionProps {
    title: string;
    subtitle: string;
    buttonText: string;
    link: string;
}

export default function CTASection({ title, subtitle, buttonText, link }: CTASectionProps) {
    return (
        <section className="py-20 bg-gradient-to-r from-tv-teal/10 to-tv-coral/10">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-tv-offwhite mb-6">{title}</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{subtitle}</p>
                <Link
                    href={link}
                    className="inline-block px-8 py-4 bg-tv-teal text-tv-bg font-bold text-lg rounded-full hover:bg-white hover:scale-105 transition-all shadow-lg shadow-tv-teal/20"
                >
                    {buttonText}
                </Link>
            </div>
        </section>
    );
}
