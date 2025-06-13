"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden">
            {/* <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-700">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col space-y-4 py-4">
                        <Link
                            href="#features"
                            className="px-4 py-2 text-lg font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="px-4 py-2 text-lg font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="#testimonials"
                            className="px-4 py-2 text-lg font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            Testimonials
                        </Link>
                        <Link
                            href="#faq"
                            className="px-4 py-2 text-lg font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            FAQ
                        </Link>

                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex flex-col space-y-3">
                                <Link href="/auth/login" onClick={() => setOpen(false)}>
                                    <Button variant="outline" className="w-full">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/auth/signup" onClick={() => setOpen(false)}>
                                    <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700">
                                        Sign up free
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet> */}
        </div>
    )
}
