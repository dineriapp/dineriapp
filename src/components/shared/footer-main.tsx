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
                                {[
                                    { name: "Features", path: "/features" },
                                    { name: "Demo", path: "/demo" },
                                    { name: "Plans", path: "/plans" },
                                    { name: "Testimonials", path: "/#testimonials" },
                                    { name: "FAQ", path: "/#faq" },
                                ].map((item) => (
                                    <Link href={item.path} key={item.path} className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className='space-y-3 sm:space-y-5'>
                            <h3 className='font-poppins text-[#1E2330] font-[600] uppercase text-lg'>
                                Company
                            </h3>
                            <div className='flex flex-col gap-4'>
                                {[
                                    { name: "About", path: "/about" },
                                    { name: "Careers", path: "/careers" },
                                    { name: "Help Center", path: "/help-center" },
                                ].map((item, index) => (
                                    <Link key={index} href={item.path} className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className='space-y-3 sm:space-y-5'>
                            <h3 className='font-poppins text-[#1E2330] font-[600] uppercase text-lg'>
                                Legal
                            </h3>
                            <div className='flex flex-col gap-4'>
                                {[
                                    { name: "Terms", path: "/terms" },
                                    { name: "Privacy", path: "/privacy-policy" },
                                    { name: "Cookies", path: "/cookies" },
                                ].map((item, index) => (
                                    <Link key={index} href={item.path} className='text-[#676B5F] text-base font- hover:text-[#1E2330]'>

                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* bottom */}
                    <div className='w-full flex sm:flex-row flex-col sm:gap-0 gap-6 items-center justify-between'>
                        <Link href={"/signup"} className='sm:w-auto w-full'>
                            <div className=' flex items-center justify-center sm:w-auto w-full bg-[#009A5E] hover:bg-[#104e37] transition-all h-[62px] text-white px-[27px] rounded-full cursor-pointer hover: font-poppins font-[600] text-[18px] leading-[1]'>
                                Get started today
                            </div>
                        </Link>
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
                                        className="flex h-[46px] w-[46px] shrink-0 items-center bg-[#009A5E] hover:bg-[#104e37] transition-all justify-center rounded-full  text-white  "
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
