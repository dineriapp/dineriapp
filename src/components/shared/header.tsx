import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Utensils } from "lucide-react"
import { MobileNav } from "./mobile-nav"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-2 rounded-xl transition-transform group-hover:scale-110">
                        <Utensils className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        dineri.app
                    </span>
                </Link>

                <div className="hidden items-center space-x-1 md:flex">
                    <Link href="#features" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        Features
                    </Link>
                    <Link href="#pricing" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        Pricing
                    </Link>
                    <Link href="#testimonials" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        Testimonials
                    </Link>
                    <Link href="#faq" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        FAQ
                    </Link>
                </div>

                <div className="hidden space-x-4 md:flex">
                    <Link href="/auth/login">
                        <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
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
