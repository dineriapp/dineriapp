"use client";
import { Suspense } from 'react';

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
      {/* HEADER */}
      <header className="sticky top-0 left-0 z-50 w-full h-16 bg-[#FCF9EB] border-b shadow-none flex items-center transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between w-full px-4 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Dineri Logo"
              width={160}
              height={50}
              className="object-contain max-h-10 transition-transform hover:scale-105"
            />
          </Link>

          {/* Search Form */}
          <div className=" hidden md:flex w-fit justify-center">
            <SearchForm />
          </div>
        </div>
      </header>
      <SidebarProvider className="mt-0">
        <div className="fixed top-4 block md:hidden right-3 z-50">
          <SidebarTrigger />
        </div>
        <Suspense fallback={<>Loading...</>}>
          <AppSidebar />
        </Suspense>

        <SidebarInset className="!p-0 !m-0">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
