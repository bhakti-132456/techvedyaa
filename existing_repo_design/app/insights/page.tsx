
import Image from 'next/image';

export default function InsightsPage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            <div className="pt-32 container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-tv-offwhite mb-6">
                    Insights & <span className="text-tv-teal">Trends</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                    Latest thoughts on AI, automation, and the future of work.
                </p>
            </div>

            <section className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Featured Post */}
                    <div className="md:col-span-3 relative rounded-2xl overflow-hidden group cursor-pointer">
                        <div className="aspect-[21/9] relative">
                            <Image
                                src="/images/blog_thumbnail_cinematic.png"
                                alt="Featured Insight"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                                <span className="text-tv-teal font-bold mb-2">Featured</span>
                                <h2 className="text-3xl font-bold text-white mb-2">The Future of AI in Enterprise Automation</h2>
                                <p className="text-gray-300 max-w-2xl">
                                    How Generative AI is reshaping business workflows and what you need to know to stay ahead.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* More posts placeholders */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-tv-teal/30 transition-colors">
                            <div className="aspect-video bg-gray-800 relative">
                                {/* Placeholder image */}
                            </div>
                            <div className="p-6">
                                <span className="text-tv-teal text-sm font-bold">Automation</span>
                                <h3 className="text-xl font-bold text-tv-offwhite mt-2 mb-3">5 Ways to Optimize Your Workflow</h3>
                                <a href="#" className="text-gray-400 hover:text-white text-sm">Read More &rarr;</a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
