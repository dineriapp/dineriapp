import Image from 'next/image'
import React from 'react'

const Understand = () => {
    return (
        <div className='w-full px-5 flex items-center justify-center bg-[#014A3F] py-12 sm:py-[100px] lg:py-[170px]'>
            <div className='w-full mx-auto max-w-[1165px] flex lg:flex-row flex-col items-start lg:items-center justify-between gap-6 xl:gap-[157px]'>
                <div className='w-full max-w-[455px] '>
                    <Image src={"/understand-image.png"} alt='understand-image.png' width={500} height={500} className='w-full max-w-[455px] aspect-square' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                    <h2 className='font-inter font-[900] text-[#DAE9D2] text-[40px] sm:text-[56px] leading-[1.1]'>
                        Understand your audience, grow your restaurant
                    </h2>
                    <p className='mt-4 sm:mt-[18px] text-[#DAE9D2] font-[500] font-inter text-lg sm:text-xl'>
                        Track clicks, revenue, and QR scans in real time. Get clear insights into what’s working, so you can make smarter updates and keep customers coming back.
                    </p>
                    <button className='mt-6 sm:mt-[51px] text-[#014A3F] bg-[#DAE9D2] hover:bg-[#b6f394] rounded-full px-[36px] h-[62px] cursor-pointer transition-all font-poppins font-[600] text-base'>
                        Get started for free
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Understand
