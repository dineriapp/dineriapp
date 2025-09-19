import { useTranslations } from 'next-intl';
import Link from 'next/link'
import React from 'react'

const Plans = () => {
    const t = useTranslations("Home.Plans");

    return (
        <div className='w-full bg-[#EBE3CCD1] flex flex-col  bg-cover items-center bg-top justify-center px-5'
            style={{
                backgroundImage: "url(/plans-bg.png)"
            }}
        >
            <div className='w-full flex flex-col items-center justify-center max-w-[698px] mx-auto py-14 sm:py-[97px]'>
                <h2 className='text-[#000000] text-center font-inter font-[900] text-[50px] sm:text-[56px] leading-[1.2]'>
                    {t("headline")}
                </h2>
                <p className='mt-6 text-center font-inter font-[500] !max-w-[500px] text-[#1E2330] text-[18px] sm:text-[20px] leading-[1.3]'>
                    {t("description")}
                </p>
                <button className='mt-10'>
                    <Link href={"/plans"} className=' bg-[#009A5E] hover:bg-[#13573d] transition-all rounded-full px-[47px] cursor-pointer text-[#FFFFFF] font-poppins font-[600] text-[18px] leading-[1.2] py-5'>
                        {t("cta")}
                    </Link>
                </button>
            </div>
        </div>
    )
}

export default Plans
