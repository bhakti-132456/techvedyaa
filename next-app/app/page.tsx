import HeroSection from '@/components/sections/HeroSection';
import ServicesGrid from '@/components/sections/ServicesGrid';
import StatsSection from '@/components/sections/StatsSection';
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
        <StatsSection />
        <ServicesGrid />
        <MethodologySection />
        <EngagementSection />
        <ScopeSection />
        <ProcessSection />
        <IndustriesSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
