"use client"
import { Input } from "@/components/ui/input"
import { ChevronDown, HelpCircle, Search, Star } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FAQ {
    id: string
    question: string
    answer: string
    is_featured: boolean
    view_count: number
}

interface FAQCategory {
    id: string
    name: string
    description?: string
    sort_order: number
    faqs?: FAQ[]
}

interface FAQSectionProps {
    restaurantId: string
    accentColor?: string
    className?: string
}


const DUMMY_FAQ_CATEGORIES: FAQCategory[] = [
    {
        id: "1",
        name: "Reservations & Hours",
        description: "Information about booking and our operating hours",
        sort_order: 1,
        faqs: [
            {
                id: "1",
                question: "Do I need a reservation?",
                answer:
                    "While walk-ins are welcome, we highly recommend making a reservation, especially for dinner service and weekends. You can book online or call us directly.",
                is_featured: true,
                view_count: 156,
            },
            {
                id: "2",
                question: "What are your opening hours?",
                answer:
                    "We are open Monday-Wednesday 11 AM-10 PM, Thursday-Friday 11 AM-11 PM, Saturday 10 AM-11 PM, and Sunday 10 AM-9 PM.",
                is_featured: true,
                view_count: 134,
            },
            {
                id: "3",
                question: "Can I modify or cancel my reservation?",
                answer:
                    "Yes, you can modify or cancel your reservation up to 2 hours before your scheduled time. Please call us or use our online reservation system.",
                is_featured: false,
                view_count: 89,
            },
        ],
    },
    {
        id: "2",
        name: "Menu & Dietary",
        description: "Questions about our food and dietary accommodations",
        sort_order: 2,
        faqs: [
            {
                id: "4",
                question: "Do you have vegetarian and vegan options?",
                answer:
                    "Yes! We offer several vegetarian dishes and can modify many of our pasta dishes to be vegan. Please inform your server about any dietary restrictions.",
                is_featured: true,
                view_count: 198,
            },
            {
                id: "5",
                question: "Are your ingredients fresh and locally sourced?",
                answer:
                    "We pride ourselves on using the freshest ingredients. Many of our vegetables and herbs are sourced from local farms, and we import specialty items directly from Italy.",
                is_featured: false,
                view_count: 76,
            },
            {
                id: "6",
                question: "Do you accommodate food allergies?",
                answer:
                    "Absolutely. Please inform your server about any allergies or dietary restrictions. Our kitchen staff is trained to handle allergy concerns safely.",
                is_featured: true,
                view_count: 145,
            },
        ],
    },
    {
        id: "3",
        name: "Events & Catering",
        description: "Information about private events and catering services",
        sort_order: 3,
        faqs: [
            {
                id: "7",
                question: "Do you host private events?",
                answer:
                    "Yes, we have a private dining room that can accommodate up to 40 guests. We also offer full restaurant buyouts for larger events.",
                is_featured: false,
                view_count: 67,
            },
            {
                id: "8",
                question: "Do you offer catering services?",
                answer:
                    "We provide full-service catering for events of all sizes. Our catering menu includes many of our popular dishes adapted for off-site service.",
                is_featured: false,
                view_count: 54,
            },
        ],
    },
    {
        id: "4",
        name: "Payment & Policies",
        description: "Information about payment methods and restaurant policies",
        sort_order: 4,
        faqs: [
            {
                id: "9",
                question: "What payment methods do you accept?",
                answer:
                    "We accept all major credit cards, debit cards, and cash. We also accept contactless payments including Apple Pay and Google Pay.",
                is_featured: false,
                view_count: 43,
            },
            {
                id: "10",
                question: "What is your cancellation policy?",
                answer:
                    "We require 24-hour notice for cancellations of parties of 6 or more. For smaller parties, we ask for at least 2 hours notice.",
                is_featured: false,
                view_count: 38,
            },
        ],
    },
]

export function FAQSection({ restaurantId, accentColor = "#0f766e", className = "" }: FAQSectionProps) {
    const [categories, setCategories] = useState<FAQCategory[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadFAQs() {
            try {
                // Simulate loading delay
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Load dummy FAQ data
                setCategories(DUMMY_FAQ_CATEGORIES)
            } catch (error) {
                console.error("Error loading FAQs:", error)
            } finally {
                setLoading(false)
            }
        }

        loadFAQs()
    }, [restaurantId])

    const handleFAQClick = async (faqId: string) => {
        // Simulate tracking FAQ view
        console.log(`FAQ viewed: ${faqId}`)
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
    }

    // Filter FAQs based on search term
    const filteredCategories = categories
        .map((category) => ({
            ...category,
            faqs:
                category.faqs?.filter(
                    (faq) =>
                        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
                ) || [],
        }))
        .filter((category) => category.faqs.length > 0)

    // Get featured FAQs across all categories
    const featuredFAQs = categories
        .flatMap((cat) => cat.faqs?.filter((faq) => faq.is_featured) || [])
        .sort((a, b) => b.view_count - a.view_count)

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="animate-pulse">
                    <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 rounded bg-gray-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (categories.length === 0) {
        return null
    }

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="text-center">
                <h2 className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold">
                    <HelpCircle className="h-6 w-6" style={{ color: accentColor }} />
                    Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">Find quick answers to common questions</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Featured FAQs */}
            {featuredFAQs.length > 0 && !searchTerm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Popular Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {featuredFAQs.slice(0, 3).map((faq) => (
                            <motion.div key={faq.id} className="overflow-hidden rounded-lg border">
                                <button
                                    onClick={() => handleFAQClick(faq.id)}
                                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                                >
                                    <span className="font-medium">{faq.question}</span>
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`}
                                        style={{ color: accentColor }}
                                    />
                                </button>
                                <AnimatePresence>
                                    {expandedFAQ === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 pt-0 text-muted-foreground">{faq.answer}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* FAQ Categories */}
            <div className="space-y-6">
                {filteredCategories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {category.faqs?.map((faq: any) => (
                                <motion.div key={faq.id} className="overflow-hidden rounded-lg border">
                                    <button
                                        onClick={() => handleFAQClick(faq.id)}
                                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{faq.question}</span>
                                            {faq.is_featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`}
                                            style={{ color: accentColor }}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {expandedFAQ === faq.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 leading-relaxed text-muted-foreground">{faq.answer}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {searchTerm && filteredCategories.length === 0 && (
                <div className="py-8 text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms or browse our categories above</p>
                </div>
            )}
        </div>
    )
}
