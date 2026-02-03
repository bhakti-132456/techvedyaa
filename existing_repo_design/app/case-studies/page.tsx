import HeroImage from '@/components/HeroImage';
import CTASection from '@/components/CTASection';

export default function CaseStudiesPage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            <HeroImage
                src="/images/hero_case_studies_cinematic.png"
                alt="Case Studies"
                priority={true}
            />

            <section className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-tv-offwhite mb-6">
                        Success <span className="text-tv-teal">Stories</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        See how we&apos;ve helped businesses across industries achieve their goals through automation and AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Placeholder Case Study 1 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-tv-teal/50 transition-colors group">
                        <div className="aspect-video bg-gray-800 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                [Case Study Image]
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-tv-offwhite mb-2 group-hover:text-tv-teal transition-colors">E-commerce Automation</h3>
                            <p className="text-gray-400 mb-4">
                                Automated order processing and customer support for a major retail brand, reducing response times by 80%.
                            </p>
                            <a href="#" className="text-tv-teal font-semibold hover:underline">Read Case Study &rarr;</a>
                        </div>
                    </div>

                    {/* Placeholder Case Study 2 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-tv-teal/50 transition-colors group">
                        <div className="aspect-video bg-gray-800 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                [Case Study Image]
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-tv-offwhite mb-2 group-hover:text-tv-teal transition-colors">AI Ad Campaign</h3>
                            <p className="text-gray-400 mb-4">
                                Generated 50+ video assets for a product launch using AI, resulting in a 3x increase in CTR.
                            </p>
                            <a href="#" className="text-tv-teal font-semibold hover:underline">Read Case Study &rarr;</a>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                title="Be Our Next Success Story"
                subtitle="Let&apos;s achieve similar results for your business."
                buttonText="Start Now"
                link="/contact"
            />
        </div>
    );
}
