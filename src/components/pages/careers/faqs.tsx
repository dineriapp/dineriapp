import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export function FAQSection() {
    return (
        <section className="px-4 md:px-12 lg:px-24 py-14 lg:py-20  ">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-[#002147]  mb-8 text-center">
                    Frequently Asked Questions
                </h2>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border rounded-xl bg-[#EBE3CC]  shadow-sm">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold cursor-pointer text-[#002147] ">
                            Do I need technical skills to use Dineri.app?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-gray-600  text-base leading-relaxed">
                            No, Dineri.app is designed to be user-friendly. You don’t need any coding knowledge and everything works with simple forms and settings.
                            The platform is also fully mobile-friendly, so you can easily update and manage your restaurant’s page directly from your phone.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border rounded-xl bg-[#EBE3CC]  shadow-sm">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold cursor-pointer text-[#002147] ">
                            Can I connect my existing reservation system?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-gray-600 text-base leading-relaxed">
                            At the moment, full integrations with well-known reservation systems are not yet available. We are actively working on this and plan to release it as a new feature soon.
                            For now, you can simply add the link to your existing reservation tool on your Dineri.app page.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border rounded-xl bg-[#EBE3CC]  shadow-sm">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold cursor-pointer text-[#002147] ">
                            Which domain extensions can I use with Dineri.app?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-gray-600  text-base leading-relaxed">
                            If you don’t have a domain yet, you can choose from one of our free domains tailored to your market. For example Ibiza.rest, Dineri.me, Thechef.me and many more.
                            We are continuously acquiring cool and professional domain extensions so we can offer you even more options that perfectly fit your business, all available for free.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border rounded-xl bg-[#EBE3CC] dark:bg-gray-800 shadow-sm">
                        <AccordionTrigger className="px-6 py-4 text-lg font-semibold cursor-pointer text-[#002147] dark:text-white">
                            Are there any commission fees?
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                            No. With Dineri.app, you keep 100% of your earnings. No commission on take-away, or delivery orders. Unlike many platforms that charge 10–30% per order, you only pay your subscription.
                            More profit, full control, and no surprises. Best of all, your payments go directly to your bank account, giving you full control and instant access to your earnings.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    )
}
