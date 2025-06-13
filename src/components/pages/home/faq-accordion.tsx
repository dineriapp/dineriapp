"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FAQItem {
    question: string
    answer: string
}

interface FAQAccordionProps {
    items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
    return (
        <Accordion type="single" collapsible className="w-full">
            {items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left text-lg font-medium">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-slate-600">{item.answer}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
