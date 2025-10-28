"use client"

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import LocaleSwitcher from "../locale-switcher";
import { UserDropDown } from "./user-drop-down";
import { useSession } from "@/lib/auth/auth-client";

export function MobileNav() {
    const [open, setOpen] = useState(false)
    const t = useTranslations("Header");
    const { data: session } = useSession()
    return (
        <div className="xl:hidden flex items-center justify-center gap-2">
            <LocaleSwitcher
                SizeClassName="!size-10 lg:!size-12 bg-transparent"
                IconSizeClassName="size-[22px] lg:size-[24px] text-black"
            />
            <UserDropDown className="!size-10 lg:!size-12" SizeClassName="!size-10 lg:!size-12" />
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <button
                        className={cn(`flex items-center bg-main-green  justify-center cursor-pointer !size-10 lg:!size-12 !p-0 rounded-full`)}
                    >
                        <Menu className="!h-[22px] !w-[22px] lg:!h-[26px] lg:!w-[26px] text-white !size-12" />
                    </button>
                </SheetTrigger>
                <SheetContent
                    iconColorClose="black"
                    side="right" className="w-[300px] flex flex-col h-full items-center justify-between sm:w-[400px]">
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
                    {
                        !session?.user &&
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
                    }

                </SheetContent>
            </Sheet>

        </div>
    )
}
