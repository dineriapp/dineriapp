"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useTranslations } from "next-intl"
import LocaleSwitcher from "../locale-switcher"

export function MobileNav() {
    const [open, setOpen] = useState(false)
    const t = useTranslations("Header");

    return (
        <div className="xl:hidden flex items-center justify-center gap-2">
            <LocaleSwitcher />
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
                            {t("home")}
                        </Link>
                        <Link
                            href="/features"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            {t("features")}
                        </Link>

                        <Link
                            href="/demo"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            {t("demo")}
                        </Link>
                        <Link
                            href="/help-center"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            {t("learn")}
                        </Link>
                        <Link
                            href="/plans"
                            className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900"
                            onClick={() => setOpen(false)}
                        >
                            {t("pricing")}
                        </Link>
                    </div>
                    <div className="border-t border-slate-200 py-4 px-4 w-full">
                        <div className="flex flex-col space-y-3">
                            <Link href="/login" onClick={() => setOpen(false)}>
                                <Button variant="outline" className="w-full">
                                    {t("login")}
                                </Button>
                            </Link>
                            <Link href="/signup" onClick={() => setOpen(false)}>
                                <Button className="w-full bg-main hover:bg-main/90">
                                    {t("signup")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

        </div>
    )
}
