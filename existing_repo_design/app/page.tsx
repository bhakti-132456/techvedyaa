import HeroImage from '@/components/HeroImage';
import ServiceCard from '@/components/ServiceCard';
import TestimonialSlider from '@/components/TestimonialSlider';
import CTASection from '@/components/CTASection';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      <HeroImage
        src="/images/hero_home_cinematic.png"
        alt="TechVedyaa Future Office"
        priority={true}
      />

      <section className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-tv-offwhite mb-6">
            Intelligent Automation for the <span className="text-tv-teal">Future Enterprise</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We help businesses scale by automating complex workflows and creating high-impact AI marketing assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ServiceCard
            title="Business Automation"
            description="Streamline operations with custom n8n workflows and AI agents that handle repetitive tasks 24/7."
            link="/automation"
            delay={0.1}
          />
          <ServiceCard
            title="AI Video Ads"
            description="Generate cinematic, high-converting video ads at scale using cutting-edge generative AI models."
            link="/ai-ads"
            delay={0.2}
          />
          <ServiceCard
            title="Strategic Consulting"
            description="Expert guidance on implementing AI and automation to drive measurable business growth."
            link="/services"
            delay={0.3}
          />
        </div>
      </section>

      <section className="bg-white/5 py-20">
        <div className="container mx-auto px-6 text-center mb-10">
          <h2 className="text-3xl font-bold text-tv-offwhite">What Our Clients Say</h2>
        </div>
        <TestimonialSlider />
      </section>

      <CTASection
        title="Ready to Transform Your Business?"
        subtitle="Book a free strategy call to discover how we can automate your success."
        buttonText="Book Strategy Call"
        link="/contact"
      />
    </div>
  );
}
