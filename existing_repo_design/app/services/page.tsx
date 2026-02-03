import HeroImage from '@/components/HeroImage';
import ServiceCard from '@/components/ServiceCard';
import CTASection from '@/components/CTASection';

export default function ServicesPage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            <HeroImage
                src="/images/hero_services_cinematic.png"
                alt="Our Services"
                priority={true}
            />

            <section className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-tv-offwhite mb-6">
                        Comprehensive <span className="text-tv-teal">Digital Solutions</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        From automation to AI marketing, we provide end-to-end services to modernize your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ServiceCard
                        title="Workflow Automation"
                        description="End-to-end automation of business processes using n8n, Zapier, and custom scripts."
                        link="/automation"
                    />
                    <ServiceCard
                        title="AI Video Production"
                        description="Creation of high-quality video assets using generative AI for marketing campaigns."
                        link="/ai-ads"
                    />
                    <ServiceCard
                        title="AI Consulting"
                        description="Strategic advice on adopting AI technologies to solve specific business problems."
                        link="/contact"
                    />
                    <ServiceCard
                        title="Custom Development"
                        description="Full-stack web and app development tailored to your brand&apos;s unique needs."
                        link="/contact"
                    />
                    <ServiceCard
                        title="Data Analytics"
                        description="Turn your data into actionable insights with advanced analytics and visualization."
                        link="/insights"
                    />
                    <ServiceCard
                        title="Digital Transformation"
                        description="Holistic overhaul of your digital infrastructure for the modern era."
                        link="/contact"
                    />
                </div>
            </section>

            <CTASection
                title="Need a Custom Solution?"
                subtitle="Let&apos;s discuss your specific requirements and build a roadmap for success."
                buttonText="Talk to an Expert"
                link="/contact"
            />
        </div>
    );
}
