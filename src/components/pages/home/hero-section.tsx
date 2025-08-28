import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
// import {  Check } from "lucide-react";
import Link from "next/link";
import { MobilePreview } from "./mobile-preview";
// import { StatsCounter } from "./stats-counter";

// const stats = [
//   { value: "1k+", label: "Restaurants" },
//   { value: "1M+", label: "Monthly Views" },
//   { value: "98%", label: "Satisfaction" },
//   { value: "24/7", label: "Support" },
// ];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#F8F9FB] py-14 900:py-14">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#002147]/20 to-[#2ECC71]/10 blur-3xl"></div>
        <div className="absolute top-[60%] -left-[5%] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-[#2ECC71]/20 to-[#E74C3C]/10 blur-3xl"></div>
      </div>

      <div className="max-w-[1200px] relative w-full mx-auto px-4">
        <div className="flex items-start 900:gap-1 gap-14 900:items-center 900:flex-row flex-col justify-between w-full">
          <div className="max-w-2xl 900:w-7/12 w-full">
            {/* <div className="mb-3 md:mb-6 inline-flex items-center rounded-full bg-[#dbe2ea] px-3 py-2 text-sm text-[#002147]">
                            <span className="mr-2 rounded-full bg-[#002147] p-1">
                                <Check className="h-3 w-3 text-white" />
                            </span>
                            Trusted by over 1,000 restaurants
                            <span className="sm:flex hidden pl-1">worldwide</span>
                        </div> */}

            <h1 className="mb-3 md:mb-9 text-[44px] font-bold max-sm:text-center leading-[1.05] tracking-tight text-[#002147] md:text-6xl lg:text-7xl">
              The way to elevate{" "}
              <span className="bg-gradient-to-r from-[#2ECC71] to-[#002147] bg-clip-text text-transparent">
                your restaurant
              </span>
            </h1>

            {/* <p className="mb-5 md:mb-8 text-lg sm:text-lg leading-relaxed text-[#333333]">
                            Create a beautiful profile page to showcase your menu, accept pickup or delivery orders with direct payments, and share all your important links. Includes powerful analytics, no fees or commissions. All from your own Dineri profile.
                        </p> */}

            <div className="flex flex-col space-y-3 md:space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group h-13 sm:w-auto w-full bg-[#002147] hover:bg-[#001633] px-6 text-base text-white"
                >
                  Get Started – It’s Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>

              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 border-[#cbd5e1] px-5 sm:w-auto w-full text-base text-[#002147] hover:bg-[#edf1f7]"
                >
                  See What You Can Do
                </Button>
              </Link>
            </div>

            {/* <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <StatsCounter key={i} value={stat.value} label={stat.label} />
              ))}
            </div> */}
          </div>

          <div className="relative 900:w-1/2 w-full flex items-center justify-center 900:justify-end">
            <MobilePreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
