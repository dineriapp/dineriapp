import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Mail } from 'lucide-react'
import Link from 'next/link'
import { NewsletterForm } from './newsletter-form'
import { VideoDemoDialog } from '@/components/ui/video-demo-dialog'

const CtaSection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0f1a] via-[#111827] to-[#0a0f1a] py-14 lg:py-24">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 h-[800px] w-[800px] rounded-full bg-main-action/10 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-main/10 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-main-action/5 blur-2xl"></div>
            </div>

            <div className="max-w-[1200px] relative mx-auto px-4 w-full">
                <div className="mx-auto max-w-5xl w-full">
                    <div className="grid gap-6 lg:gap-12 md:grid-cols-2 w-full">
                        {/* Left content */}
                        <div className="flex flex-col justify-center">
                            <div className="mb-4 w-fit inline-flex items-center rounded-full bg-main-action/20 px-3 py-1 text-sm text-main-action">
                                <span className="mr-2 rounded-full bg-main-action p-1">
                                    <Check className="h-3 w-3 text-main" />
                                </span>
                                Join 1,000+ restaurants
                            </div>
                            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                                Go live in minutes.{" "}
                                <span className="bg-gradient-to-r from-main-action to-white/50 bg-clip-text text-transparent">
                                    Reach more diners with a profile that works for you.
                                </span>
                            </h2>
                            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <Link href="/signup">
                                    <Button
                                        size="lg"
                                        className="group h-14 bg-gradient-to-r from-main-action to-main px-8 text-lg hover:from-[#29b765] hover:to-[#001e3a] md:w-auto w-full"
                                    >
                                        Get Started – It’s Free
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <VideoDemoDialog />
                            </div>
                        </div>

                        {/* Right card */}
                        <div className="relative flex items-center">
                            <div className="relative rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-8 backdrop-blur-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-white">Stay updated</h3>
                                    <div className="rounded-full bg-main-action/20 p-2 text-main-action">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="mb-6 text-[#cbd5e1]">
                                    Subscribe to our newsletter for the latest features, tips, and success stories.
                                </p>

                                <NewsletterForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CtaSection
