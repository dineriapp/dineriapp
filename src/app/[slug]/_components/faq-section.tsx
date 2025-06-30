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
}

export function FAQSection({ faqCategories, accentColor = "#0f766e", className = "" }: FAQSectionProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

    const handleFAQClick = async (faqId: string) => {
        // Track FAQ view
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
        try {
            await fetch("/api/faq/track-view", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ faqId }),
            })
        } catch (error) {
            console.error("Error tracking FAQ view:", error)
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
        <div className={`space-y-4 ${className}`}>
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
                        {featuredFAQs.slice(0, 3).map((faq, index) => (
                            <motion.div key={`${faq.id}-${index}`} className="overflow-hidden rounded-lg border">
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
                            {category.faqs.map((faq) => (
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
