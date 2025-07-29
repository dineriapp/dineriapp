import Image from "next/image";
import React from "react";

const ResturantHeader = () => {
  return (
    <div className="h-[350px] bg-[url('/resturant-bg.jpg')] bg-cover bg-center bg-no-repeat flex items-end pb-6">
      <div className="w-full max-w-[1200px] mx-auto flex items-end">
        <Image
          src={"/dummy.jfif"}
          alt={"asa"}
          width={1000}
          height={1000}
          className="size-20"
        />
      </div>
    </div>
  );
};

export default ResturantHeader;
