import { Button } from "@/components/ui/button"
import { ArrowRight, Facebook, Instagram, Linkedin, Twitter, Utensils } from "lucide-react"
import Link from "next/link"

export function Footer() {
    return (
        <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 h-[800px] w-[800px] rounded-full bg-teal-600/10 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-2xl"></div>
            </div>

            <div className="container relative mx-auto max-w-[1200px] px-4 ">
                {/* Footer Main */}
                <div className="flex items-start justify-between 900:flex-row flex-col gap-10 pt-12 md:pt-16 pb-6 md:pb-6">
                    <div className="md:col-span-2 max-w-[400px]">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-xl">
                                <Utensils className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                                dineri.app
                            </span>
                        </Link>
                        <p className="mt-4 text-slate-300">
                            The complete platform for restaurants to create a beautiful online presence and connect with customers
                            through a single, powerful link.
                        </p>
                        <div className="mt-6 flex space-x-4">
                            {[
                                { icon: Instagram, href: "https://instagram.com" },
                                { icon: Twitter, href: "https://twitter.com" },
                                { icon: Facebook, href: "https://facebook.com" },
                                { icon: Linkedin, href: "https://linkedin.com" },
                            ].map((social, i) => {
                                const Icon = social.icon
                                return (
                                    <Link
                                        key={i}
                                        href={social.href}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-teal-400 ring-1 ring-slate-700"
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="sr-only">{social.href.split("https://")[1]}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-start sm:flex-row flex-col justify-between 900:w-auto w-full 900:justify-center gap-6 sm:gap-30">
                        <div>
                            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-teal-400">Product</h3>
                            <ul className="space-y-2">
                                {["Features", "Pricing", "Testimonials", "FAQ", "Demo", "Support"].map((item) => (
                                    <li key={item}>
                                        <Link href={`#${item.toLowerCase()}`} className="text-slate-300 hover:text-teal-400">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-teal-400">Company</h3>
                            <ul className="space-y-2">
                                {["About", "Careers", "Help center"].map((item) => (
                                    <li key={`#${item}`}>
                                        <Link href={`#${item.toLowerCase()}`} className="text-slate-300 hover:text-teal-400">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-teal-400">Legal</h3>
                            <ul className="space-y-4">
                                {["Terms", "Privacy", "Cookies", "Licenses"].map((item) => (
                                    <li key={item}>
                                        <Link href={`#${item.toLowerCase()}`} className="text-slate-300 hover:text-teal-400">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Get Started Banner */}
                <div className="my-8 rounded-2xl  border border-slate-700 bg-slate-800/80 p-8 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div>
                            <h3 className="text-xl font-bold text-white md:text-2xl">Ready to get started?</h3>
                            <p className="mt-2 text-slate-300">Create your restaurant profile in minutes</p>
                        </div>
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="group bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                            >
                                Create your page
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="flex flex-col items-center justify-between border-t border-slate-700/50 py-8 md:flex-row">
                    <p className="mb-4 text-center text-slate-400 md:mb-0">
                        © {new Date().getFullYear()} dineri.app. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
                        <Link href="/terms" className="hover:text-teal-400">
                            Terms of Service
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link href="/privacy" className="hover:text-teal-400">
                            Privacy Policy
                        </Link>
                        <span className="text-slate-600">•</span>
                        <Link href="/cookies" className="hover:text-teal-400">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
