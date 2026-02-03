import HeroVideo from '@/components/HeroVideo';
import VideoGallery from '@/components/VideoGallery';
import CTASection from '@/components/CTASection';

export default function AIAdsPage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            <HeroVideo
                mp4="/videos/video_ai_ads_hero.mp4"
                poster="/images/poster_ai_ads_hero.webp"
            />

            <section className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-tv-offwhite mb-6">
                        High-Impact <span className="text-tv-teal">AI Video Ads</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Captivate your audience with cinematic, AI-generated video content that drives conversions.
                    </p>
                </div>

                <VideoGallery />
            </section>

            <CTASection
                title="Boost Your Ad Performance"
                subtitle="Get a free demo of our AI video generation capabilities."
                buttonText="Request Demo"
                link="/contact"
            />
        </div>
    );
}
