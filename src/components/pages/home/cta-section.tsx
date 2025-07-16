import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Mail } from 'lucide-react'
import Link from 'next/link'
import { NewsletterForm } from './newsletter-form'
import { VideoDemoDialog } from '@/components/ui/video-demo-dialog'

const CtaSection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-14 lg:py-24">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 h-[800px] w-[800px] rounded-full bg-teal-600/10 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-2xl"></div>
            </div>

            <div className="max-w-[1200px] relative mx-auto px-4 w-full">
                <div className="mx-auto max-w-5xl w-full">
                    <div className="grid gap-6 lg:gap-12 md:grid-cols-2 w-full">
                        <div className="flex flex-col justify-center">
                            <div className="mb-4 w-fit inline-flex items-center rounded-full bg-teal-500/20 px-3 py-1 text-sm text-teal-300">
                                <span className="mr-2 rounded-full bg-teal-400 p-1">
                                    <Check className="h-3 w-3 text-slate-900" />
                                </span>
                                Join 1,000+ restaurants
                            </div>
                            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                                Go live in minutes.  {" "}
                                <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                                    Reach more diners with a profile that works for you.
                                </span>{" "}

                            </h2>
                            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                                <Link href="/signup">
                                    <Button
                                        size="lg"
                                        className="group h-14 bg-gradient-to-r from-teal-500 md:w-auto w-full to-blue-500 px-8 text-lg hover:from-teal-600 hover:to-blue-600"
                                    >
                                        Get Started – It’s Free
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                                <VideoDemoDialog />
                            </div>
                        </div>

                        <div className="relative flex items-center">

                            <div className="relative rounded-2xl border border-slate-700 bg-slate-800/80 p-8 backdrop-blur-sm">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-white">Stay updated</h3>
                                    <div className="rounded-full bg-teal-500/20 p-2 text-teal-300">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="mb-6 text-slate-300">
                                    Subscribe to our newsletter for the latest features, tips, and success stories.
                                </p>

                                <NewsletterForm />

                                {/* <div className="mt-8 flex items-center justify-between border-t border-slate-700 pt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center -space-x-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-8 w-8 overflow-hidden rounded-full bg-slate-700">
                                                    <Image
                                                        src={"https://media.licdn.com/dms/image/v2/D4E03AQHj7dWSR5ovJA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729369054465?e=2147483647&v=beta&t=yJ_cs3qCQOyfL5id1H9P0oAAlbUJFHPLjoWzLU6SUl8"}
                                                        className="w-full h-full"
                                                        alt=""
                                                        width={40}
                                                        height={40} />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-400">Join 5,000+ subscribers</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CtaSection
