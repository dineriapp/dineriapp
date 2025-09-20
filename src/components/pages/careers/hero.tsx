import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const Hero = () => {
  const t = useTranslations("CareersPage.hero");

  return (
    <div className="w-11/12  max-w-[1240px] mx-auto  g:px-4 pb-12 lg:pt-24 pt-40 sm:pt-40">
      <div className=" flex items-center lg:flex-row flex-col justify-between w-full gap-10 lg:pt-30 lg:pb-20">
        <div className=" w-full b max-sm:flex items-center justify-center flex-col">
          <h1 className="mb-3 md:mb-7 text-[44px] font-bold max-sm:text-center !leading-[1] tracking-tight text-[#002147] md:text-6xl lg:text-7xl  font-inter">
            <span
              dangerouslySetInnerHTML={{
                __html: t.raw("title")
              }}
              className=" text-black font-poppins">
            </span>
          </h1>
          <p className="text-lg text-main-text lg:w-10/12 sm:text-start text-center ">
            {t("description")}
          </p>
        </div>
        <div className="lg:w-1/2 max-w-[500px] w-full">
          <Image
            // src={"/careers.avif"}
            src={"/img-f-2.avif"}
            alt="logo.png"
            width={700}
            height={700}
            className="w-full max-w-[600px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
