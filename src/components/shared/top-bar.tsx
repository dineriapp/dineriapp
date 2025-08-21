import Link from "next/link";
import React from "react";

const TopBar = () => {
  return (
    <div className="p-5 max-w-[1200px] mx-auto flex justify-center">
      <p className="text-center">
        Time to convert clicks into customers.
        <Link href={"/login"} className="underline ml-2">
          Start the Journey
        </Link>
      </p>
    </div>
  );
};

export default TopBar;
