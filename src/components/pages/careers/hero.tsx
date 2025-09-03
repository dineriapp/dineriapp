import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div className="w-11/12  max-w-[1240px] mx-auto  g:px-4 pb-12 lg:pt-24 pt-32 sm:pt-40">
      <div className=" flex items-center lg:flex-row flex-col w-full gap-10">
        <div className="lg:w-1/2 w-full max-sm:flex items-center justify-center flex-col">
          <h1 className="mb-3 md:mb-9 text-[44px] font-bold max-sm:text-center leading-[1.05] tracking-tight text-[#002147] md:text-6xl lg:text-7xl lg:w-9/12 font-inter">
            <span className=" text-[#002147]">
              Grow your career at Dineri
            </span>
          </h1>
          <p className="text-lg text-main-text lg:w-9/12">
            At Linktree, we’re empowering everyone with the tools to curate and
            grow their digital universe. We bet you’ve got some ideas.
          </p>
          <button className='bg-transparent mt-6 sm:mt-10 max-sm:mx-auto px-[28px] h-[52px] 900:h-[66px] text-[#002147] border border-[#002147] hover:text-white hover:bg-[#002147] transition-all font-poppins font-[600] text-sm 900:text-base rounded-full cursor-pointer'>
            Get Started – It’s Free
          </button>
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
