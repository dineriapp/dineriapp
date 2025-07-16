import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FAQAccordion } from './faq-accordion'
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
const FaqSection = () => {
    return (
        <section className="bg-white py-14 lg:py-24">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="mb-8 lg:mb-16 max-w-3xl mx-auto text-center">
                    <h2 className="mb-4 text-3xl font-bold text-main md:text-4xl lg:text-5xl">
                        Frequently asked questions
                    </h2>
                    <p className="text-xl text-main-text">
                        Everything you need to know about dineri.app
                    </p>
                </div>

                <div className="mx-auto max-w-3xl">
                    <FAQAccordion items={faqs} />

                    <div className="mt-8 lg:mt-12 rounded-2xl bg-gradient-to-r from-main-action to-main p-8 text-center text-white">
                        <h3 className="mb-4 text-2xl font-bold">
                            Need help getting started?
                        </h3>
                        <p className="mb-6">
                            We’re here to answer your questions about Dineri.app.
                        </p>
                        <Link href="mailto:Dineri.app@proton.me">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-white text-main hover:bg-main-background"
                            >
                                Contact our team
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FaqSection
