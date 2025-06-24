"use client"

import type React from "react"

import { DashboardHeader } from "@/app/(dashboard)/_components/header"
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, ArrowDown, ArrowUp, Edit, Grip, Leaf, Plus, Search, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Types
interface MenuItem {
    id: string
    name: string
    description?: string
    price: number
    sort_order: number
    allergens?: string[]
    is_halal?: boolean
    allergen_info?: string
    category_id: string
}

interface MenuCategory {
    id: string
    name: string
    description?: string
    sort_order: number
    menu_items?: MenuItem[]
}

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

// Dummy data
const initialCategories: MenuCategory[] = [
    {
        id: "1",
        name: "Appetizers",
        description: "Start your meal with our delicious appetizers",
        sort_order: 0,
        menu_items: [
            {
                id: "1",
                name: "Bruschetta",
                description: "Toasted bread with fresh tomatoes, basil, and garlic",
                price: 8.5,
                sort_order: 0,
                allergens: ["gluten"],
                is_halal: true,
                category_id: "1",
            },
            {
                id: "2",
                name: "Calamari Rings",
                description: "Crispy fried squid rings with marinara sauce",
                price: 12.0,
                sort_order: 1,
                allergens: ["shellfish", "gluten"],
                category_id: "1",
            },
        ],
    },
    {
        id: "2",
        name: "Main Courses",
        description: "Our signature main dishes",
        sort_order: 1,
        menu_items: [
            {
                id: "3",
                name: "Grilled Salmon",
                description: "Fresh Atlantic salmon with lemon herb butter",
                price: 24.0,
                sort_order: 0,
                allergens: ["fish"],
                category_id: "2",
            },
            {
                id: "4",
                name: "Chicken Tikka Masala",
                description: "Tender chicken in creamy tomato curry sauce",
                price: 18.5,
                sort_order: 1,
                allergens: ["dairy"],
                is_halal: true,
                category_id: "2",
            },
        ],
    },
    {
        id: "3",
        name: "Desserts",
        description: "Sweet endings to your meal",
        sort_order: 2,
        menu_items: [
            {
                id: "5",
                name: "Tiramisu",
                description: "Classic Italian dessert with coffee and mascarpone",
                price: 7.5,
                sort_order: 0,
                allergens: ["dairy", "eggs"],
                category_id: "3",
            },
        ],
    },
]

