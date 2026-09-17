import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import PillarsSection from '@/components/sections/PillarsSection';
import WhySection from '@/components/sections/WhySection';
import ServicesGrid from '@/components/sections/ServicesGrid';
import MethodologySection from '@/components/sections/MethodologySection';
import EngagementSection from '@/components/sections/EngagementSection';
import ScopeSection from '@/components/sections/ScopeSection';
import ProcessSection from '@/components/sections/ProcessSection';
import IndustriesSection from '@/components/sections/IndustriesSection';
import ContactSection from '@/components/sections/ContactSection';
import ClientIslands from '@/components/islands/ClientIslands';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <ClientIslands />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <HeroSection />
        {/* StatsSection is parked until real outcome metrics exist — the
            capability counts it fell back on weren't worth the slot directly
            under the hero. Re-add <StatsSection /> here to restore it. */}
        <PillarsSection />
        <ServicesGrid />
        <AboutSection />
        <MethodologySection />
        <EngagementSection />
        <ScopeSection />
        <ProcessSection />
        <WhySection />
        <IndustriesSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
