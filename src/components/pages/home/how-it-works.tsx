import { useTranslations } from "next-intl";
import Image from "next/image"
import { Link } from "@/i18n/navigation";

const HowItWorks = () => {
    const t = useTranslations("Home.HowItWorks");

    return (
        <div className="w-full bg-[#002147] px-5 text-white flex items-center pt-12 sm:pt-[108px] pb-12 sm:pb-[108px] xl:pb-[807px] justify-center">
            <div className="w-full max-w-[1320px] relative xl:space-y-0 space-y-10 sm:space-y-5">
                <div className="xl:pt-[132px]">
                    <h2 className="text-[#FFFFFF] max-w-[700px] font-inter font-[900] text-[40px] sm:text-[56px] leading-[1.1]">
                        {t("headline")}
                    </h2>
                    <p className="text-[#FFFFFF] font-inter font-[500] text-xl mt-5 sm:mt-6">
                        {t("description")}
                    </p>
                    <Link href={"/sign-up"}>
                        <button className='px-[46px] mt-5 sm:mt-8 bg-[#009A5E] hover:bg-[#009A5E]/80 rounded-full hover:opacity-80 cursor-pointer transition-all h-[58px] text-[white] font-[600] font-poppins text-lg'>
                            {t("cta")}
                        </button>
                    </Link>
                </div>
                <div className="xl:absolute top-0 right-0 flex flex-col w-full xl:w-[840px] xl:pointer-events-none">
                    <div className="w-full ml-auto bg-[#FFFFFF] text-[#000000] 900:max-w-[392px] relative p-6 sm:p-[32px] flex flex-col gap-16 xl:mr-[164px] rounded-[23px] overflow-hidden">
                        <Image src={"/frame-1.png"} alt="frame-1.png" width={200} height={200} className="w-full max-w-[170px] saturate-0  absolute top-0 right-0 pointer-events-none" />
                        <div>
                            <Image src={"/ix_user-profile-filled.png"} alt="ix_user-profile-filled.png" width={70} height={70} className="w-full saturate-0  max-w-[59px] pointer-events-none aspect-square" />
                        </div>
                        <div className="space-y-4 ">
                            <h3 className="text-[#000000] font-inter font-[700] text-[32px] leading-[1.2] lg:tracking-tighter">
                                {t("steps.01.title")}
                            </h3>
                            <p className="text-[#000000] font-inter font-[400] text-base">
                                {t("steps.01.description")}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <Image src={"/arr-down.png"} alt="arr-down.png" width={100} height={100} className="w-full 900:mr-[170px] max-w-[50px] sm:max-w-[75px]" />
                    </div>
                    <div className="relative w-full">
                        <div className="w-full bg-[#FFFFFF] text-[#000000] 900:max-w-[392px] relative p-6 sm:p-[32px] flex flex-col gap-16 overflow-hidden rounded-[23px]">
                            <Image src={"/frame-2.png"} alt="frame-2.png" width={200} height={200} className="w-full max-w-[170px] absolute saturate-0  top-0 right-0 pointer-events-none" />
                            <div>
                                <Image src={"/foundation_upload.png"} alt="foundation_upload.png" width={70} height={70} className="w-full saturate-0  max-w-[62px] pointer-events-none aspect-square" />
                            </div>
                            <div className="space-y-4 ">
                                <h3 className="text-[#000000] font-inter font-[700] text-[32px] leading-[1.2] lg:tracking-tighter">
                                    {t("steps.02.title")}
                                </h3>
                                <p className="text-[#000000] font-inter font-[400] lg:tracking-wide text-base">
                                    {t("steps.02.description")}
                                </p>
                            </div>
                        </div>
                        <Image src={"/arr-down.png"} alt="arr-down.png" width={100} height={100} className="w-full 900:absolute top-[107%] 900:ml-[330px] 900:mr-0 mx-auto ro 900:rotate-[-90deg] max-w-[50px] sm:max-w-[75px]" />

                    </div>
                    <div className="w-full bg-[#FFFFFF] ml-auto 900:mt-[-60px] 900:max-w-[392px] relative p-6 sm:p-[32px] flex flex-col gap-16  overflow-hidden rounded-[23px]">
                        <Image src={"/frame-3.png"} alt="frame-3.png" width={200} height={200} className="w-full saturate-0  max-w-[170px] absolute top-0 right-0 pointer-events-none" />
                        <div>
                            <Image src={"/card-header-arr.png"} alt="card-header-arr.png" width={70} height={70} className="w-full saturate-0  max-w-[48px] pointer-events-none aspect-square" />
                        </div>
                        <div className="space-y-4 ">
                            <h3 className="text-[#000000] font-inter font-[700] text-[32px] leading-[1.2] tracking-tight">
                                {t("steps.03.title")}
                            </h3>
                            <p className="text-[#000000] font-inter font-[400] text-base">
                                {t("steps.03.description")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HowItWorks
