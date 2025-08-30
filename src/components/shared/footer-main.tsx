import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link'
import React from 'react'

const FooterMain = () => {
    return (
        <footer className='w-full bg-[#002147] pt-10 sm:pt-[77px] pb-10 sm:pb-[104px] px-5'>
            <div className='w-full max-w-[1354px] mx-auto py-8 sm:py-[105px] flex items-center justify-center px-6 sm:px-10 bg-[#FFFFFF] rounded-[14px] sm:rounded-[32px]'>
                <div className='w-full max-w-[930px] mx-auto flex flex-col gap-7 sm:gap-[99px]'>
                    {/* top  */}
                    <div className='w-full flex sm:flex-row flex-col sm:gap-0 gap-5 items-start justify-between'>
                        <div className='space-y-3 sm:space-y-5'>
                            <h3 className='font-poppins text-[#1E2330] font-[600] uppercase text-lg'>
                                Product
                            </h3>
                            <div className='flex flex-col gap-[14px]'>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Features
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Pricing
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Testimonials
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    FAQ
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Demo
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Support
                                </Link>
                            </div>
                        </div>
                        <div className='space-y-3 sm:space-y-5'>
                            <h3 className='font-poppins text-[#1E2330] font-[600] uppercase text-lg'>
                                Company
                            </h3>
                            <div className='flex flex-col gap-4'>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    About
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Careers
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Help Center
                                </Link>
                            </div>
                        </div>
                        <div className='space-y-3 sm:space-y-5'>
                            <h3 className='font-poppins text-[#1E2330] font-[600] uppercase text-lg'>
                                Legal
                            </h3>
                            <div className='flex flex-col gap-4'>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Terms
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Privacy
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Cookies
                                </Link>
                                <Link href="#" className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                    Licenses
                                </Link>

                            </div>
                        </div>
                    </div>
                    {/* bottom */}
                    <div className='w-full flex sm:flex-row flex-col sm:gap-0 gap-6 items-center justify-between'>
                        <div className='sm:w-auto w-full'>
                            <button className='bg-[#002147] sm:w-auto w-full hover:bg-[#083a70] transition-all h-[62px] text-white px-[27px] rounded-full cursor-pointer hover: font-poppins font-[600] text-[18px] leading-[1]'>
                                Get Started Today
                            </button>
                        </div>
                        <div className="flex gap-[18px] items-center">
                            {[
                                { icon: Instagram, href: "https://instagram.com" },
                                { icon: Twitter, href: "https://twitter.com" },
                                { icon: Facebook, href: "https://facebook.com" },
                                { icon: Linkedin, href: "https://linkedin.com" },
                            ].map((social, i) => {
                                const Icon = social.icon;
                                return (
                                    <Link
                                        key={i}
                                        href={social.href}
                                        className="flex h-[46px] w-[46px] shrink-0 items-center hover:bg-[#083a70] transition-all justify-center rounded-full bg-[#002147] text-white  "
                                    >
                                        <Icon className="h-[23px] aspect-square shrink-0 w-[23px]" />
                                        <span className="sr-only">
                                            {social.href.split("https://")[1]}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default FooterMain
