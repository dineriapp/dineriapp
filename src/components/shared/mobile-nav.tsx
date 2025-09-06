"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
    const [open, setOpen] = useState(false)

    return (
        <div className="xl:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <div className="text-slate-300 cursor-pointer">
                        <Menu className="h-6 w-6 lg:h-8 lg:w-8 text-main" />
                        <span className="sr-only">Toggle menu</span>
                    </div>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] flex flex-col h-full items-center justify-between sm:w-[400px]">
                    <div className="flex flex-col space-y-2 py-4 pt-10 px-0 w-full">

                        <Link
                            href="/"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/features"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            Features
                        </Link>

                        <Link
                            href="/demo"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            Demo
                        </Link>
                        <Link
                            href="/about"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            href="/plans"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            Pricing
                        </Link>
                    </div>
                    <div className="border-t border-slate-200 py-4 px-4 w-full">
                        <div className="flex flex-col space-y-3">
                            <Link href="/login" onClick={() => setOpen(false)}>
                                <Button variant="outline" className="w-full">
                                    Log in
                                </Button>
                            </Link>
                            <Link href="/signup" onClick={() => setOpen(false)}>
                                <Button className="w-full bg-main hover:bg-main/90">
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
