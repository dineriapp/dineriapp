// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import Link from "next/link";
// import { MobileNav } from "./mobile-nav";

// export function Header() {
//   return (
//     <header className=" bg-transparent pt-10 relative">
//       <div className="sticky top-20 left-1/2 -translate-x-1/2 z-50 w-full border border-slate-200 bg-[white] backdrop-blur-md max-w-[1200px] mx-auto rounded-full">
//         <div className=" flex h-18 items-center justify-between px-4">
//           <Link href="/" className="flex items-center space-x-2 group">
//             <Image
//               src={"/logo.png"}
//               alt="logo.png"
//               width={250}
//               height={100}
//               className="w-full max-w-[210px] "
//             />
//           </Link>

//           <div className="hidden items-center space-x-1 md:flex">
//             <Link
//               href="#products"
//               className="px-4 py-2 text-slate-600 hover:text-slate-900"
//             >
//               Products
//             </Link>
//             <Link
//               href="#get-started"
//               className="px-4 py-2 text-slate-600 hover:text-slate-900"
//             >
//               Get started
//             </Link>
//             <Link
//               href="#learn"
//               className="px-4 py-2 text-slate-600 hover:text-slate-900"
//             >
//               Learn
//             </Link>
//             <Link
//               href="#pricing"
//               className="px-4 py-2 text-slate-600 hover:text-slate-900"
//             >
//               Pricing
//             </Link>
//           </div>

//           <div className="hidden space-x-4 md:flex">
//             <Link href="/login">
//               <Button
//                 variant="ghost"
//                 className="text-slate-600 hover:text-slate-800"
//               >
//                 Log in
//               </Button>
//             </Link>
//             <Link href="/signup">
//               <Button className="bg-main hover:bg-main-hover/80 hover:scale-105 transition-transform">
//                 Sign up free
//               </Button>
//             </Link>
//           </div>
//           <MobileNav />
//         </div>
//       </div>
//     </header>
//   );
// }

//new code
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";

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
        className={`${
          isSticky ? "top-5 fixed   " : "sticky  top-0 left-0 "
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
            <Link
              href="#products"
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Products
            </Link>
            <Link
              href="#get-started"
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Get started
            </Link>
            <Link
              href="#learn"
              className="px-4 py-2 text-slate-600 hover:text-slate-900"
            >
              Learn
            </Link>
            <Link
              href="#pricing"
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
