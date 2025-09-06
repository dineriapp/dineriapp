"use client"

import type React from "react"

import LoadingUI from "@/components/loading-ui"
import AddCategoryDialog from "@/components/pages/dashboard/menu/add-category-dialog"
import AddItemDialog from "@/components/pages/dashboard/menu/add-item-dialog"
import EditCategoryDialog from "@/components/pages/dashboard/menu/edit-category-dialog"
import EditItemDialog from "@/components/pages/dashboard/menu/edit-item-dialog"
import MenuCategoryComponent, { MenuCategoryWithItems } from "@/components/pages/dashboard/menu/menu-category"
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
import { Input } from "@/components/ui/input"
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
import { container3 } from "@/lib/reuseable-data"
import { isLimitReached, STRIPE_PLANS } from "@/lib/stripe-plans"
import { useUserStore } from "@/stores/auth-store"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store"
import { MenuCategory, MenuItem, SubscriptionPlan } from "@prisma/client"
import { ArrowDown, ArrowUp, Check, Edit, Plus, Search, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

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
    const [newCategoryshow_in_quick_menu, setNewCategoryshow_in_quick_menu] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [newItemDescription, setNewItemDescription] = useState("")
    const [newItemshow_in_quick_menu, setNewItemshow_in_quick_menu] = useState(false)
    const [newItemPrice, setNewItemPrice] = useState("")
    const [allergens, setAllergens] = useState<string[]>([])
    const [isHalal, setIsHalal] = useState(false)
    const [allergenInfo, setAllergenInfo] = useState("")
    const [addons, setAddons] = useState([{ name: "", price: 0 }]);
    const [isUploading, setIsUploading] = useState(false)

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

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim() || !restaurantId) return

        createCategoryMutation.mutate(
            {
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || undefined,
                show_in_quick_menu: newCategoryshow_in_quick_menu
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
                show_in_quick_menu: newCategoryshow_in_quick_menu
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

    const handleAddItem = async (e: React.FormEvent) => {
        try {
            e.preventDefault()
            if (!selectedCategory || !newItemName.trim() || !newItemPrice) return

            setIsUploading(true)

            // Filter valid addons (non-empty name and price)
            const validAddons = addons
                .filter((addon) => addon.name.trim() !== "" && addon.price !== 0)
                .map((addon) => ({
                    name: addon.name.trim(),
                    price: addon.price,
                }));


            createItemMutation.mutate(
                {

                    category_id: selectedCategory.id,
                    name: newItemName.trim(),
                    description: newItemDescription.trim() || undefined,
                    price: Number.parseFloat(newItemPrice),
                    allergens: allergens,
                    is_halal: isHalal,
                    show_in_quick_menu: newItemshow_in_quick_menu,
                    image: "",
                    allergen_info: allergenInfo.trim() || undefined,
                    addons: validAddons.length > 0 ? validAddons : undefined, // Optional: omit if empty

                },
                {
                    onSuccess: () => {
                        resetForm()
                        setIsAddItemDialogOpen(false)
                    },
                },
            )
        } catch (error) {
            console.log(error)
        } finally {
            setIsUploading(false)
        }

    }

    const handleEditItem = async (e: React.FormEvent) => {
        try {
            e.preventDefault()
            if (!selectedItem || !newItemName.trim() || !newItemPrice) return

            setIsUploading(true)

            // Filter valid addons (non-empty name and price)
            const validAddons = addons
                .filter((addon) => addon.name.trim() !== "" && addon.price !== 0)
                .map((addon) => ({
                    name: addon.name.trim(),
                    price: addon.price,
                }));

            updateItemMutation.mutate(
                {
                    id: selectedItem.id,
                    name: newItemName.trim(),
                    description: newItemDescription.trim() || undefined,
                    price: Number.parseFloat(newItemPrice),
                    allergens: allergens,
                    is_halal: isHalal,
                    show_in_quick_menu: newItemshow_in_quick_menu,
                    image: "",
                    addons: validAddons.length > 0 ? validAddons : undefined, // Optional: omit if empty
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
        } catch (error) {
            console.log(error)
        } finally {
            setIsUploading(false)

        }
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

    if (isLoading || !selectedRestaurant || !restaurants) {
        return (
            <LoadingUI text="Loading menu..." />
        )
    }

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

    const isCategoryLimitReached = isLimitReached({
        userPlan: prismaUser?.subscription_plan as SubscriptionPlan,
        resourceType: "menu_categories",
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
                        <h1 className="text-4xl font-bold text-main-blue">
                            Menu Management
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Manage menu categories and items for{" "}

                            <span className="font-medium text-slate-700">{selectedRestaurant.name}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative bg-white rounded-full ">
                            <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 font-poppins rounded-full w-64 h-[42px]"
                            />
                        </div>
                        {
                            !isCategoryLimitReached ?
                                <AddCategoryDialog
                                    isOpen={isAddCategoryDialogOpen}
                                    onOpenChange={setIsAddCategoryDialogOpen}
                                    restaurantId={restaurantId}
                                    categoryName={newCategoryName}
                                    setCategoryName={setNewCategoryName}
                                    categoryDescription={newCategoryDescription}
                                    setCategoryDescription={setNewCategoryDescription}
                                    showInQuickMenu={newCategoryshow_in_quick_menu}
                                    setShowInQuickMenu={setNewCategoryshow_in_quick_menu}
                                    onSubmit={handleAddCategory}
                                    onCancel={() => {
                                        setIsAddCategoryDialogOpen(false);
                                        resetForm();
                                    }}
                                    isPending={createCategoryMutation.isPending}
                                />
                                :
                                <>
                                    <Button
                                        size="lg"
                                        onClick={() => {
                                            const plan = prismaUser?.subscription_plan ?? "basic"
                                            const planName = STRIPE_PLANS[plan].name
                                            const limit = STRIPE_PLANS[plan].limits?.menuCategories
                                            openPopup(`You are limited to ${limit} menu categories on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`)
                                        }}
                                        className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Category
                                    </Button>
                                </>
                        }

                    </div>
                </motion.div>

                <motion.div variants={container3} initial="hidden" animate="show" className="space-y-6">
                    {filteredCategories.map((category, categoryIndex) => (
                        <div key={category.id} className="space-y-4">
                            <Card className="bg-white/50 backdrop-blur-sm gap-1 shadow-lg border">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{category.name}</CardTitle>
                                        {category.show_in_quick_menu && (
                                            <div className="inline-flex items-center gap-1 rounded-md bg-[#002147] px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                                                Quick Menu
                                                <Check className="size-4 text-[#009a5e]" />
                                            </div>
                                        )}
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
                                                setNewCategoryshow_in_quick_menu(category.show_in_quick_menu)
                                            }}
                                            className="h-8 w-8 p-0   bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit category</span>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0   bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full"
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
                                                    <AlertDialogCancel className="font-poppins rounded-full !px-5">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                                                        className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"                                                    >
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
                                            className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"                                        >
                                            <ArrowUp className="h-4 w-4" />
                                            <span className="sr-only">Move up</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => reorderCategoryMutation.mutate({ categoryId: category.id, direction: "down" })}
                                            disabled={categoryIndex === filteredCategories.length - 1 || reorderCategoryMutation.isPending}
                                            className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"                                         >
                                            <ArrowDown className="h-4 w-4" />
                                            <span className="sr-only">Move down</span>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {
                                            category.items && category.items.length > 0 && <Button
                                                variant="outline"
                                                onClick={() => {
                                                    const plan = prismaUser?.subscription_plan ?? "basic";
                                                    const limit = STRIPE_PLANS[plan].limits?.menuItemsPerCategory;

                                                    if (limit !== undefined && category.items.length >= limit) {
                                                        const planName = STRIPE_PLANS[plan].name;
                                                        openPopup(`You are limited to ${limit} menu items per category on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`);
                                                    } else {
                                                        setSelectedCategory(category);
                                                        setSelectedItem(null)
                                                        setNewItemName("")
                                                        setNewItemDescription("")
                                                        setNewItemPrice("")
                                                        setAllergens([])
                                                        setIsHalal(false)
                                                        setAllergenInfo("")
                                                        setAddons([])
                                                        setNewItemshow_in_quick_menu(true)
                                                        setIsAddItemDialogOpen(true);
                                                    }
                                                }}
                                                className="flex items-center gap-2 cursor-pointer text-white hover:text-white hover:opacity-75 !bg-main-green rounded-full !px-5 font-poppins h-[42px]"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Item
                                            </Button>
                                        }
                                        <MenuCategoryComponent
                                            category={category}
                                            selectedRestaurant={selectedRestaurant}
                                            setSelectedCategory={setSelectedCategory}
                                            setSelectedItem={setSelectedItem}
                                            setNewItemName={setNewItemName}
                                            setNewItemDescription={setNewItemDescription}
                                            setNewItemPrice={setNewItemPrice}
                                            setAllergens={setAllergens}
                                            setIsHalal={setIsHalal}
                                            setAllergenInfo={setAllergenInfo}
                                            setAddons={setAddons}
                                            setNewItemshow_in_quick_menu={setNewItemshow_in_quick_menu}
                                            setIsEditItemDialogOpen={setIsEditItemDialogOpen}
                                            setIsAddItemDialogOpen={setIsAddItemDialogOpen}
                                            deleteItemMutation={deleteItemMutation}
                                            reorderItemMutation={reorderItemMutation}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                            <div className="mx-auto max-w-md">
                                <h3 className="text-lg font-semibold mb-2">No menu categories yet</h3>
                                <p className="text-slate-500 mb-6">
                                    Start building your menu for {selectedRestaurant.name} by creating your first category
                                </p>
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
            <EditCategoryDialog
                open={isEditCategoryDialogOpen}
                setOpen={setIsEditCategoryDialogOpen}
                categoryName={newCategoryName}
                setCategoryName={setNewCategoryName}
                categoryDescription={newCategoryDescription}
                setCategoryDescription={setNewCategoryDescription}
                showInQuickMenu={newCategoryshow_in_quick_menu}
                setShowInQuickMenu={setNewCategoryshow_in_quick_menu}
                handleEditCategory={handleEditCategory}
                resetForm={resetForm}
                setSelectedCategory={setSelectedCategory}
                isPending={updateCategoryMutation.isPending}
            />

            {/* Edit Item Dialog */}
            <EditItemDialog
                isOpen={isEditItemDialogOpen}
                onOpenChange={setIsEditItemDialogOpen}
                onSubmit={handleEditItem}
                newItemName={newItemName}
                setNewItemName={setNewItemName}
                newItemPrice={newItemPrice}
                setNewItemPrice={setNewItemPrice}
                newItemDescription={newItemDescription}
                setNewItemDescription={setNewItemDescription}
                allergens={allergens}
                setAllergens={setAllergens}
                allergenInfo={allergenInfo}
                setAllergenInfo={setAllergenInfo}
                addons={addons}
                setAddons={setAddons}
                isHalal={isHalal}
                setIsHalal={setIsHalal}
                newItemshow_in_quick_menu={newItemshow_in_quick_menu}
                setNewItemshow_in_quick_menu={setNewItemshow_in_quick_menu}
                isUploading={isUploading}
                updateItemMutation={updateItemMutation}
                resetForm={resetForm}
                setSelectedItem={setSelectedItem}
            />

            <AddItemDialog
                open={!!selectedCategory && isAddItemDialogOpen}
                categoryName={selectedCategory?.name}
                newItemName={newItemName}
                setNewItemName={setNewItemName}
                newItemPrice={newItemPrice}
                setNewItemPrice={setNewItemPrice}
                newItemDescription={newItemDescription}
                setNewItemDescription={setNewItemDescription}
                allergens={allergens}
                setAllergens={setAllergens}
                allergenInfo={allergenInfo}
                setAllergenInfo={setAllergenInfo}
                addons={addons}
                setAddons={setAddons}
                isHalal={isHalal}
                setIsHalal={setIsHalal}
                showInQuickMenu={newItemshow_in_quick_menu}
                setShowInQuickMenu={setNewItemshow_in_quick_menu}
                isUploading={isUploading}
                onClose={() => {
                    setIsAddItemDialogOpen(false);
                    resetForm();
                }}
                onSubmit={handleAddItem}
                createItemPending={createItemMutation.isPending}
            />
        </>
    )
}
