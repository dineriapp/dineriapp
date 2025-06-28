"use client"

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
import { MenuCategory, MenuItem } from "@/generated/prisma"
import {
    useCreateCategory,
    useCreateItem,
    useDeleteCategory,
    useDeleteItem,
    useMenuCategories,
    useReorderCategory,
    useReorderItem,
    useUpdateCategory,
    useUpdateItem,
} from "@/lib/menu-queries"
import { useUserStore } from "@/stores/auth-store"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store"
import { AlertTriangle, ArrowDown, ArrowUp, Edit, Grip, Leaf, Plus, Search, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

type MenuCategoryWithItems = MenuCategory & {
    items: MenuItem[]
}

export default function MenuPage() {
    const { restaurants, selectedRestaurant } = useRestaurantStore()
    const { prismaUser } = useUserStore()
    const openPopup = useUpgradePopupStore(state => state.open)

    const [searchTerm, setSearchTerm] = useState("")
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

    const restaurantId = selectedRestaurant?.id

    const { data: categories = [], isLoading, error } = useMenuCategories(restaurantId)
    const createCategoryMutation = useCreateCategory(restaurantId)
    const updateCategoryMutation = useUpdateCategory(restaurantId)
    const deleteCategoryMutation = useDeleteCategory(restaurantId)
    const reorderCategoryMutation = useReorderCategory(restaurantId)
    const createItemMutation = useCreateItem(restaurantId)
    const updateItemMutation = useUpdateItem(restaurantId)
    const deleteItemMutation = useDeleteItem(restaurantId)
    const reorderItemMutation = useReorderItem(restaurantId)

    // Filter categories and items based on search term
    const filteredCategories = (categories as MenuCategoryWithItems[])
        .map((category) => ({
            ...category,
            items: category.items?.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        }))
        .filter(
            (category) =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (category.items && category.items.length > 0),
        )

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

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCategory || !newItemName.trim() || !newItemPrice) return

        createItemMutation.mutate(
            {
                category_id: selectedCategory.id,
                name: newItemName.trim(),
                description: newItemDescription.trim() || undefined,
                price: Number.parseFloat(newItemPrice),
                allergens: allergens,
                is_halal: isHalal,
                allergen_info: allergenInfo.trim() || undefined,
            },
            {
                onSuccess: () => {
                    resetForm()
                    setIsAddItemDialogOpen(false)
                },
            },
        )
    }

    const handleEditItem = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedItem || !newItemName.trim() || !newItemPrice) return

        updateItemMutation.mutate(
            {
                id: selectedItem.id,
                name: newItemName.trim(),
                description: newItemDescription.trim() || undefined,
                price: Number.parseFloat(newItemPrice),
                allergens: allergens,
                is_halal: isHalal,
                allergen_info: allergenInfo.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setIsEditItemDialogOpen(false)
                    setSelectedItem(null)
                    resetForm()
                },
            },
        )
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

    // Show loading state when menu is being fetched
    if (isLoading || !selectedRestaurant || !restaurants) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="flex items-center space-x-2 text-slate-500">
                    <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full" />
                    <span>Loading menu...</span>
                </div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-2">Error Loading Menu</h2>
                    <p className="text-slate-500">Failed to load menu for {selectedRestaurant.name}.</p>
                    <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    const isCategoryLimitReached =
        prismaUser?.subscription_plan === "basic" && categories.length >= 3;

    return (
        <>
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
                        <p className="mt-2 text-slate-500">
                            Manage menu categories and items for{" "}

                            <span className="font-medium text-slate-700">{selectedRestaurant.name}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                        {
                            !isCategoryLimitReached ?
                                <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="lg"
                                            disabled={!restaurantId}
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
                                                    disabled={createCategoryMutation.isPending}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={!newCategoryName || createCategoryMutation.isPending || !restaurantId}
                                                    className="bg-gradient-to-r from-teal-600 to-blue-600"
                                                >
                                                    {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                                :
                                <>
                                    <Button
                                        size="lg"
                                        onClick={() => {
                                            openPopup("You are limited to 4 menu categories on the Basic plan. Upgrade to Pro or Enterprise to add more.")
                                        }}
                                        className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-blue-600 transition-transform hover:scale-105"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Category
                                    </Button>
                                </>
                        }

                    </div>
                </motion.div>

                <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    {filteredCategories.map((category, categoryIndex) => (
                        <motion.div key={category.id} variants={item} className="space-y-4">
                            <Card className="bg-white/50 backdrop-blur-sm gap-1 shadow-lg border">
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
                                                        This will permanently delete the category &quot;{category.name}&quot; and all its items from{" "}
                                                        {selectedRestaurant.name}&apos;s menu. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteCategoryMutation.mutate(category.id)}
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
                                            onClick={() => reorderCategoryMutation.mutate({ categoryId: category.id, direction: "up" })}
                                            disabled={categoryIndex === 0 || reorderCategoryMutation.isPending}
                                            className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                            <span className="sr-only">Move up</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => reorderCategoryMutation.mutate({ categoryId: category.id, direction: "down" })}
                                            disabled={categoryIndex === filteredCategories.length - 1 || reorderCategoryMutation.isPending}
                                            className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                            <span className="sr-only">Move down</span>
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">


                                        {category.items && category.items.length > 0 ? (
                                            <div className="space-y-3">
                                                {category.items.map((item, itemIndex) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-3 rounded-lg border bg-white/80 p-4 backdrop-blur-sm transition-all hover:shadow-md hover:bg-white/90"
                                                    >
                                                        <div className="flex-shrink-0 cursor-move">
                                                            <Grip className="h-5 w-5 text-slate-400" />
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
                                                            {item.description && <p className="text-sm text-slate-500 mb-2">{item.description}</p>}
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
                                                                        disabled={deleteItemMutation.isPending}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        <span className="sr-only">Delete item</span>
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently delete &quot;{item.name}&quot; from {selectedRestaurant.name}&apos;s menu.
                                                                            This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => deleteItemMutation.mutate(item.id)}
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
                                                                onClick={() => reorderItemMutation.mutate({ itemId: item.id, direction: "up" })}
                                                                disabled={itemIndex === 0 || reorderItemMutation.isPending}
                                                                className="h-8 w-8 p-0 transition-transform hover:scale-110"
                                                            >
                                                                <ArrowUp className="h-4 w-4" />
                                                                <span className="sr-only">Move up</span>
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => reorderItemMutation.mutate({ itemId: item.id, direction: "down" })}
                                                                disabled={
                                                                    itemIndex === (category.items?.length || 0) - 1 || reorderItemMutation.isPending
                                                                }
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
                                                <p className="text-slate-500 mb-4">No items in this category yet</p>
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
                                <p className="text-slate-500 mb-6">
                                    Start building your menu for {selectedRestaurant.name} by creating your first category
                                </p>
                                <Button
                                    onClick={() => setIsAddCategoryDialogOpen(true)}
                                    size="lg"
                                    disabled={!restaurantId}
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
                            <p className="text-slate-500">No menu items match your search</p>
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
                                disabled={updateCategoryMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newCategoryName || updateCategoryMutation.isPending}
                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                            >
                                {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
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
                                disabled={updateItemMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!newItemName || !newItemPrice || updateItemMutation.isPending}
                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                            >
                                {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={!!selectedCategory && isAddItemDialogOpen} onOpenChange={(open) => {
                setIsAddItemDialogOpen(open);
                if (!open) {
                    setSelectedCategory(null);
                    resetForm();
                }
            }}>

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
                                disabled={createItemMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    !newItemName || !newItemPrice || createItemMutation.isPending || !selectedCategory
                                }
                                className="bg-gradient-to-r from-teal-600 to-blue-600"
                            >
                                {createItemMutation.isPending ? "Adding..." : "Add Item"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
