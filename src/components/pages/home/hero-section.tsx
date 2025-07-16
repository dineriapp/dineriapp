import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { MobilePreview } from './mobile-preview'
import { StatsCounter } from './stats-counter'

const stats = [
    { value: "1k+", label: "Restaurants" },
    { value: "1M+", label: "Monthly Views" },
    { value: "98%", label: "Satisfaction" },
    { value: "24/7", label: "Support" },
]

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f7fa] to-white py-14 900:py-14">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#1c2b39]/20 to-[#4ea6f0]/10 blur-3xl"></div>
                <div className="absolute top-[60%] -left-[5%] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-[#4ea6f0]/20 to-[#3ecf8e]/10 blur-3xl"></div>
            </div>

            <div className="max-w-[1200px] relative w-full mx-auto px-4">
                <div className="flex items-start 900:gap-1 gap-14 900:items-center 900:flex-row flex-col justify-between w-full">
                    <div className="max-w-2xl w-full">
                        <div className="mb-3 md:mb-6 inline-flex items-center rounded-full bg-[#e0e6ec] px-3 py-1 text-sm text-[#1c2b39]">
                            <span className="mr-2 rounded-full bg-[#1c2b39] p-1">
                                <Check className="h-3 w-3 text-white" />
                            </span>
                            Trusted by over 1000  restaurants <span className="sm:flex hidden pl-1">worldwide</span>
                        </div>
                        <h1 className="mb-3 md:mb-6 text-[44px] font-bold leading-[1.05] tracking-tight text-[#1c2b39] md:text-6xl lg:text-6xl">
                            The way to elevate{" "}
                            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                your restaurant
                            </span>
                        </h1>
                        <p className="mb-5 md:mb-8 text-lg sm:text-lg leading-relaxed text-[#475569]">
                            Create a beautiful profile page to showcase your menu, accept pickup or
                            delivery orders with direct payments, and share all your important links. Includes powerful
                            analytics, no fees or commissions. All from your own Dineri profile.
                        </p>

                        <div className="flex flex-col space-y-3 md:space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    className="group h-13 sm:w-auto w-full bg-gradient-to-r from-[#1c2b39] to-[#4ea6f0] px-6 text-base hover:from-[#25364a] hover:to-[#3b8ed1]"
                                >
                                    Get Started – It’s Free
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="#features">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-13 border-[#cbd5e1] px-5 sm:w-auto w-full text-base text-[#1c2b39] hover:bg-[#f1f5f9]"
                                >
                                    See What You Can Do
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {stats.map((stat, i) => (
                                <StatsCounter key={i} value={stat.value} label={stat.label} />
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full flex items-center justify-center 900:justify-end ">
                        <MobilePreview />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
