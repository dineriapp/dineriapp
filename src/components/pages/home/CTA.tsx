import { LeftSideSVGImage, RightSideSVGImage } from '@/lib/svgs'
import React from 'react'

const CTA = () => {
    return (
        <div className='w-full bg-[#DFE9B7] px-5 py-[188px] flex relative items-center justify-center flex-col overflow-hidden'>
            <LeftSideSVGImage className='w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[466px] h-auto absolute top-0 left-0 pointer-events-none' />
            <RightSideSVGImage className='w-full max-w-[300px] lg:max-w-[585px] h-auto absolute bottom-0 right-0 pointer-events-none' />
            <div className='w-full mx-auto max-w-[740px] gap-[46px] flex flex-col items-center justify-center'>
                <h2 className='text-center text-[#1B4048] text-[60px] lg:text-[88px] font-[900] leading-[1.1]'>
                    Start Your Journey Now
                </h2>
                <button className='bg-[#1B4048] hover:bg-[#176577] transition-all text-[#BDD3D8] font-poppins font-[600] cursor-pointer text-base px-[36px] h-[62px] rounded-full'>
                    Get started for free
                </button>
            </div>
        </div>
    )
}

export default CTA

