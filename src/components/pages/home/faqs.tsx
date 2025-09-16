import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight } from 'lucide-react'



const Faqs = () => {
    return (
        <div id='faq' className='w-full flex items-center scroll-mt-10 justify-center bg-[white] px-5 pt-12 sm:pt-[86px] pb-14 sm:pb-[157px]'>
            <div className='w-full flex items-center justify-center gap-10 sm:gap-16 flex-col max-w-[1140px]'>
                <div className='flex items-center justify-center flex-col gap-6'>
                    <h2 className='text-[#000000] font-[900] font-inter text-[40px] sm:text-[56px] text-center leading-[1.3]'>
                        Got questions?
                    </h2>
                    <p className='text-[#1E2330] font-inter font-[500] text-xl text-center'>Everything you need to know about our services</p>
                </div>
                <div className='w-full'>
                    <FAQAccordion />
                </div>
            </div>
        </div>
    )
}

export default Faqs




export function FAQAccordion() {
    return (
        <Accordion type="single" collapsible className="w-full flex flex-col gap-5 sm:gap-[28px] ">
            <AccordionItem value={`item-1`} className='bg-[#EBE3CC] rounded-[8px] py-0'>
                <AccordionTrigger className="text-left font-[500] font-inter text-lg sm:text-[22px] py-5 sm:py-[33px] px-4 sm:px-6 cursor-pointer leading-[1.2] text-[#242424] "
                    icon={
                        <>
                            <ChevronRight className=' text-[#042618] pointer-events-none  size-[24px] aspect-square shrink-0 translate-y-0.5 transition-transform duration-200' />
                        </>
                    }
                >
                    Do I need technical skills to use Dineri.app?
                </AccordionTrigger>
                <AccordionContent className="text-slate-60  pt-0 text-[#242424] px-4 sm:px-6 text-base sm:text-lg pb-6">
                    No, Dineri.app is designed to be user-friendly. You don’t need any coding knowledge and
                    everything works with simple forms and settings. The platform is also fully mobile-friendly, so
                    you can easily update and manage your restaurant’s page directly from your phone.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value={`item-2`} className='bg-[#EBE3CC] rounded-[8px] py-0'>
                <AccordionTrigger className="text-left font-[500] font-inter text-lg sm:text-[22px] py-5 sm:py-[33px] px-4 sm:px-6 cursor-pointer leading-[1.2] text-[#242424] "
                    icon={
                        <>
                            <ChevronRight className=' text-[#042618] pointer-events-none  size-[24px] aspect-square shrink-0 translate-y-0.5 transition-transform duration-200' />
                        </>
                    }
                >
                    Can I connect my existing reservation system?
                </AccordionTrigger>
                <AccordionContent className="text-slate-60  pt-0 text-[#242424] px-4 sm:px-6 text-base sm:text-lg pb-6">
                    At the moment, full integrations with well-known reservation systems are not yet available.
                    We are actively working on this and plan to release it as a new feature soon. For now, you
                    can simply add the link to your existing reservation tool on your Dineri.app page.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value={`item-3`} className='bg-[#EBE3CC] rounded-[8px] py-0'>
                <AccordionTrigger className="text-left font-[500] font-inter text-lg sm:text-[22px] py-5 sm:py-[33px] px-4 sm:px-6 cursor-pointer leading-[1.2] text-[#242424] "
                    icon={
                        <>
                            <ChevronRight className=' text-[#042618] pointer-events-none  size-[24px] aspect-square shrink-0 translate-y-0.5 transition-transform duration-200' />
                        </>
                    }
                >
                    Which domain extensions can I use with Dineri.app?
                </AccordionTrigger>
                <AccordionContent className="text-slate-60  pt-0 text-[#242424] px-4 sm:px-6 space-y-3 text-base sm:text-lg pb-6">
                    <p>
                        If you don’t have a domain yet, you can choose from one of our free domains tailored to your
                        market. For example Ibiza.rest, Dineri.me, Thechef.me and many more.
                    </p>
                    <p>
                        We are continuously acquiring cool and professional domain extensions so we can offer you
                        even more options that perfectly fit your business, all available for free.
                    </p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value={`item-4`} className='bg-[#EBE3CC] rounded-[8px] py-0'>
                <AccordionTrigger className="text-left font-[500] font-inter text-lg sm:text-[22px] py-5 sm:py-[33px] px-4 sm:px-6 cursor-pointer leading-[1.2] text-[#242424] "
                    icon={
                        <>
                            <ChevronRight className=' text-[#042618] pointer-events-none  size-[24px] aspect-square shrink-0 translate-y-0.5 transition-transform duration-200' />
                        </>
                    }
                >
                    Are there any commission fees?
                </AccordionTrigger>
                <AccordionContent className="text-slate-60  pt-0 text-[#242424] px-4 sm:px-6 space-y-3 text-base sm:text-lg pb-6">
                    <p>
                        No. With Dineri.app, you keep 100% of your earnings. No commission on take-away, or
                        delivery orders. Unlike many platforms that charge 10–30% per order, you only pay your
                        subscription. More profit, full control, and no surprises.
                    </p>
                    <p>
                        Best of all, your payments go directly to your bank account, giving you full control and instant
                        access to your earnings.
                    </p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
