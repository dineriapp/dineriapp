import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'



const Faqs = () => {
    const t = useTranslations("Home.Faqs")

    const faqItems = ["items.01", "items.02", "items.03", "items.04"]
    return (
        <div id='faq' className='w-full flex items-center scroll-mt-10 justify-center bg-[white] px-5 pt-12 sm:pt-[86px] pb-14 sm:pb-[157px]'>
            <div className='w-full flex items-center justify-center gap-10 sm:gap-16 flex-col max-w-[1140px]'>
                <div className='flex items-center justify-center flex-col gap-6'>
                    <h2 className='text-[#000000] font-[900] font-inter text-[40px] sm:text-[56px] text-center leading-[1.3]'>
                        {t("headline")}
                    </h2>
                    <p className='text-[#1E2330] font-inter font-[500] text-xl text-center'>{t("description")}</p>
                </div>
                <div className='w-full'>
                    <Accordion type="single" collapsible className="w-full flex flex-col gap-5 sm:gap-[28px] ">
                        {faqItems.map((id) => {
                            const question = t(`${id}.question`)
                            const answers = t.raw(`${id}.answer`) as string[] // force array from JSON

                            return (
                                <AccordionItem key={id} value={`item-${id}`} className="bg-[#EBE3CC] rounded-[8px] py-0">
                                    <AccordionTrigger
                                        className="text-left font-[500] font-inter text-lg sm:text-[22px] py-5 sm:py-[33px] px-4 sm:px-6 cursor-pointer leading-[1.2] text-[#242424]"
                                        icon={<ChevronRight className="text-[#042618] size-[24px] transition-transform duration-200" />}
                                    >
                                        {question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-[#242424] px-4 sm:px-6 space-y-3 text-base sm:text-lg pb-6">
                                        {answers.map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </div>
            </div>
        </div>
    )
}

export default Faqs

