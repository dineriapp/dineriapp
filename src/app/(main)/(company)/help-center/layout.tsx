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
          <div className="flex-grow hidden md:flex max-w-lg justify-center">
            <SearchForm />
          </div>

          {/* Right side actions */}
          <div className="flex items-center max-sm:hidden gap-4">
            {/* Notifications Button (example) */}
            <button
              type="button"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full cursor-pointer bg-main-green hover:bg-main-green transition-colors"
            >
              <span className="sr-only">Notifications</span>
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <SidebarProvider className="mt-0">
        <div className="absolute top-4 block md:hidden right-3 z-50">
          <SidebarTrigger />
        </div>
        <AppSidebar />
        <SidebarInset className="!p-0 !m-0">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
