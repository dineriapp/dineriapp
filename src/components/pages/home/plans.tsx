import React from 'react'

const Plans = () => {
    return (
        <div className='w-full bg-[#FFFFFF] flex flex-col items-center justify-center px-5'>
            <div className='w-full flex flex-col items-center justify-center max-w-[698px] mx-auto py-14 sm:py-[97px]'>
                <h2 className='text-[#000000] text-center font-inter font-[900] text-[50px] sm:text-[56px] leading-[1.2]'>
                    Simple, transparent pricing
                </h2>
                <p className='mt-6 text-center font-inter font-[500] text-[#1E2330] text-[18px] sm:text-[20px] leading-[1.3]'>
                    No hidden fees. No surprises - Select the plan that suits you best
                </p>
                <button className='mt-10 bg-[#002147] hover:bg-[#0b478b] transition-all rounded-full px-[47px] cursor-pointer text-[#FFFFFF] font-poppins font-[600] text-[18px] leading-[1.2] h-[62px]'>
                    View All plans
                </button>
            </div>
        </div>
    )
}

export default Plans
