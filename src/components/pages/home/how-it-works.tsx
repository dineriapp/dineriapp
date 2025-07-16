import { ChevronRight } from 'lucide-react'
import React from 'react'

const HowItWorks = () => {
    return (
        <section className="bg-slate-50 py-14 lg:py-24">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="mb-10 lg:mb-16 max-w-3xl mx-auto text-center">
                    <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl ">How <span className='bg-gradient-to-r from-[#2ECC71] to-[#002147] bg-clip-text text-transparent'>dineri.app</span> works</h2>
                    <p className="text-lg text-slate-600">Start using Dineri in a few clicks</p>
                </div>

                <div className="grid gap-4 lg:gap-8 md:grid-cols-3">
                    {[
                        {
                            step: "01",
                            title: "Create your profile",
                            description:
                                "Sign up and customize your restaurant page with your logo, photos, and key information.",
                        },
                        {
                            step: "02",
                            title: "Add your content",
                            description: "Upload your menu, highlight events or promotions, and link your socials, all in one place.",
                        },
                        {
                            step: "03",
                            title: "Share with customers",
                            description:
                                "Share your unique Dineri.me link via Instagram, Google Business, and flyers to connect with your guests.",
                        },
                    ].map((item, i) => (
                        <div key={i} className="relative rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-md">
                            <div className="mb-6 inline-block rounded-xl bg-gradient-to-r from-main-action to-main p-4 text-2xl font-bold text-white">
                                {item.step}
                            </div>
                            <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
                            <p className="text-slate-600">{item.description}</p>

                            {i < 2 && (
                                <div className="absolute -right-[34px] top-1/2 hidden -translate-y-1/2 text-slate-300 md:block">
                                    <ChevronRight className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>

    )
}

export default HowItWorks
