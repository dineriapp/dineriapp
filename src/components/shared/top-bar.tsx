import Link from "next/link";
import React from "react";

const TopBar = () => {
  return (
    <div className="p-5  bg-[#009A5E] w-full flex justify-center">
      <p className="text-center max-w-[1200px] text-[#FFFFFF] font-inter font-[500] text-base">
        Time to convert clicks into customers.
        <Link href={"/login"} className="underline ml-2 underline-offset-2 hover:opacity-70 transition-all">
          Start the Journey
        </Link>
      </p>
    </div>
  );
};

export default TopBar;
