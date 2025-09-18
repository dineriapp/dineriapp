import { Instagram } from 'lucide-react';
import Link from 'next/link';

function XLogo() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="23"
            height="23"
            viewBox="0 0 1200 1227"
            fill="currentColor"
        >
            <path d="M714.163 519.284 1160.89 0H1054.64L666.092 450.887 357.328 0H0l465.777 681.821L0 1227h106.254l409.49-478.648L842.672 1227H1200L714.163 519.284Zm-144.77 168.47-47.486-67.84L174.59 79.471h136.988l228.72 327.02 47.485 67.84 370.286 529.05H821.081L569.393 687.754Z" />
        </svg>

    );
}


const FooterMain = () => {
    return (
        <footer className='w-full bg-[#002147] pt-10 sm:pt-[77px] pb-10 sm:pb-[104px] px-5'>
            <div className='w-full max-w-[1354px] mx-auto py-8 sm:py-[105px] flex items-center justify-center px-6 sm:px-10 bg-[#FFFFFF] rounded-[14px] sm:rounded-[32px]'>
                <div className='w-full max-w-[930px] mx-auto flex flex-col '>
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
                    <div className='w-full mt-7 sm:mt-[99px] flex sm:flex-row flex-col sm:gap-0 gap-6 items-center justify-between'>
                        <Link href={"/signup"} className='sm:w-auto w-full'>
                            <div className=' flex items-center justify-center sm:w-auto w-full bg-[#009A5E] hover:bg-[#104e37] transition-all h-[62px] text-white px-[27px] rounded-full cursor-pointer hover: font-poppins font-[600] text-[18px] leading-[1]'>
                                Get started today
                            </div>
                        </Link>
                        <div className="flex gap-[18px] items-center">
                            {[
                                { icon: Instagram, href: "https://www.instagram.com/dineri.app" },
                                { icon: XLogo, href: "https://x.com/Dineri_app" },
                            ].map((social, i) => {
                                const Icon = social.icon;
                                return (
                                    <Link
                                        key={i}
                                        href={social.href}
                                        target='_blank'
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
                    <div className='w-full mt-10 font-poppins text-muted-foreground text-base flex items-center justify-center'>
                        <p className='text-center'>© 2025 <strong className='text-black'>Dineri.app</strong>. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default FooterMain
