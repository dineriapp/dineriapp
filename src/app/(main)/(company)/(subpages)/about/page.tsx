import Image from "next/image";
import React from "react";

const About = () => {
  return (
    <div className="w-11/12  max-w-[1280px] mx-auto  lg:px-4 pb-12 lg:pt-40 pt-32">
      <div className=" flex items-center lg:flex-row flex-col w-full gap-10">
        <div className="lg:w-1/2 w-full">
          <h1 className="mb-3 md:mb-5 text-[44px] font-inter font-bold max-sm:text- leading-[1.05] tracking-tight text-[#002147] md:text-6xl lg:text-7xl lg:w-9/12">
            <span className="">
              From kitchen to code
            </span>
          </h1>
          <p className="text-lg text-[#1E2330] lg:w-11/12">
            The idea for Dineri.app was born from years of experience building
            websites for restaurants. During that time, we kept seeing the same
            problem: owners didn’t have the time to update their site, found the
            systems too complicated, or were paying far too much for features
            they never used. Often, expensive designs and countless hours of
            work were invested, while in reality guests only want to see a few
            key things: the menu, reviews, location, reservation options, and
            ordering possibilities.
          </p>
        </div>
        <div className="lg:w-1/2 w-full">
          <Image
            src={"/about.webp"}
            alt="logo.png"
            width={1000}
            height={1000}
            className="w-full "
          />
        </div>
      </div>
      <p className="text-lg text-[#1E2330] mt-10">
        On top of that, in recent years many ordering platforms have started
        charging unnecessarily high commissions on every order. Many restaurant
        owners would love to leave these platforms, but simply don’t have a real
        alternative. With Dineri.app, you can offer online ordering directly to
        your customers, without paying any fees or losing profit margins.{" "}
      </p>
      <p className="text-lg text-[#1E2330] my-10">
        We are a team of web developers, marketers, and professionals with years
        of experience in the restaurant industry. We know how busy running a
        hospitality business can be, and how important it is to always look
        attractive and up-to-date online. Our combined expertise in technology,
        marketing, and hospitality means we know exactly what restaurant owners
        need.
      </p>
    </div>
  );
};

export default About;
