import HeroImage from '@/components/HeroImage';
import Image from 'next/image';
import CTASection from '@/components/CTASection';

export default function AboutPage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            <HeroImage
                src="/images/hero_about_cinematic.png"
                alt="About TechVedyaa"
                priority={true}
            />

            <section className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-tv-offwhite mb-6">
                            Who We <span className="text-tv-teal">Are</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-6">
                            TechVedyaa is a forward-thinking technology consultancy dedicated to empowering businesses through intelligent automation and AI.
                        </p>
                        <p className="text-gray-400">
                            We believe that the future of work is automated, creative, and human-centric. By handling the repetitive tasks with machines, we free up your team to focus on what truly matters: innovation and growth.
                        </p>
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                        <Image
                            src="/images/team_cinematic.png"
                            alt="Our Team"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            <CTASection
                title="Join Our Journey"
                subtitle="Interested in working with us or joining our team?"
                buttonText="Contact Us"
                link="/contact"
            />
        </div>
    );
}
