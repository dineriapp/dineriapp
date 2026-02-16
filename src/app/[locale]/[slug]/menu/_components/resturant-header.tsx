"use client";

import Image from "next/image";
import { useState } from "react";
import { Utensils } from "lucide-react";

const ResturantHeader = ({ logo }: { logo?: string | null }) => {
  const [imageError, setImageError] = useState(false);
  const showFallback = !logo || logo.trim() === "" || imageError;

  return (
    <div className="h-[350px] bg-cover bg-center bg-no-repeat flex items-end pb-6">
      <div className="w-full max-w-[1200px] px-4 mx-auto flex items-end">
        {showFallback ? (
          <div className="size-24 rounded-full bg-main-blue flex items-center justify-center text-white shadow-md">
            <Utensils className="h-8 w-8" />
          </div>
        ) : (
          <Image
            src={logo}
            alt="Restaurant Logo"
            width={1000}
            height={1000}
            onError={() => setImageError(true)}
            className="size-24 object-cover rounded-full shadow-md"
          />
        )}
      </div>
    </div>
  );
};

export default ResturantHeader;
