import Image from "next/image";
import React from "react";

const ResturantHeader = ({ logo }: { logo: string }) => {
  return (
    <div className="h-[350px] bg-cover bg-center bg-no-repeat flex items-end pb-6">
      <div className="w-full max-w-[1200px] px-4  mx-auto flex items-end">
        <Image
          src={logo ? logo : "/dummy.jfif"}
          alt={"asa"}
          width={1000}
          height={1000}
          className="size-24 object-cover"
        />
      </div>
    </div>
  );
};

export default ResturantHeader;
