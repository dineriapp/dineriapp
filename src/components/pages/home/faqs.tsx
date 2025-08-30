import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight } from 'lucide-react'

const faqs = [
    {
        question: "How long does it take to set up my restaurant profile?",
        answer:
            "Most restaurants can set up their complete profile in under 30 minutes. Our intuitive interface makes it easy to add your information, menu items, and customize your page.",
    },
    {
        question: "Can I connect my existing reservation system?",
        answer:
            "Yes! dineri.app integrates with popular reservation systems like OpenTable, Resy, and more. You can easily connect your existing system during setup.",
    },
    {
        question: "How do I update my menu?",
        answer:
            "Updating your menu is simple. Log in to your dashboard, navigate to the Menu section, and you can add, edit, or remove items in real-time. Changes appear instantly on your profile.",
    },
    {
        question: "Is there a limit to how many photos I can upload?",
        answer:
            "Basic plans include up to 10 photos, while Pro and Enterprise plans offer unlimited photo uploads to showcase your restaurant, dishes, and ambiance.",
    },
]

const Faqs = () => {
    return (
        <div className='w-full flex items-center justify-center bg-[#A0BC94] px-5 pt-12 sm:pt-[86px] pb-14 sm:pb-[157px]'>
            <div className='w-full flex items-center justify-center gap-10 sm:gap-16 flex-col max-w-[1140px]'>
                <div className='flex items-center justify-center flex-col gap-6'>
                    <h2 className='text-[#000000] font-[900] font-inter text-[40px] sm:text-[56px] text-center leading-[1.3]'>
                        Frequently asked questions
                    </h2>
                    <p className='text-[#1E2330] font-inter font-[500] text-xl text-center'>Everything you need to know about dineri.app</p>
                </div>
                <div className='w-full'>
                    <FAQAccordion items={faqs} />
                </div>
            </div>
        </div>
    )
}

export default Faqs


interface FAQItem {
    question: string
    answer: string
}

interface FAQAccordionProps {
    items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
    return (
        <Accordion type="single" collapsible className="w-full flex flex-col gap-5 sm:gap-[28px] ">
            {items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className='bg-[#D3E4CC] rounded-[8px] py-0'>
                    <AccordionTrigger className="text-left font-[500] font-inter text-lg sm:text-[22px] py-5 sm:py-[33px] px-4 sm:px-6 cursor-pointer leading-[1.2] text-[#242424] "
                        icon={
                            <>
                                <ChevronRight className=' text-[#042618] pointer-events-none  size-[24px] aspect-square shrink-0 translate-y-0.5 transition-transform duration-200' />
                            </>
                        }
                    >{item.question}</AccordionTrigger>
                    <AccordionContent className="text-slate-60  pt-0 text-[#242424] px-4 sm:px-6 text-base sm:text-lg pb-6">{item.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
