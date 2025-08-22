import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div className="w-11/12 max-w-[1200px] mx-auto   lg:px-4 pb-12 lg:pt-20 pt-5">
      <div className=" flex items-center lg:flex-row flex-col w-full gap-10">
        <div className="lg:w-1/2 w-full">
          <h1 className="mb-3 md:mb-9 text-[44px] font-bold max-sm:text-center leading-[1.05] tracking-tight text-[#002147] md:text-6xl lg:text-7xl lg:w-9/12 font-inter">
            <span className="bg-gradient-to-r from-[#2ECC71] to-[#002147] bg-clip-text text-transparent">
              Grow your career at Dineri
            </span>
          </h1>
          <p className="text-lg text-main-text lg:w-9/12">
            At Linktree, we’re empowering everyone with the tools to curate and
            grow their digital universe. We bet you’ve got some ideas.
          </p>
        </div>
        <div className="lg:w-1/2 w-full">
          <Image
            src={"/careers.avif"}
            alt="logo.png"
            width={1000}
            height={1000}
            className="w-full "
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
