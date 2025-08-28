"use client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { ChevronDown } from "lucide-react";

export function Header() {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    console.log(window.scrollY);
    const handleScroll = () => {
      setIsSticky(window.scrollY > 90);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`bg-[#F8F9FB] pt-10 h-32  transition-all duration-300 flex justify-center `}
    >
      <div
        className={`${isSticky ? "top-5 fixed   " : "sticky  top-0 left-0 "
          }  z-50  border rounded-full w-11/12 max-w-[1200px] mx-auto border-slate-200 bg-white backdrop-blur-md transition-all duration-500 h-[75px]`}
      >
        <div className="flex h-18 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src={"/logo.png"}
              alt="logo.png"
              width={250}
              height={100}
              className="w-full md:max-w-[210px] max-w-[150px]"
            />
          </Link>

          <div className="hidden items-center space-x-1 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="!outline-none !ring-0">
                <button className="px-4 py-2 text-slate-600 flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900">
                  Products <ChevronDown className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {
                  [
                    { name: "Features", path: "/features" },
                    { name: "Demo", path: "/demo" },
                    { name: "Plans", path: "/plans" },
                  ].map((item, index) => (
                    <DropdownMenuItem key={index} asChild className="!text-base cursor-pointer">
                      <Link href={item.path}>{item.name}</Link>
                    </DropdownMenuItem>
                  ))
                }
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/signup"
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Get started
            </Link>
            <Link
              href="/demo"
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Demo
            </Link>
            <Link
              href="/plans"
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden space-x-4 md:flex">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-800"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-main hover:bg-main-hover/80 hover:scale-105 transition-transform rounded-full">
                Sign up free
              </Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