export default function MenuPage() {
    const [categories, setCategories] = useState<MenuCategory[]>(initialCategories)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
    const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null)
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryDescription, setNewCategoryDescription] = useState("")
    const [newItemName, setNewItemName] = useState("")
    const [newItemDescription, setNewItemDescription] = useState("")
    const [newItemPrice, setNewItemPrice] = useState("")
    const [allergens, setAllergens] = useState<string[]>([])
    const [isHalal, setIsHalal] = useState(false)
    const [allergenInfo, setAllergenInfo] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Simulate loading data
        const timer = setTimeout(() => {
            setLoading(false)
        }, 800)

        return () => clearTimeout(timer)
    }, [])
    // Filter categories and items based on search term
    const filteredCategories = categories
        .map((category) => ({
            ...category,
            menu_items: category.menu_items?.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        }))
        .filter(
            (category) =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (category.menu_items && category.menu_items.length > 0),
        )

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            const nextOrder = categories.length > 0 ? Math.max(...categories.map((cat) => cat.sort_order)) + 1 : 0

            const newCategory: MenuCategory = {
                id: Date.now().toString(),
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim(),
                sort_order: nextOrder,
                menu_items: [],
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
                            description: newCategoryDescription.trim(),
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

            setCategories(categories.filter((cat) => cat.id !== categoryId))
            toast.success("Category deleted successfully")
        } catch {
            toast.error("Failed to delete category")
        }
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategory || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            const items = selectedCategory.menu_items || []
            const nextOrder = items.length > 0 ? Math.max(...items.map((item) => item.sort_order)) + 1 : 0

            const newItem: MenuItem = {
                id: Date.now().toString(),
                category_id: selectedCategory.id,
                name: newItemName.trim(),
                description: newItemDescription.trim(),
                price: Number.parseFloat(newItemPrice),
                sort_order: nextOrder,
                allergens: allergens,
                is_halal: isHalal,
                allergen_info: allergenInfo.trim(),
            }

            setCategories(
                categories.map((cat) =>
                    cat.id === selectedCategory.id
                        ? {
                            ...cat,
                            menu_items: [...(cat.menu_items || []), newItem],
                        }
                        : cat,
                ),
            )

            // Reset form
            setNewItemName("")
            setNewItemDescription("")
            setNewItemPrice("")
            setAllergens([])
            setIsHalal(false)
            setAllergenInfo("")
            setIsAddItemDialogOpen(false)

            toast.success("Menu item added successfully")
        } catch {
            toast.error("Failed to add menu item")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedItem || !selectedCategory || isSubmitting) return

        try {
            setIsSubmitting(true)

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            setCategories(
                categories.map((cat) =>
                    cat.id === selectedCategory.id
                        ? {
                            ...cat,
                            menu_items: (cat.menu_items || []).map((item) =>
                                item.id === selectedItem.id
                                    ? {
                                        ...item,
                                        name: newItemName.trim(),
                                        description: newItemDescription.trim(),
                                        price: Number.parseFloat(newItemPrice),
                                        allergens: allergens,
                                        is_halal: isHalal,
                                        allergen_info: allergenInfo.trim(),
                                    }
                                    : item,
                            ),
                        }
                        : cat,
                ),
            )

            // Reset form
            setIsEditItemDialogOpen(false)
            setSelectedItem(null)
            setNewItemName("")
            setNewItemDescription("")
            setNewItemPrice("")
            setAllergens([])
            setIsHalal(false)
            setAllergenInfo("")

            toast.success("Menu item updated successfully")
        } catch {
            toast.error("Failed to update menu item")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteItem = async (categoryId: string, itemId: string) => {
        try {
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 300))

            setCategories(
                categories.map((cat) =>
                    cat.id === categoryId
                        ? {
                            ...cat,
                            menu_items: (cat.menu_items || []).filter((item) => item.id !== itemId),
                        }
                        : cat,
                ),
            )

            toast.success("Menu item deleted successfully")
        } catch {
            toast.error("Failed to delete menu item")
        }
    }

    const moveCategoryUp = (categoryId: string) => {
        const currentIndex = categories.findIndex((cat) => cat.id === categoryId)
        if (currentIndex <= 0) return

        const newCategories = [...categories]
            ;[newCategories[currentIndex], newCategories[currentIndex - 1]] = [
                newCategories[currentIndex - 1],
                newCategories[currentIndex],
            ]

        // Update sort orders
        newCategories.forEach((cat, index) => {
            cat.sort_order = index
        })

        setCategories(newCategories)
        toast.success("Category moved up")
    }

    const moveCategoryDown = (categoryId: string) => {
        const currentIndex = categories.findIndex((cat) => cat.id === categoryId)
        if (currentIndex === -1 || currentIndex === categories.length - 1) return

        const newCategories = [...categories]
            ;[newCategories[currentIndex], newCategories[currentIndex + 1]] = [
                newCategories[currentIndex + 1],
                newCategories[currentIndex],
            ]

        // Update sort orders
        newCategories.forEach((cat, index) => {
            cat.sort_order = index
        })

        setCategories(newCategories)
        toast.success("Category moved down")
    }

    const moveItemUp = (categoryId: string, itemId: string) => {
        const category = categories.find((cat) => cat.id === categoryId)
        if (!category || !category.menu_items) return

        const currentIndex = category.menu_items.findIndex((item) => item.id === itemId)
        if (currentIndex <= 0) return

        const newItems = [...category.menu_items]
            ;[newItems[currentIndex], newItems[currentIndex - 1]] = [newItems[currentIndex - 1], newItems[currentIndex]]

        // Update sort orders
        newItems.forEach((item, index) => {
            item.sort_order = index
        })

        setCategories(categories.map((cat) => (cat.id === categoryId ? { ...cat, menu_items: newItems } : cat)))

        toast.success("Item moved up")
    }

    const moveItemDown = (categoryId: string, itemId: string) => {
        const category = categories.find((cat) => cat.id === categoryId)
        if (!category || !category.menu_items) return

        const currentIndex = category.menu_items.findIndex((item) => item.id === itemId)
        if (currentIndex === -1 || currentIndex === category.menu_items.length - 1) return

        const newItems = [...category.menu_items]
            ;[newItems[currentIndex], newItems[currentIndex + 1]] = [newItems[currentIndex + 1], newItems[currentIndex]]

        // Update sort orders
        newItems.forEach((item, index) => {
            item.sort_order = index
        })

        setCategories(categories.map((cat) => (cat.id === categoryId ? { ...cat, menu_items: newItems } : cat)))

        toast.success("Item moved down")
    }

    const resetForm = () => {
        setNewCategoryName("")
        setNewCategoryDescription("")
        setNewItemName("")
        setNewItemDescription("")
        setNewItemPrice("")
        setAllergens([])
        setIsHalal(false)
        setAllergenInfo("")
    }

    if (loading) {
        return (
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
        )
    }


    return (
        <>
            <DashboardHeader />
            <main className="max-w-[1200px] mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                    <div>
                        <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
                            Menu Management
                        </h1>
                        <p className="mt-2 text-muted-foreground">Manage your restaurant&apos;s menu categories and items</p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>

                        <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <form onSubmit={handleAddCategory}>
                                    <DialogHeader>
                                        <DialogTitle>Add Menu Category</DialogTitle>
                                        <DialogDescription>Create a new category for your menu items</DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Category Name</Label>
                                            <Input
                                                id="name"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                placeholder="e.g. Appetizers"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <Textarea
                                                id="description"
                                                value={newCategoryDescription}
                                                onChange={(e) => setNewCategoryDescription(e.target.value)}
                                                placeholder="Add a description for this category"
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
                                            className="bg-gradient-to-r from-teal-600 to-blue-600"
                                        >
                                            {isSubmitting ? "Adding..." : "Add Category"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    {filteredCategories.map((category, categoryIndex) => (
                        <motion.div key={category.id} variants={item} className="space-y-4">
                            <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg border">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{category.name}</CardTitle>
                                        {category.description && (
                                            <CardDescription className="text-base">{category.description}</CardDescription>
                                        )}
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
                                                        This will permanently delete the category &quot;{category.name}&quot; and all its items. This action
                                                        cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveCategoryUp(category.id)}
                                            disabled={categoryIndex === 0}
                                            className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                            <span className="sr-only">Move up</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveCategoryDown(category.id)}
                                            disabled={categoryIndex === filteredCategories.length - 1}
                                            className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                            <span className="sr-only">Move down</span>
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">
                                        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-center transition-all hover:scale-[1.02] hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:border-teal-200"
                                                    onClick={() => setSelectedCategory(category)}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Item to {category.name}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                                                <form onSubmit={handleAddItem}>
                                                    <DialogHeader>
                                                        <DialogTitle>Add Menu Item</DialogTitle>
                                                        <DialogDescription>Add a new item to {selectedCategory?.name}</DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-4 py-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="itemName">Item Name</Label>
                                                                <Input
                                                                    id="itemName"
                                                                    value={newItemName}
                                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                                    placeholder="e.g. Caesar Salad"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="itemPrice">Price (€)</Label>
                                                                <Input
                                                                    id="itemPrice"
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={newItemPrice}
                                                                    onChange={(e) => setNewItemPrice(e.target.value)}
                                                                    placeholder="0.00"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="itemDescription">Description (Optional)</Label>
                                                            <Textarea
                                                                id="itemDescription"
                                                                value={newItemDescription}
                                                                onChange={(e) => setNewItemDescription(e.target.value)}
                                                                placeholder="Add a description for this item"
                                                                rows={3}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Allergens</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {["gluten", "dairy", "nuts", "eggs", "soy", "shellfish", "fish"].map((allergen) => (
                                                                    <Button
                                                                        key={allergen}
                                                                        type="button"
                                                                        variant={allergens.includes(allergen) ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            if (allergens.includes(allergen)) {
                                                                                setAllergens(allergens.filter((a) => a !== allergen))
                                                                            } else {
                                                                                setAllergens([...allergens, allergen])
                                                                            }
                                                                        }}
                                                                        className={`capitalize ${allergens.includes(allergen) ? "bg-gradient-to-r from-teal-600 to-blue-600" : ""
                                                                            }`}
                                                                    >
                                                                        {allergen}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label htmlFor="allergenInfo">Additional Allergen Information</Label>
                                                            <Textarea
                                                                id="allergenInfo"
                                                                value={allergenInfo}
                                                                onChange={(e) => setAllergenInfo(e.target.value)}
                                                                placeholder="Add any additional allergen information"
                                                                rows={2}
                                                            />
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="isHalal"
                                                                checked={isHalal}
                                                                onCheckedChange={(checked) => setIsHalal(checked as boolean)}
                                                            />
                                                            <Label htmlFor="isHalal" className="flex items-center gap-2">
                                                                <Leaf className="h-4 w-4 text-green-600" />
                                                                This item is Halal certified
                                                            </Label>
                                                        </div>
                                                    </div>

                                                    <DialogFooter>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsAddItemDialogOpen(false)
                                                                resetForm()
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={!newItemName || !newItemPrice || isSubmitting}
                                                            className="bg-gradient-to-r from-teal-600 to-blue-600"
                                                        >
                                                            {isSubmitting ? "Adding..." : "Add Item"}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>

                                        {category.menu_items && category.menu_items.length > 0 ? (
                                            <div className="space-y-3">
                                                {category.menu_items.map((item, itemIndex) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3 rounded-lg border bg-white/80 p-4 backdrop-blur-sm transition-all hover:shadow-md hover:bg-white/90"
                                                    >
                                                        <div className="flex-shrink-0 cursor-move">
                                                            <Grip className="h-5 w-5 text-muted-foreground" />
                                                        </div>

                                                        <div className="min-w-0 flex-grow">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-medium">{item.name}</h3>
                                                                {item.is_halal && (
                                                                    <span
                                                                        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                                                                        title="Halal certified"
                                                                    >
                                                                        <Leaf className="h-3 w-3" />
                                                                        Halal
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.description && (
                                                                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                                            )}
                                                            {item.allergens && item.allergens.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {item.allergens.map((allergen) => (
                                                                        <span
                                                                            key={allergen}
                                                                            className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                                                                            title={`Contains ${allergen}`}
                                                                        >
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            {allergen}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-shrink-0 font-bold text-lg text-teal-600">
                                                            €{item.price.toFixed(2)}
                                                        </div>

                                                        <div className="flex flex-shrink-0 items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCategory(category)
                                                                    setSelectedItem(item)
                                                                    setNewItemName(item.name)
                                                                    setNewItemDescription(item.description || "")
                                                                    setNewItemPrice(item.price.toString())
                                                                    setAllergens(item.allergens || [])
                                                                    setIsHalal(item.is_halal || false)
                                                                    setAllergenInfo(item.allergen_info || "")
                                                                    setIsEditItemDialogOpen(true)
                                                                }}
                                                                className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit item</span>
                                                            </Button>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-destructive transition-transform hover:scale-110"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        <span className="sr-only">Delete item</span>
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently delete &quot;{item.name}&quot; from your menu. This action cannot be
                                                                            undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteItem(category.id, item.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => moveItemUp(category.id, item.id)}
                                                                disabled={itemIndex === 0}
                                                                className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                            >
                                                                <ArrowUp className="h-4 w-4" />
                                                                <span className="sr-only">Move up</span>
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => moveItemDown(category.id, item.id)}
                                                                disabled={itemIndex === (category.menu_items?.length || 0) - 1}
                                                                className="h-8 w-8 p-0 transition-transform hover:scale-110"
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
                                                <p className="text-muted-foreground mb-4">No items in this category yet</p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedCategory(category)
                                                        setIsAddItemDialogOpen(true)
                                                    }}
                                                    className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add First Item
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}

                    {categories.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                            <div className="mx-auto max-w-md">
                                <h3 className="text-lg font-semibold mb-2">No menu categories yet</h3>
                                <p className="text-muted-foreground mb-6">Start building your menu by creating your first category</p>
                                <Button
                                    onClick={() => setIsAddCategoryDialogOpen(true)}
                                    size="lg"
                                    className="bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Category
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {filteredCategories.length === 0 && categories.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                            <p className="text-muted-foreground">No menu items match your search</p>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            {/* Edit Category Dialog */}
            <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleEditCategory}>
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>Update the category details</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="editName">Category Name</Label>
                                <Input
                                    id="editName"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editDescription">Description (Optional)</Label>
                                <Textarea
                                    id="editDescription"
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
                                    setSelectedCategory(null)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newCategoryName || isSubmitting}
                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Item Dialog */}
            <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleEditItem}>
                        <DialogHeader>
                            <DialogTitle>Edit Menu Item</DialogTitle>
                            <DialogDescription>Update the menu item details</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editItemName">Item Name</Label>
                                    <Input
                                        id="editItemName"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="editItemPrice">Price (€)</Label>
                                    <Input
                                        id="editItemPrice"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newItemPrice}
                                        onChange={(e) => setNewItemPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editItemDescription">Description (Optional)</Label>
                                <Textarea
                                    id="editItemDescription"
                                    value={newItemDescription}
                                    onChange={(e) => setNewItemDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Allergens</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["gluten", "dairy", "nuts", "eggs", "soy", "shellfish", "fish"].map((allergen) => (
                                        <Button
                                            key={allergen}
                                            type="button"
                                            variant={allergens.includes(allergen) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                if (allergens.includes(allergen)) {
                                                    setAllergens(allergens.filter((a) => a !== allergen))
                                                } else {
                                                    setAllergens([...allergens, allergen])
                                                }
                                            }}
                                            className={`capitalize ${allergens.includes(allergen) ? "bg-gradient-to-r from-teal-600 to-blue-600" : ""
                                                }`}
                                        >
                                            {allergen}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editAllergenInfo">Additional Allergen Information</Label>
                                <Textarea
                                    id="editAllergenInfo"
                                    value={allergenInfo}
                                    onChange={(e) => setAllergenInfo(e.target.value)}
                                    placeholder="Add any additional allergen information"
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="editIsHalal"
                                    checked={isHalal}
                                    onCheckedChange={(checked) => setIsHalal(checked as boolean)}
                                />
                                <Label htmlFor="editIsHalal" className="flex items-center gap-2">
                                    <Leaf className="h-4 w-4 text-green-600" />
                                    This item is Halal certified
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsEditItemDialogOpen(false)
                                    setSelectedItem(null)
                                    resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newItemName || !newItemPrice || isSubmitting}
                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
