import Image from 'next/image'
import React from 'react'

const Hero = () => {
    return (
        <div className='w-full bg-[#FFFFFF] max-w-[1920px] mx-auto pt-[140px] sm:pt-[170px] 900:pt-[220px] lg:pt-[286px] 900:pb-[140px] lg:pb-[232px] xl:gap-0 gap-5 flex items-center justify-center flex-col relative px-5'>
            <div className='w-full max-w-[1281px] flex flex-col gap-6 900:gap-16'>
                <h1 className='text-[#000000] font-inter font-[900] sm:text-start text-center text-[40px] sm:text-[50px] 900:text-[60px] xl:text-[88px] leading-[1.2] xl:leading-[96px]'>
                    The way to <br className='sm:flex hidden' />
                    elevate <br className='sm:flex hidden' />
                    your restaurant
                </h1>
                <div className='flex items-center sm:flex-row flex-col sm:w-auto w-full justify-start gap-4'>
                    <button className='bg-transparent px-[28px] h-[52px] 900:h-[66px] text-[#002147] border border-[#002147] hover:text-white hover:bg-[#002147] transition-all font-poppins font-[600] text-sm 900:text-base rounded-full cursor-pointer'>
                        Get Started – It’s Free
                    </button>
                    <button className='bg-[#002147] px-[28px] h-[52px] 900:h-[66px] text-[#FFFFFF] hover:bg-main-hover/80 transition-all font-poppins font-[600] text-sm 900:text-base rounded-full cursor-pointer'>
                        See What You Can Do
                    </button>
                </div>
            </div>
            <Image src={"/hero-mobile.png"} alt='hero-mobile.png' width={750} height={700} className='w-full max-w-[450px] lg:max-w-[600px] xl:ml-0 ml-auto xl:max-w-[706px] 900:absolute bottom-0 right-0' />
        </div>
    )
}

export default Hero
