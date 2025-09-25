import { AppSidebar } from "@/app/[locale]/(dashboard)/_components/app-sidebar";
import LocaleSwitcher from "@/components/locale-switcher";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UpgradeBtn from "@/components/upgrade-btn";
import VisitBtn from "@/components/visit-btn";
import prisma from "@/lib/prisma";
import { createClient } from "@/supabase/clients/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function WithResttaurantLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        redirect('/login')
    }

    const { data: restaurants, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)

    if (restaurantError || !restaurants || restaurants.length === 0) {
        redirect('/dashboard/create')
    }

    const prismaUser = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    })

    if (!prismaUser) redirect("/login")

    const cookieStore = cookies()
    const sidebarState = (await cookieStore).get("sidebar:state")
    const defaultOpen = sidebarState ? sidebarState.value === "true" : true
    const isPremium = prismaUser?.subscription_plan === "basic" ? false : true

    return (
        <div className="bg-[#3C3C3C]">
            <SidebarProvider defaultOpen={defaultOpen} className="!rounded-[14px] overflow-hidden">
                <AppSidebar user={user} prismaUser={prismaUser} />
                <main className="w-full bg-gray-50 h-screen overflow-y-auto">
                    <div className="min-h-screen">
                        <div className="border-b border-slate-200 bg-white shadow-sm">
                            <div className="mx-auto px-4 h-[62px] flex items-center justify-between">
                                <div className="flex items-center space-x-4 md:hidden">
                                    <Link href="/dashboard" className="flex items-center space-x-2 group">
                                        <Image
                                            src={"/logo.png"}
                                            alt="logo.png"
                                            width={250}
                                            height={100}
                                            className="w-full max-w-[170px] "
                                        />
                                    </Link>
                                </div>
                                <div className="flex items-center justify-between gap-2 md:flex-row flex-row-reverse md:w-full">
                                    <SidebarTrigger />
                                    <div className="flex items-center gap-2">
                                        <LocaleSwitcher />
                                        {!isPremium && (
                                            <UpgradeBtn />
                                        )}
                                        <VisitBtn />
                                    </div>
                                </div>

                            </div>
                        </div>
                        <Suspense fallback={<div>Loading...</div>}>
                            {children}
                        </Suspense>
                    </div>
                </main>
            </SidebarProvider>
        </div>


    );
}
