"use client"

import type { Faq, FaqCategory, SubscriptionPlan } from "@prisma/client"
import type React from "react"

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
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    useCreateFaq,
    useCreateFaqCategory,
    useDeleteFaq,
    useDeleteFaqCategory,
    useFaqCategories,
    useReorderFaq,
    useReorderFaqCategory,
    useUpdateFaq,
    useUpdateFaqCategory,
} from "@/lib/faq-queries"
import { isLimitReached, STRIPE_PLANS } from "@/lib/stripe-plans"
import { useUserStore } from "@/stores/auth-store"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store"
import { ArrowDown, ArrowUp, Edit, Eye, HelpCircle, Lightbulb, Plus, Search, Star, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useMemo, useState } from "react"

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
        ],
    },
]

export default function FAQPage() {
    const { restaurants, selectedRestaurant } = useRestaurantStore()
    const { prismaUser } = useUserStore()
    const openPopup = useUpgradePopupStore(state => state.open)
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
    const [isAddFAQDialogOpen, setIsAddFAQDialogOpen] = useState(false)
    const [isEditFAQDialogOpen, setIsEditFAQDialogOpen] = useState(false)
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(null)
    const [selectedFAQ, setSelectedFAQ] = useState<Faq | null>(null)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryDescription, setNewCategoryDescription] = useState("")
    const [newFAQQuestion, setNewFAQQuestion] = useState("")
    const [newFAQAnswer, setNewFAQAnswer] = useState("")
    const [isFeatured, setIsFeatured] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const restaurantId = selectedRestaurant?.id

    const { data: categories = [], isLoading, error } = useFaqCategories(restaurantId)
    const createCategoryMutation = useCreateFaqCategory(restaurantId)
    const updateCategoryMutation = useUpdateFaqCategory(restaurantId)
    const deleteCategoryMutation = useDeleteFaqCategory(restaurantId)
    const reorderCategoryMutation = useReorderFaqCategory(restaurantId)
    const createFaqMutation = useCreateFaq(restaurantId)
    const updateFaqMutation = useUpdateFaq(restaurantId)
    const deleteFaqMutation = useDeleteFaq(restaurantId)
    const reorderFaqMutation = useReorderFaq(restaurantId)

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

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim() || !restaurantId) return

        createCategoryMutation.mutate(
            {
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setNewCategoryName("")
                    setNewCategoryDescription("")
                    setIsAddCategoryDialogOpen(false)
                },
            },
        )
    }

    const handleEditCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategory || !newCategoryName.trim()) return

        updateCategoryMutation.mutate(
            {
                id: selectedCategory.id,
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setIsEditCategoryDialogOpen(false)
                    setSelectedCategory(null)
                    setNewCategoryName("")
                    setNewCategoryDescription("")
                },
            },
        )
    }

    const handleAddFAQ = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategory || !newFAQQuestion.trim() || !newFAQAnswer.trim()) return

        createFaqMutation.mutate(
            {
                category_id: selectedCategory.id,
                question: newFAQQuestion.trim(),
                answer: newFAQAnswer.trim(),
                is_featured: isFeatured,
            },
            {
                onSuccess: () => {
                    resetForm()
                    setIsAddFAQDialogOpen(false)
                },
            },
        )
    }

    const handleEditFAQ = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFAQ || !newFAQQuestion.trim() || !newFAQAnswer.trim()) return

        updateFaqMutation.mutate(
            {
                id: selectedFAQ.id,
                question: newFAQQuestion.trim(),
                answer: newFAQAnswer.trim(),
                is_featured: isFeatured,
            },
            {
                onSuccess: () => {
                    setIsEditFAQDialogOpen(false)
                    setSelectedFAQ(null)
                    setSelectedCategory(null)
                    resetForm()
                },
            },
        )
    }

    const handleAddFromTemplate = async (templateCategory: any) => {
        if (!restaurantId) return

        try {

            // First create the category
            const categoryResult = await createCategoryMutation.mutateAsync({
                name: templateCategory.category,
                description: templateCategory.description,
            })

            // Then add all FAQs to the category
            for (const [index, faq] of templateCategory.faqs.entries()) {
                await createFaqMutation.mutateAsync({
                    category_id: categoryResult.id,
                    question: faq.question,
                    answer: faq.answer,
                    is_featured: index === 0, // Make first FAQ featured
                })
            }

            setIsTemplateDialogOpen(false)
        } catch {
            // Error handling is done in the mutations
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


    // Show loading state when FAQs are being fetched
    if (isLoading || !selectedRestaurant || !restaurants) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="flex items-center space-x-2 text-slate-500">
                    <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full" />
                    <span>Loading FAQs...</span>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading FAQs</h2>
                    <p className="text-slate-500">Failed to load FAQs for {selectedRestaurant.name}.</p>
                    <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }


    const isFaqCategoryLimitReached = isLimitReached({
        userPlan: prismaUser?.subscription_plan as SubscriptionPlan,
        resourceType: "faq_categories",
        currentCount: categories.length,
    });



    return (
        <>
            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <h1 className=" text-4xl font-bold text-main-blue">
                            FAQ Management
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Create and manage frequently asked questions for{" "}
                            <span className="font-medium text-slate-700">{selectedRestaurant.name}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {
                            isFaqCategoryLimitReached ?
                                <>
                                    <Button
                                        onClick={() => {
                                            const plan = prismaUser?.subscription_plan ?? "basic";
                                            const limit = STRIPE_PLANS[plan].limits?.faqCategories;
                                            const planName = STRIPE_PLANS[plan].name;

                                            if (limit !== undefined && categories.length >= limit) {
                                                openPopup(`You are limited to ${limit} FAQ categories on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`);
                                            } else {
                                            }
                                        }}
                                        variant="outline" size="lg"
                                        className="flex items-center gap-2 text-main-blue hover:text-main-blue border-[1px] border-main-blue cursor-pointer hover:opacity-75 !bg-transparent rounded-full !px-5 font-poppins h-[42px]"
                                    >
                                        <Lightbulb className="h-4 w-4" />
                                        Quick Setup
                                    </Button>
                                </>
                                :
                                <>
                                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="lg"
                                                className="flex items-center gap-2 text-main-blue hover:text-main-blue border-[1px] border-main-blue cursor-pointer hover:opacity-75 !bg-transparent rounded-full !px-5 font-poppins h-[42px]"
                                            >
                                                <Lightbulb className="h-4 w-4" />
                                                Quick Setup
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden">
                                            <DialogHeader className="flex-shrink-0">
                                                <DialogTitle>Quick FAQ Setup</DialogTitle>
                                                <DialogDescription>
                                                    Choose from common restaurant FAQ templates to get started quickly
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="flex-1 overflow-y-auto py-4">
                                                <div className="grid gap-4 pr-2 md:grid-cols-1">
                                                    {FAQ_TEMPLATES.map((template, index) => (
                                                        <Card
                                                            key={index}
                                                            className="cursor-pointer full py-4 h-full gap-1 transition-all hover:shadow-lg"
                                                        >
                                                            <CardHeader className="pb-3 gap-2 px-4">
                                                                <CardTitle className="text-lg leading-[1.3]">{template.category}</CardTitle>
                                                                <CardDescription>{template.faqs.length} common questions</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="pt-0 flex px-4 flex-col h-full items-start justify-between">
                                                                <div className="mb-4 space-y-1 pl-4">
                                                                    <ul className="list-disc">
                                                                        {template.faqs.slice(0, 2).map((faq, faqIndex) => (
                                                                            <li key={faqIndex} className="text-sm text-slate-500">
                                                                                {faq.question}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    {template.faqs.length > 2 && (
                                                                        <p className="text-sm text-slate-500">+ {template.faqs.length - 2} more questions</p>
                                                                    )}
                                                                </div>
                                                                <div className="w-full">

                                                                    <Button
                                                                        onClick={() => handleAddFromTemplate(template)}
                                                                        className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]" disabled={createCategoryMutation.isPending || createFaqMutation.isPending}
                                                                    >
                                                                        {createCategoryMutation.isPending || createFaqMutation.isPending
                                                                            ? "Adding..."
                                                                            : "Add This Category"}
                                                                    </Button>
                                                                </div>

                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </>
                        }

                        {
                            isFaqCategoryLimitReached ?
                                <>
                                    <Button
                                        size="lg"
                                        disabled={!restaurantId}
                                        onClick={() => {
                                            const plan = prismaUser?.subscription_plan ?? "basic";
                                            const limit = STRIPE_PLANS[plan].limits?.faqCategories;
                                            const planName = STRIPE_PLANS[plan].name;

                                            if (limit !== undefined && categories.length >= limit) {
                                                openPopup(`You are limited to ${limit} FAQ categories on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`);
                                            } else {
                                            }
                                        }}
                                        className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Category
                                    </Button>
                                </>
                                :
                                <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="lg"
                                            disabled={!restaurantId}
                                            className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
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
                                                    disabled={createCategoryMutation.isPending}
                                                    className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={!newCategoryName || createCategoryMutation.isPending || !restaurantId}
                                                    className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                                                >
                                                    {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                        }

                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={container} initial="hidden" animate="show" className="mb-8 grid gap-6 md:grid-cols-3">
                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br box-shad-every-2 from-white to-white transition-all hover:shadow-lg hover:scale-[1.02]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Total Categories</CardTitle>
                                <HelpCircle className="h-4 w-4 text-teal-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-teal-700">{statistics.totalCategories}</div>
                                <p className="mt-1 text-xs text-slate-500">FAQ categories</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br box-shad-every-2 from-white to-white transition-all hover:shadow-lg hover:scale-[1.02]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Total FAQs</CardTitle>
                                <Eye className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-700">{statistics.totalFAQs}</div>
                                <p className="mt-1 text-xs text-slate-500">Questions answered</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-gradient-to-br box-shad-every-2 from-white to-white transition-all hover:shadow-lg hover:scale-[1.02]">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">Featured FAQs</CardTitle>
                                <Star className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-700">{statistics.featuredFAQs}</div>
                                <p className="mt-1 text-xs text-slate-500">Popular questions</p>
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
                    <div className="relative bg-white rounded-full">
                        <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search FAQs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 transition-all rounded-full focus:ring-2 font-poppins h-[50px] focus:ring-teal-500"
                        />
                    </div>
                </motion.div>

                {/* FAQ Categories */}
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, categoryIndex) => {
                            const plan = prismaUser?.subscription_plan ?? "basic";
                            const planName = STRIPE_PLANS[plan].name;
                            const faqLimit = STRIPE_PLANS[plan].limits?.faqsPerCategory ?? Infinity;
                            const isLimited = (category.faqs?.length ?? 0) >= faqLimit;

                            return <motion.div key={category.id} variants={item} className="space-y-4">
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
                                                className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Edit category</span>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                        disabled={deleteCategoryMutation.isPending}
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
                                                        <AlertDialogCancel className="font-poppins rounded-full !px-5">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                                                            className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => reorderCategoryMutation.mutate({ categoryId: category.id, direction: "up" })}
                                                disabled={categoryIndex === 0 || reorderCategoryMutation.isPending}
                                                className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                                <span className="sr-only">Move up</span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => reorderCategoryMutation.mutate({ categoryId: category.id, direction: "down" })}
                                                disabled={categoryIndex === filteredCategories.length - 1 || reorderCategoryMutation.isPending}
                                                className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"                                             >
                                                <ArrowDown className="h-4 w-4" />
                                                <span className="sr-only">Move down</span>
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-4">
                                            {isLimited
                                                ?
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-center transition-all rounded-full border-main-blue font-poppins h-[40px] hover:text-white hover:bg-main-blue cursor-pointer bg-transparent"
                                                        onClick={() =>
                                                            openPopup(
                                                                `You are limited to ${faqLimit} FAQs per category on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`
                                                            )
                                                        }                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add FAQ to {category.name}
                                                    </Button>
                                                </>
                                                :
                                                <>
                                                    <Dialog open={isAddFAQDialogOpen} onOpenChange={setIsAddFAQDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-center transition-all rounded-full border-main-blue font-poppins h-[40px] hover:text-white hover:bg-main-blue cursor-pointer bg-transparent"
                                                                onClick={() => setSelectedCategory(category)}
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Add FAQ to {category.name}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl">
                                                            <form onSubmit={handleAddFAQ}>
                                                                <DialogHeader>
                                                                    <DialogTitle>Add FAQ</DialogTitle>
                                                                    <DialogDescription>
                                                                        Add a new question and answer to {selectedCategory?.name}
                                                                    </DialogDescription>
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
                                                                        className="hover:opacity-75  cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                                                                        disabled={createFaqMutation.isPending}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        type="submit"
                                                                        disabled={
                                                                            !newFAQQuestion || !newFAQAnswer || createFaqMutation.isPending || !selectedCategory
                                                                        }
                                                                        className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                                                                    >
                                                                        {createFaqMutation.isPending ? "Adding..." : "Add FAQ"}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </>
                                            }


                                            {category.faqs && category.faqs.length > 0 ? (
                                                <div className="space-y-3">
                                                    {category.faqs.map((faq, faqIndex) => (
                                                        <div
                                                            key={faq.id}
                                                            className="flex items-start gap-3 rounded-lg border bg-white/90 p-4 backdrop-blur-sm transition-all hover:shadow-md hover:scale-[1.01]"
                                                        >
                                                            {/* <div className="mt-1 flex-shrink-0 cursor-move">
                                                                <Grip className="h-4 w-4 text-slate-400" />
                                                            </div> */}

                                                            <div className="min-w-0 flex-grow">
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <h4 className="text-sm font-medium">{faq.question}</h4>
                                                                    {faq.is_featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                                                                </div>
                                                                <p className="text-sm leading-relaxed text-slate-500">{faq.answer}</p>
                                                                {faq?.view_count && faq?.view_count > 0 ? (
                                                                    <div className="mt-2 flex items-center gap-1">
                                                                        <Eye className="h-3 w-3 text-slate-400" />
                                                                        <span className="text-xs text-slate-400">{faq?.view_count} views</span>
                                                                    </div>
                                                                ) : <></>}
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
                                                                    className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="sr-only">Edit FAQ</span>
                                                                </Button>

                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                                            disabled={deleteFaqMutation.isPending}
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
                                                                            <AlertDialogCancel
                                                                                className="font-poppins rounded-full !px-5"
                                                                            >Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => deleteFaqMutation.mutate(faq.id)}
                                                                                className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => reorderFaqMutation.mutate({ faqId: faq.id, direction: "up" })}
                                                                    disabled={faqIndex === 0 || reorderFaqMutation.isPending}
                                                                    className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                                >
                                                                    <ArrowUp className="h-4 w-4" />
                                                                    <span className="sr-only">Move up</span>
                                                                </Button>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => reorderFaqMutation.mutate({ faqId: faq.id, direction: "down" })}
                                                                    disabled={
                                                                        faqIndex === (category.faqs?.length || 0) - 1 || reorderFaqMutation.isPending
                                                                    }
                                                                    className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                                >
                                                                    <ArrowDown className="h-4 w-4" />
                                                                    <span className="sr-only">Move down</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center">
                                                    <HelpCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                                    <p className="text-slate-500 mb-4">No FAQs in this category yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        })
                    ) : categories.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
                            <HelpCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold">No FAQs yet</h3>
                            <p className="mb-6 text-slate-500">
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
                                    disabled={!restaurantId}
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
                            <p className="text-slate-500">
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
                                disabled={updateCategoryMutation.isPending}
                                className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newCategoryName || updateCategoryMutation.isPending}
                                className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                            >
                                {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
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
                                className="hover:opacity-75  cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                                disabled={updateFaqMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newFAQQuestion || !newFAQAnswer || updateFaqMutation.isPending}
                                className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                            >
                                {updateFaqMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
