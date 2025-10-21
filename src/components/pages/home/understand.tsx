import { Locale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

const Understand = async () => {
    const t = await getTranslations("Home.Understand");
    const locale = await getLocale() as Locale;

    return (
        <div className="w-full px-5 flex items-center justify-center bg-[white] py-12 sm:py-[100px] lg:py-[170px]">
            <div className="w-full mx-auto max-w-[1165px] flex lg:flex-row flex-col items-start lg:items-center justify-between gap-6 xl:gap-[157px]">
                <div className="w-full max-w-[455px]">
                    <Image
                        src={`/understand-${locale}.webp`}
                        alt={`understand-${locale}.png`}
                        width={500}
                        height={500}
                        className="w-full max-w-[455px] aspect-square"
                    />
                </div>
                <div className="flex flex-col items-start justify-center">
                    <h2 className="font-inter font-[900] text-[#000000] text-[40px] sm:text-[56px] leading-[1.1]">
                        {t("headline")}
                    </h2>
                    <p className="mt-4 sm:mt-[18px] text-[#000000] font-[500] font-inter text-lg sm:text-xl">
                        {t("description")}
                    </p>
                    <button className="mt-6 sm:mt-[51px] text-[white] bg-[#009A5E] hover:bg-[#0b3f2b] rounded-full px-[37px] h-[62px] cursor-pointer transition-all font-poppins font-[600] text-base">
                        {t("cta")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Understand;
