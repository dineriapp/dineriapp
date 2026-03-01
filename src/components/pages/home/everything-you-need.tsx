import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation'
import React from 'react'

const EverythingYouNeed = () => {
    const t = useTranslations('Home.EverythingYouNeed');

    const leftItems = [
        { number: "01", },
        { number: "03" },
        { number: "05" }
    ];

    const rightItems = [
        { number: "02" },
        { number: "04" },
        { number: "06" }
    ];

    return (
        <div className='bg-[#EBE3CC] w-full px-5 py-[31px] flex items-center justify-center'>
            <div className='w-full max-w-[1282px] flex items-center lg:flex-row flex-col justify-between gap-8 lg:gap-[93px]'>
                <div className='w-full lg:max-w-[491px]  flex items-start justify-between gap-[14px]'>
                    <div className='grid gap-4 sm:gap-[34px] w-full'>
                        {/* left items */}
                        {
                            leftItems.map((item, index) => {
                                return <div
                                    key={index}
                                    style={{ backgroundColor: "#F6E3D5" }}
                                    className=' box-shad-every py-[21px] px-[15px] rounded-[25px] border-[4px] border-[#000000]'>
                                    <div className='w-full flex items-center justify-center lg:h-[92px]'>
                                        <div className='w-full max-w-[151px] flex items-center justify-end'>
                                            <h3 className='text-[#000000] font-poppins font-[900] text-[45px] sm:text-[57px] leading-[1.1] lg:leading-auto'>
                                                {item.number}
                                            </h3>
                                        </div>
                                    </div>
                                    <h2 className='text-[#090909] font-[600] font-inter text-[13px] leading-[18px]'>
                                        {t(`features.${item.number}.title`)}
                                    </h2>
                                    <p className='mt-2 text-[#333333] font-inter font-[400] text-[12px] leading-[15px]'>
                                        {t(`features.${item.number}.description`)}
                                    </p>
                                </div>
                            })
                        }
                    </div>
                    <div className='grid  gap-4 sm:gap-[34px] pt-[54px] w-full'>
                        {/* right items */}
                        {
                            rightItems.map((item, index) => {
                                return <div
                                    key={index}
                                    style={{ backgroundColor: "#F6E3D5" }}
                                    className=' box-shad-every py-[21px] px-[15px] rounded-[25px] border-[4px] border-[#000000]'>
                                    <div className='w-full flex items-center justify-center lg:h-[92px]'>
                                        <div className='w-full max-w-[151px] flex items-center justify-end'>
                                            <h3 className='text-[#000000] font-poppins font-[900] text-[45px] sm:text-[57px]  leading-[1.1] lg:leading-auto'>
                                                {item.number}
                                            </h3>
                                        </div>
                                    </div>
                                    <h2 className='text-[#090909] font-[600] font-inter text-[13px] leading-[18px]'>
                                        {t(`features.${item.number}.title`)}
                                    </h2>
                                    <p className='mt-2 text-[#333333] font-inter font-[400] text-[12px] leading-[15px]'>
                                        {t(`features.${item.number}.description`)}
                                    </p>
                                </div>
                            })
                        }
                    </div>
                </div>
                <div className='w-full '>
                    <h1 className='text-[#000000] font-inter font-[900] text-[40px] sm:text-[56px] leading-[1.1]'>
                        {t('headline')}
                    </h1>
                    <p className='mt-5 sm:mt-7 text-[#1E2330] font-[500] font-inter sm:text-xl'>
                        {t('description')}
                    </p>
                    <Link href={"/sign-up"}>
                        <button className='mt-6 sm:mt-10 px-[36px] bg-[#009A5E] hover:bg-[#009A5E]/80 rounded-full hover:opacity-70 cursor-pointer transition-all h-[61px] curpo text-[#FFFFFF] font-[600] font-poppins text-lg'>
                            {t('cta')}
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default EverythingYouNeed
