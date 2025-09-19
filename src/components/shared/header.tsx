"use client";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNav } from "./mobile-nav";
import LocaleSwitcher from "../locale-switcher";

export function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("Header");
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
        className={`${isSticky ? "top-5 fixed h-[76px] lg:h-[90px]" : `fixed  ${pathname === `/${locale}` ? "top-[100px] xl:top-[120px] h-[76px] lg:h-[90]" : "top-5 h-[76px] lg:h-[90px]"}`}
          }  z-50  border rounded-full w-[96%] lg:w-11/12 max-w-[1281px] mx-auto border-slate-200  flex items-center justify-center bg-[#FCF9EB] backdrop-blur-md transition-all duration-500 `}
      >
        <div className={`${isSticky ? "px-6" : ` ${pathname === `/${locale}` ? "px-6" : "px-6"}`} flex h-18 items-center justify-between  w-full`}>
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
              {t("home")}
            </Link>
            <Link
              href="/features"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              {t("features")}
            </Link>
            <Link
              href="/demo"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              {t("demo")}
            </Link>
            <Link
              href="/help-center"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              {t("learn")}
            </Link>
            <Link
              href="/plans"
              className=" text-[#090909CC] font-[400] hover:text-slate-900"
            >
              {t("pricing")}
            </Link>
          </div>

          <div className="hidden items-center gap-[14px] justify-center xl:flex">
            <LocaleSwitcher />
            <Link href="/login">
              <Button
                variant="ghost"
                className=" border border-[#0909094D] text-[#090909] font-poppins transition-all font-[500] cursor-pointer text-lg hover:text-slate-800 px-[40px] h-[52px] rounded-full"
              >
                {t("login")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#002147] hover:bg-main-hover/80 font-poppins font-[600] text-lg text-[#FFFFFF] cursor-pointer h-[52px] px-[40px] transition-all rounded-full">
                {t("signup")}
              </Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
