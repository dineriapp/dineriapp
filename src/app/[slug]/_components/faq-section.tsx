"use client"
import { Input } from "@/components/ui/input"
import { ChevronDown, HelpCircle, Search, Star } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FaqCategory, Faq } from "@prisma/client"

type FAQCategoryWithFaqs = FaqCategory & {
    faqs: Faq[]
}

interface FAQSectionProps {
    faqCategories: FAQCategoryWithFaqs[]
    accentColor?: string
    className?: string
    cardstextColor?: string
}

export function FAQSection({ faqCategories, accentColor = "#0f766e", className = "", cardstextColor }: FAQSectionProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [viewedFAQs, setViewedFAQs] = useState<Set<string>>(new Set())

    const handleFAQClick = async (faqId: string) => {
        const isCurrentlyExpanded = expandedFAQ === faqId
        const isFirstTimeViewing = !viewedFAQs.has(faqId)

        // Toggle the expanded state
        setExpandedFAQ(isCurrentlyExpanded ? null : faqId)
        // Only track view if this is the first time opening this FAQ
        if (!isCurrentlyExpanded && isFirstTimeViewing) {
            try {
                await fetch("/api/faq/track-view", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ faqId }),
                })

                // Mark this FAQ as viewed
                setViewedFAQs((prev) => new Set(prev).add(faqId))
            } catch (error) {
                console.error("Error tracking FAQ view:", error)
            }
        }

    }

    // Filter FAQs based on search term
    const filteredCategories = faqCategories
        .map((category) => ({
            ...category,
            faqs: category.faqs.filter(
                (faq) =>
                    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        }))
        .filter((category) => category.faqs.length > 0)

    // Get featured FAQs across all categories
    const featuredFAQs = faqCategories
        .flatMap((cat) => cat.faqs.filter((faq) => faq.is_featured))
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))

    if (faqCategories.length === 0) {
        return (
            <div className={`py-8 text-center ${className}`}>
                <HelpCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold">No FAQs Available</h3>
                <p className="text-muted-foreground">Check back later for frequently asked questions</p>
            </div>
        )
    }

    return (
        <div className={`space-y-3 sm:space-y-4 ${className}`}>
            {/* Search */}
            <div className="relative">
                <Search color={accentColor} className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <style>
                    {`
      .search-placeholder::placeholder {
        color: ${accentColor};
      }
    `}
                </style>
                <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    style={{
                        color: accentColor,
                        // @ts-expect-error due to types 
                        '--tw-ring-color': accentColor, // dynamic ring color
                    }}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 search-placeholder"
                />
            </div>

            {/* Featured FAQs */}
            {featuredFAQs.length > 0 && !searchTerm && (
                <Card
                    style={{
                        backgroundColor: accentColor,
                        borderColor: accentColor
                    }}
                >
                    <CardHeader className="px-4 sm:px-4">
                        <CardTitle style={{
                            color: cardstextColor
                        }} className="flex items-center gap-2 text-base sm:text-lg">
                            <Star className="h-5 w-5" style={{
                                color: cardstextColor
                            }} />
                            Popular Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 !py-0 px-4 sm:px-4">
                        {featuredFAQs.slice(0, 3).map((faq, index) => (
                            <motion.div key={`${faq.id}-${index}`} className="overflow-hidden rounded-lg border" style={{ borderColor: cardstextColor }}>
                                <button
                                    onClick={() => handleFAQClick(faq.id)}
                                    className="flex w-full items-center justify-between px-3 sm:px-4 py-3 sm:py-4 text-left transition-colors"
                                >
                                    <span className="font-medium sm:text-base text-sm" style={{
                                        color: cardstextColor
                                    }}>{faq.question}</span>
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`}
                                        style={{ color: cardstextColor }}
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
                                            <div className="p-4 pt-0 sm:text-base text-sm text-muted-foreground" style={{
                                                color: cardstextColor
                                            }}>{faq.answer}</div>
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
                    <Card
                        style={{
                            backgroundColor: accentColor,
                            borderColor: accentColor
                        }}
                        key={category.id}>
                        <CardHeader className="gap-1 !py-0 px-4 sm:px-4">
                            <CardTitle
                                style={{
                                    color: cardstextColor
                                }}
                                className="text-base sm:text-lg">{category.name}</CardTitle>
                            {category.description && <p
                                style={{
                                    color: cardstextColor
                                }}
                                className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>}
                        </CardHeader>
                        <CardContent className="space-y-3 !py-0 px-4 sm:px-4">
                            {category.faqs.map((faq) => (
                                <motion.div key={faq.id} className="overflow-hidden  rounded-lg border" style={{ borderColor: cardstextColor }}>
                                    <button
                                        onClick={() => handleFAQClick(faq.id)}
                                        className="flex w-full items-center relative justify-between px-3 sm:px-4 py-3 sm:py-4 text-left transition-colors "
                                    >
                                        <div className="flex sm:flex-row flex-col-reverse  items-start sm:items-center gap-1 sm:gap-2">
                                            <span className="font-medium sm:text-base text-sm" style={{
                                                color: cardstextColor
                                            }}>{faq.question}</span>
                                            {faq.is_featured && <Star className="h-3 sm:h-4 w-3 sm:w-4 " style={{
                                                color: cardstextColor
                                            }} />}
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`}
                                            style={{
                                                color: cardstextColor
                                            }}
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
                                                <div className="p-4 pt-0 leading-relaxed sm:text-base text-sm text-muted-foreground"
                                                    style={{
                                                        color: cardstextColor
                                                    }}>{faq.answer}</div>
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
                    <Search style={{
                        color: accentColor
                    }} className="mx-auto mb-2 h-12 w-12 " />
                    <h3 style={{
                        color: accentColor
                    }} className="mb-0 text-lg font-semibold">No results found</h3>
                    <p style={{
                        color: accentColor
                    }} className="text-muted-foreground">Try adjusting your search</p>
                </div>
            )}
        </div>
    )
}
