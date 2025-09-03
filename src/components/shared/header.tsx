"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname()
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
      className={`bg-transparent  transition-all duration-300 flex justify-center`}
    >
      <div
        className={`${isSticky ? "top-5 fixed h-[76px] lg:h-[90px]" : `fixed  ${pathname === "/" ? "top-[100px] xl:top-[120px] h-[76px] lg:h-[120px]" : "top-5 h-[76px] lg:h-[90px]"}`}
          }  z-50  border rounded-full w-[96%] lg:w-11/12 max-w-[1281px] mx-auto border-slate-200  flex items-center justify-center bg-[#FCF9EB] backdrop-blur-md transition-all duration-500 `}
      >
        <div className={`${isSticky ? "px-6" : ` ${pathname === "/" ? "px-6 lg:px-[51px]" : "px-6"}`} flex h-18 items-center justify-between  w-full`}>
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src={"/logo.png"}
              alt="logo.png"
              width={250}
              height={100}
              className="w-full md:max-w-[210px] max-w-[150px]"
            />
          </Link>

          <div className="hidden gap-8 items-center xl:flex font-poppins">
            <Link
              href="/"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              href="/features"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              Features
            </Link>
            <Link
              href="/demo"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              Demo
            </Link>
            <Link
              href="#"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              learn
            </Link>
            <Link
              href="/plans"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden items-center gap-[14px] justify-center xl:flex">
            <Link href="/login">
              <Button
                variant="ghost"
                className=" border border-[#0909094D] text-[#090909] font-poppins transition-all font-[500] cursor-pointer text-lg hover:text-slate-800 px-[51px] h-[60px] rounded-full"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#002147] hover:bg-main-hover/80 font-poppins font-[600] text-lg text-[#FFFFFF] cursor-pointer h-[62px] px-[53px] transition-all rounded-full">
                Sign Up
              </Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
