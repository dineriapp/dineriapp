import { AppSidebar } from "@/app/[locale]/(dashboard)/_components/app-sidebar";
import LocaleSwitcher from "@/components/locale-switcher";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import UpgradeBtn from "@/components/upgrade-btn";
import VisitBtn from "@/components/visit-btn";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth/auth";
import UpgradeAutoShow from "@/components/upgrade-auto-show";

export const metadata: Metadata = {
  title: "Dashbaord",
  description:
    "Dineri helps restaurants create beautiful, shareable pages with all their important links in one place — from menus and reservations to delivery and social media.",
};

export default async function WithResttaurantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: {
      user_id: session.user.id,
    },
  });

  if (!restaurant) {
    redirect("/dashboard/create");
  }

  const cookieStore = cookies();
  const sidebarState = (await cookieStore).get("sidebar:state");
  const defaultOpen = sidebarState ? sidebarState.value === "true" : true;
  const isPremium = session?.user?.subscription_plan === "basic" ? false : true;

  return (
    <>
      <UpgradeAutoShow />
      <div className="bg-[#3C3C3C]">
        <SidebarProvider
          defaultOpen={defaultOpen}
          className="!rounded-[14px] overflow-hidden"
        >
          <AppSidebar />
          <main className="w-full bg-gray-50 h-screen overflow-y-auto">
            <div className="min-h-screen">
              <div className="border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto px-4 h-[62px] flex items-center justify-between">
                  <div className="flex items-center space-x-4 md:hidden">
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 group"
                    >
                      <Image
                        src={"/logo.png"}
                        alt="logo.png"
                        width={250}
                        height={100}
                        className="w-full md:max-w-[170px] max-w-29 "
                      />
                    </Link>
                  </div>
                  <div className="flex items-center justify-between gap-1 md:flex-row flex-row-reverse md:w-full">
                    <SidebarTrigger />
                    <div className="flex items-center gap-1">
                      <LocaleSwitcher
                        SizeClassName="!size-10"
                        IconSizeClassName="!size-[20px]"
                      />
                      {!isPremium && <UpgradeBtn />}
                      <VisitBtn />
                    </div>
                  </div>
                </div>
              </div>
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </div>
          </main>
        </SidebarProvider>
      </div>
    </>
  );
}
