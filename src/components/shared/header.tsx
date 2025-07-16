import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { MobileNav } from "./mobile-nav"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[white] backdrop-blur-md">
            <div className="max-w-[1200px] mx-auto flex h-18 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 group">
                    <Image
                        src={"/logo.png"}
                        alt="logo.png"
                        width={250}
                        height={100}
                        className="w-full max-w-[210px] "
                    />
                </Link>

                <div className="hidden items-center space-x-1 md:flex">
                    <Link href="#products" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        Products
                    </Link>
                    <Link href="#get-started" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        Get started
                    </Link>
                    <Link href="#learn" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        Learn
                    </Link>
                    <Link href="#pricing" className="px-4 py-2 text-slate-600 hover:text-slate-900">
                        Pricing
                    </Link>
                </div>

                <div className="hidden space-x-4 md:flex">
                    <Link href="/login">
                        <Button variant="ghost" className="text-slate-600 hover:text-slate-800">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button className="bg-main hover:bg-main-hover/80 hover:scale-105 transition-transform">
                            Sign up free
                        </Button>
                    </Link>
                </div>
                <MobileNav />
            </div>
        </header>
    )
}
