"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import SearchForm from "./_components/SearchForm";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 left-0 z-50 w-full bg-background border-b">
        <div className="flex items-center justify-between gap-2 px-4  w-full ">
          <Link href="/">
            <Image
              src={"/logo.png"}
              alt="logo.png"
              width={250}
              height={100}
              className="w-full max-w-[160px] "
            />
          </Link>
          <SearchForm />
          <div className=""></div>
        </div>
      </header>
      <SidebarProvider className="mt-5">
        <div className="absolute top-4 block md:hidden right-3 z-50">
          <SidebarTrigger />
        </div>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mx-auto max-w-[1200px] w-11/12">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
