"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { motion } from "motion/react"
import { Plus, Grip, Edit, Trash2, HelpCircle, Star, Eye, Search, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { DashboardHeader } from "../../_components/header"

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

// Types
interface FAQ {
    id: string
    question: string
    answer: string
    is_featured: boolean
    view_count: number
    sort_order: number
    created_at: string
    updated_at: string
}

interface FAQCategory {
    id: string
    name: string
    description?: string
    sort_order: number
    faqs: FAQ[]
    created_at: string
    updated_at: string
}

// Common FAQ templates for quick setup
const FAQ_TEMPLATES = [
    {
        category: "Hours & Location",
        description: "Information about our location and operating hours",
        faqs: [
            { question: "What are your opening hours?", answer: "We are open Monday to Sunday from 11:00 AM to 10:00 PM." },
            {
                question: "Where are you located?",
                answer: "You can find our address and directions in the contact section above.",
            },
            { question: "Do you have parking available?", answer: "Yes, we have free parking available for our customers." },
            { question: "Are you wheelchair accessible?", answer: "Yes, our restaurant is fully wheelchair accessible." },
        ],
    },
    {
        category: "Reservations & Booking",
        description: "Everything about making and managing reservations",
        faqs: [
            {
                question: "Do you take reservations?",
                answer: "Yes, we accept reservations. You can book a table using the reservation link above.",
            },
            { question: "How far in advance can I book?", answer: "You can make reservations up to 30 days in advance." },
            {
                question: "What is your cancellation policy?",
                answer: "Please cancel at least 2 hours before your reservation time.",
            },
            {
                question: "Do you have a waiting list?",
                answer: "Yes, if we're fully booked, we can add you to our waiting list.",
            },
        ],
    },
    {
        category: "Menu & Dietary",
        description: "Questions about our menu and dietary accommodations",
        faqs: [
            {
                question: "Do you have vegetarian options?",
                answer: "Yes, we have a variety of vegetarian dishes clearly marked on our menu.",
            },
            {
                question: "Do you offer vegan meals?",
                answer: "Yes, we have several vegan options available. Please ask your server for details.",
            },
            {
                question: "Can you accommodate food allergies?",
                answer: "Yes, please inform us of any allergies when ordering and we'll ensure your meal is prepared safely.",
            },
            {
                question: "Do you have gluten-free options?",
                answer: "Yes, we offer gluten-free alternatives for many of our dishes.",
            },
        ],
    },
    {
        category: "Policies & Services",
        description: "Information about our services and policies",
        faqs: [
            { question: "Do you offer takeaway?", answer: "Yes, all our menu items are available for takeaway." },
            {
                question: "Do you deliver?",
                answer: "Yes, we offer delivery through our delivery partners. Check our delivery section for details.",
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept cash, all major credit cards, and contactless payments.",
            },
            { question: "Do you have WiFi?", answer: "Yes, we offer free WiFi for all our customers." },
        ],
    },
]

// Initial dummy data
const INITIAL_CATEGORIES: FAQCategory[] = [
    {
        id: "1",
        name: "General Information",
        description: "Basic information about our restaurant",
        sort_order: 0,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        faqs: [
            {
                id: "1",
                question: "What type of cuisine do you serve?",
                answer: "We specialize in modern European cuisine with a focus on fresh, locally-sourced ingredients.",
                is_featured: true,
                view_count: 156,
                sort_order: 0,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
            },
            {
                id: "2",
                question: "Do you have outdoor seating?",
                answer: "Yes, we have a beautiful outdoor terrace that is available during good weather conditions.",
                is_featured: false,
                view_count: 89,
                sort_order: 1,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
            },
        ],
    },
    {
        id: "2",
        name: "Reservations",
        description: "Information about booking and reservations",
        sort_order: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        faqs: [
            {
                id: "3",
                question: "How can I make a reservation?",
                answer: "You can make a reservation through our website, by calling us directly, or using our mobile app.",
                is_featured: true,
                view_count: 234,
                sort_order: 0,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
            },
            {
                id: "4",
                question: "Can I modify my reservation?",
                answer: "Yes, you can modify your reservation up to 2 hours before your scheduled time by contacting us.",
                is_featured: false,
                view_count: 67,
                sort_order: 1,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
            },
        ],
    },
]

export default function FAQPage() {
    const [categories, setCategories] = useState<FAQCategory[]>(INITIAL_CATEGORIES)
    const [loading, setLoading] = useState(true)
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
    const [isAddFAQDialogOpen, setIsAddFAQDialogOpen] = useState(false)
    const [isEditFAQDialogOpen, setIsEditFAQDialogOpen] = useState(false)
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null)
    const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryDescription, setNewCategoryDescription] = useState("")
    const [newFAQQuestion, setNewFAQQuestion] = useState("")
    const [newFAQAnswer, setNewFAQAnswer] = useState("")
    const [isFeatured, setIsFeatured] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])

    // Helper function to generate unique IDs
    const generateId = () => Date.now().toString()

    // Memoized filtered categories for better performance
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories

        return categories.filter((category) => {
            const categoryMatch =
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase())

            const faqMatch = category.faqs?.some(
                (faq) =>
                    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
            )

            return categoryMatch || faqMatch
        })
    }, [categories, searchTerm])

    // Memoized statistics for better performance
    const statistics = useMemo(() => {
        const totalFAQs = categories.reduce((total, cat) => total + (cat.faqs?.length || 0), 0)
        const featuredFAQs = categories.reduce(
            (total, cat) => total + (cat.faqs?.filter((faq) => faq.is_featured).length || 0),
            0,
        )

        return {
            totalCategories: categories.length,
            totalFAQs,
            featuredFAQs,
        }
    }, [categories])

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            const nextOrder = categories.length > 0 ? Math.max(...categories.map((cat) => cat.sort_order)) + 1 : 0

            const newCategory: FAQCategory = {
                id: generateId(),
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || undefined,
                sort_order: nextOrder,
                faqs: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            setCategories([...categories, newCategory])
            setNewCategoryName("")
            setNewCategoryDescription("")
            setIsAddCategoryDialogOpen(false)

            toast.success("Category added successfully")
        } catch {
            toast.error("Failed to add category")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategory || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            setCategories(
                categories.map((cat) =>
                    cat.id === selectedCategory.id
                        ? {
                            ...cat,
                            name: newCategoryName.trim(),
                            description: newCategoryDescription.trim() || undefined,
                            updated_at: new Date().toISOString(),
                        }
                        : cat,
                ),
            )

            setIsEditCategoryDialogOpen(false)
            setSelectedCategory(null)
            setNewCategoryName("")
            setNewCategoryDescription("")

            toast.success("Category updated successfully")
        } catch {
            toast.error("Failed to update category")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 300))

            const categoryToDelete = categories.find((cat) => cat.id === categoryId)
            const faqCount = categoryToDelete?.faqs?.length || 0

            setCategories(categories.filter((cat) => cat.id !== categoryId))

            toast.success(`Category deleted successfully${faqCount > 0 ? ` (${faqCount} FAQs removed)` : ""}`)
        } catch {
            toast.error("Failed to delete category")
        }
    }

    const handleAddFAQ = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategory || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            const faqs = selectedCategory.faqs || []
            const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((faq) => faq.sort_order)) + 1 : 0

            const newFAQ: FAQ = {
                id: generateId(),
                question: newFAQQuestion.trim(),
                answer: newFAQAnswer.trim(),
                is_featured: isFeatured,
                view_count: 0,
                sort_order: nextOrder,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            setCategories(
                categories.map((cat) =>
                    cat.id === selectedCategory.id
                        ? {
                            ...cat,
                            faqs: [...(cat.faqs || []), newFAQ],
                            updated_at: new Date().toISOString(),
                        }
                        : cat,
                ),
            )

            setNewFAQQuestion("")
            setNewFAQAnswer("")
            setIsFeatured(false)
            setIsAddFAQDialogOpen(false)

            toast.success("FAQ added successfully")
        } catch {
            toast.error("Failed to add FAQ")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditFAQ = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFAQ || !selectedCategory || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            setCategories(
                categories.map((cat) =>
                    cat.id === selectedCategory.id
                        ? {
                            ...cat,
                            faqs: (cat.faqs || []).map((faq) =>
                                faq.id === selectedFAQ.id
                                    ? {
                                        ...faq,
                                        question: newFAQQuestion.trim(),
                                        answer: newFAQAnswer.trim(),
                                        is_featured: isFeatured,
                                        updated_at: new Date().toISOString(),
                                    }
                                    : faq,
                            ),
                            updated_at: new Date().toISOString(),
                        }
                        : cat,
                ),
            )

            setIsEditFAQDialogOpen(false)
            setSelectedFAQ(null)
            setSelectedCategory(null)
            setNewFAQQuestion("")
            setNewFAQAnswer("")
            setIsFeatured(false)

            toast.success("FAQ updated successfully")
        } catch {
            toast.error("Failed to update FAQ")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteFAQ = async (categoryId: string, faqId: string) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 300))

            setCategories(
                categories.map((cat) =>
                    cat.id === categoryId
                        ? {
                            ...cat,
                            faqs: (cat.faqs || []).filter((faq) => faq.id !== faqId),
                            updated_at: new Date().toISOString(),
                        }
                        : cat,
                ),
            )

            toast.success("FAQ deleted successfully")
        } catch {
            toast.error("Failed to delete FAQ")
        }
    }

    const handleAddFromTemplate = async (templateCategory: any) => {
        if (isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 800))

            const nextCategoryOrder = categories.length > 0 ? Math.max(...categories.map((cat) => cat.sort_order)) + 1 : 0

            const categoryId = generateId()
            const now = new Date().toISOString()

            const newFAQs: FAQ[] = templateCategory.faqs.map((faq: { question: string, answer: string }, index: number) => ({
                id: generateId(),
                question: faq.question,
                answer: faq.answer,
                is_featured: index === 0, // Make first FAQ featured
                view_count: Math.floor(Math.random() * 50), // Random view count for demo
                sort_order: index,
                created_at: now,
                updated_at: now,
            }))

            const newCategory: FAQCategory = {
                id: categoryId,
                name: templateCategory.category,
                description:
                    templateCategory.description || `Common questions about ${templateCategory.category.toLowerCase()}`,
                sort_order: nextCategoryOrder,
                faqs: newFAQs,
                created_at: now,
                updated_at: now,
            }

            setCategories([...categories, newCategory])
            setIsTemplateDialogOpen(false)

            toast.success(`Added ${templateCategory.category} with ${templateCategory.faqs.length} FAQs`)
        } catch {
            toast.error("Failed to add template")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setNewCategoryName("")
        setNewCategoryDescription("")
        setNewFAQQuestion("")
        setNewFAQAnswer("")
        setIsFeatured(false)
        setSelectedCategory(null)
        setSelectedFAQ(null)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <DashboardHeader />
                <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                    <div className="flex items-center space-x-2 text-slate-500">
                        <svg
                            className="animate-spin h-5 w-5 text-teal-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <span>Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <DashboardHeader />

            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                            FAQ Management
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Create and manage frequently asked questions for your customers
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="lg" className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Quick Setup
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="flex max-h-[85vh] w-full 800:min-w-[700px] max-w-4xl flex-col overflow-hidden">
                                <DialogHeader className="flex-shrink-0">
                                    <DialogTitle>Quick FAQ Setup</DialogTitle>
                                    <DialogDescription>
                                        Choose from common restaurant FAQ templates to get started quickly
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex-1 overflow-y-auto py-4">
                                    <div className="grid gap-4 pr-2 md:grid-cols-2">
                                        {FAQ_TEMPLATES.map((template, index) => (
                                            <Card
                                                key={index}
                                                className="h-fit cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                                            >
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-lg">{template.category}</CardTitle>
                                                    <CardDescription>{template.faqs.length} common questions</CardDescription>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="mb-4 space-y-2">
                                                        {template.faqs.slice(0, 2).map((faq, faqIndex) => (
                                                            <p key={faqIndex} className="text-sm text-muted-foreground">
                                                                • {faq.question}
                                                            </p>
                                                        ))}
                                                        {template.faqs.length > 2 && (
                                                            <p className="text-sm text-muted-foreground">
                                                                + {template.faqs.length - 2} more questions
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        onClick={() => handleAddFromTemplate(template)}
                                                        className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? "Adding..." : "Add This Category"}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105 hover:from-teal-700 hover:to-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleAddCategory}>
                                    <DialogHeader>
                                        <DialogTitle>Add FAQ Category</DialogTitle>
                                        <DialogDescription>Create a new category to organize your FAQs</DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="categoryName">Category Name</Label>
                                            <Input
                                                id="categoryName"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                placeholder="e.g. Reservations"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="categoryDescription">Description (Optional)</Label>
                                            <Textarea
                                                id="categoryDescription"
                                                value={newCategoryDescription}
                                                onChange={(e) => setNewCategoryDescription(e.target.value)}
                                                placeholder="Brief description of this category"
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsAddCategoryDialogOpen(false)
                                                resetForm()
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!newCategoryName || isSubmitting}
                                            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                        >
                                            {isSubmitting ? "Adding..." : "Add Category"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={container} initial="hidden" animate="show" className="mb-8 grid gap-6 md:grid-cols-3">
                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br from-teal-50 to-white transition-all hover:shadow-lg hover:scale-[1.02]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
                                <HelpCircle className="h-4 w-4 text-teal-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-teal-700">{statistics.totalCategories}</div>
                                <p className="mt-1 text-xs text-muted-foreground">FAQ categories</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br from-blue-50 to-white transition-all hover:shadow-lg hover:scale-[1.02]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total FAQs</CardTitle>
                                <Eye className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-700">{statistics.totalFAQs}</div>
                                <p className="mt-1 text-xs text-muted-foreground">Questions answered</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br from-purple-50 to-white transition-all hover:shadow-lg hover:scale-[1.02]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Featured FAQs</CardTitle>
                                <Star className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-700">{statistics.featuredFAQs}</div>
                                <p className="mt-1 text-xs text-muted-foreground">Popular questions</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search FAQs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 transition-all focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </motion.div>

                {/* FAQ Categories */}
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <motion.div key={category.id} variants={item} className="space-y-4">
                                <Card className="bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <HelpCircle className="h-5 w-5 text-teal-600" />
                                                {category.name}
                                                <span className="ml-2 rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
                                                    {category.faqs?.length || 0} FAQs
                                                </span>
                                            </CardTitle>
                                            {category.description && <CardDescription>{category.description}</CardDescription>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCategory(category)
                                                    setNewCategoryName(category.name)
                                                    setNewCategoryDescription(category.description || "")
                                                    setIsEditCategoryDialogOpen(true)
                                                }}
                                                className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit category</span>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-destructive transition-transform hover:scale-110"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete category</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the category &quot;{category.name}&quot; and all its FAQs (
                                                            {category.faqs?.length || 0} questions). This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete Category
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            <Dialog open={isAddFAQDialogOpen} onOpenChange={setIsAddFAQDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-center transition-all hover:scale-[1.02] hover:bg-teal-50"
                                                        onClick={() => setSelectedCategory(category)}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add FAQ
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <form onSubmit={handleAddFAQ}>
                                                        <DialogHeader>
                                                            <DialogTitle>Add FAQ</DialogTitle>
                                                            <DialogDescription>Add a new question and answer to {category.name}</DialogDescription>
                                                        </DialogHeader>

                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="faqQuestion">Question</Label>
                                                                <Input
                                                                    id="faqQuestion"
                                                                    value={newFAQQuestion}
                                                                    onChange={(e) => setNewFAQQuestion(e.target.value)}
                                                                    placeholder="e.g. Do you take reservations?"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="faqAnswer">Answer</Label>
                                                                <Textarea
                                                                    id="faqAnswer"
                                                                    value={newFAQAnswer}
                                                                    onChange={(e) => setNewFAQAnswer(e.target.value)}
                                                                    placeholder="Provide a clear and helpful answer"
                                                                    rows={4}
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                                                                <Label htmlFor="featured" className="flex items-center gap-2">
                                                                    <Star className="h-4 w-4" />
                                                                    Mark as featured (show prominently)
                                                                </Label>
                                                            </div>
                                                        </div>

                                                        <DialogFooter>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setIsAddFAQDialogOpen(false)
                                                                    resetForm()
                                                                }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                disabled={!newFAQQuestion || !newFAQAnswer || isSubmitting}
                                                                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                                                            >
                                                                {isSubmitting ? "Adding..." : "Add FAQ"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>

                                            {category.faqs && category.faqs.length > 0 ? (
                                                <div className="space-y-3">
                                                    {category.faqs.map((faq) => (
                                                        <div
                                                            key={faq.id}
                                                            className="flex items-start gap-3 rounded-lg border bg-white/90 p-4 backdrop-blur-sm transition-all hover:shadow-md hover:scale-[1.01]"
                                                        >
                                                            <div className="mt-1 flex-shrink-0 cursor-move">
                                                                <Grip className="h-4 w-4 text-muted-foreground" />
                                                            </div>

                                                            <div className="min-w-0 flex-grow">
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <h4 className="text-sm font-medium">{faq.question}</h4>
                                                                    {faq.is_featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                                                                </div>
                                                                <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                                                                {faq.view_count > 0 && (
                                                                    <div className="mt-2 flex items-center gap-1">
                                                                        <Eye className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="text-xs text-muted-foreground">{faq.view_count} views</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-shrink-0 items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedCategory(category)
                                                                        setSelectedFAQ(faq)
                                                                        setNewFAQQuestion(faq.question)
                                                                        setNewFAQAnswer(faq.answer)
                                                                        setIsFeatured(faq.is_featured)
                                                                        setIsEditFAQDialogOpen(true)
                                                                    }}
                                                                    className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="sr-only">Edit FAQ</span>
                                                                </Button>

                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-destructive transition-transform hover:scale-110"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            <span className="sr-only">Delete FAQ</span>
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This will permanently delete the FAQ &quot;{faq.question}&quot;. This action cannot be
                                                                                undone.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDeleteFAQ(category.id, faq.id)}
                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            >
                                                                                Delete FAQ
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center">
                                                    <HelpCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                    <p className="text-muted-foreground">No FAQs in this category yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : categories.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
                            <HelpCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold">No FAQs yet</h3>
                            <p className="mb-6 text-muted-foreground">
                                Get started by adding FAQ categories or using our quick setup templates
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button
                                    onClick={() => setIsTemplateDialogOpen(true)}
                                    variant="outline"
                                    size="lg"
                                    className="flex items-center gap-2"
                                >
                                    <Lightbulb className="h-4 w-4" />
                                    Quick Setup
                                </Button>
                                <Button
                                    onClick={() => setIsAddCategoryDialogOpen(true)}
                                    size="lg"
                                    className="bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105 hover:from-teal-700 hover:to-blue-700"
                                >
                                    Add your first category
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                            <Search className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold">No results found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search terms or{" "}
                                <button onClick={() => setSearchTerm("")} className="text-teal-600 hover:underline">
                                    clear the search
                                </button>
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            {/* Edit Category Dialog */}
            <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleEditCategory}>
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>Update the category details</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="editCategoryName">Category Name</Label>
                                <Input
                                    id="editCategoryName"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editCategoryDescription">Description (Optional)</Label>
                                <Textarea
                                    id="editCategoryDescription"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditCategoryDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newCategoryName || isSubmitting}
                                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit FAQ Dialog */}
            <Dialog open={isEditFAQDialogOpen} onOpenChange={setIsEditFAQDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <form onSubmit={handleEditFAQ}>
                        <DialogHeader>
                            <DialogTitle>Edit FAQ</DialogTitle>
                            <DialogDescription>Update the FAQ details</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="editFAQQuestion">Question</Label>
                                <Input
                                    id="editFAQQuestion"
                                    value={newFAQQuestion}
                                    onChange={(e) => setNewFAQQuestion(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editFAQAnswer">Answer</Label>
                                <Textarea
                                    id="editFAQAnswer"
                                    value={newFAQAnswer}
                                    onChange={(e) => setNewFAQAnswer(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="editFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                                <Label htmlFor="editFeatured" className="flex items-center gap-2">
                                    <Star className="h-4 w-4" />
                                    Mark as featured (show prominently)
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditFAQDialogOpen(false)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newFAQQuestion || !newFAQAnswer || isSubmitting}
                                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
