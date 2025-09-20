import { useTranslations } from "next-intl";
import Image from "next/image";

const About = () => {
  const t = useTranslations("About");
  return (
    <div className="w-11/12  max-w-[1280px] mx-auto  lg:px-4 pb-12 lg:pt-40 pt-32">
      <div className=" flex items-center lg:flex-row flex-col w-full gap-10">
        <div className="lg:w-1/2 w-full">
          <h1 className="mb-3 md:mb-5 text-[44px] font-inter font-bold max-sm:text- leading-[1.05] tracking-tight text-[#002147] md:text-6xl lg:text-7xl lg:w-9/12">
            <span className="">
              {t("title")}
            </span>
          </h1>
          <p className="text-lg text-[#1E2330] lg:w-11/12">
            {t("description")}
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
        {t("p1")}
      </p>
      <p className="text-lg text-[#1E2330] my-10">
        {t("p2")}
      </p>
    </div>
  );
};

export default About;
