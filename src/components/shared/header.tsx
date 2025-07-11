import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { MobileNav } from "./mobile-nav"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#002147] backdrop-blur-md">
            <div className="max-w-[1200px] mx-auto flex h-18 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 group">
                    <Image
                        src={"/noBgColorColorWhite.png"}
                        alt="noBgColorColorWhite.png"
                        width={250}
                        height={100}
                        className="w-full max-w-[210px] "
                    />
                </Link>

                <div className="hidden items-center space-x-1 md:flex">
                    <Link href="#features" className="px-4 py-2 text-slate-200 hover:text-slate-100">
                        Features
                    </Link>
                    <Link href="#pricing" className="px-4 py-2 text-slate-200 hover:text-slate-100">
                        Pricing
                    </Link>
                    <Link href="#testimonials" className="px-4 py-2 text-slate-200 hover:text-slate-100">
                        Testimonials
                    </Link>
                    <Link href="#faq" className="px-4 py-2 text-slate-200 hover:text-slate-100">
                        FAQ
                    </Link>
                </div>

                <div className="hidden space-x-4 md:flex">
                    <Link href="/login">
                        <Button variant="ghost" className="text-slate-200 hover:text-slate-800">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-105 transition-transform">
                            Sign up free
                        </Button>
                    </Link>
                </div>

                <MobileNav />
            </div>
        </header>
    )
}
