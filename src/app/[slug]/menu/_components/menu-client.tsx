"use client"

import { useState } from "react"
import type { Restaurant, MenuCategory, MenuItem } from "@prisma/client"
import { MenuHeader } from "./menu-header"
import { CategoryButtons } from "./category-buttons"
import { MenuItems } from "./menu-items"
import { CartDrawer } from "./cart-drawer"
import { useCartStore } from "@/stores/cart-store"

type RestaurantWithMenu = Restaurant & {
    menuCategories: (MenuCategory & {
        items: MenuItem[]
    })[]
}

interface MenuClientProps {
    restaurant: RestaurantWithMenu
}

export function MenuClient({ restaurant }: MenuClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [isCartOpen, setIsCartOpen] = useState(false)

    const { getCartItemCount } = useCartStore()
    const cartItemCount = getCartItemCount(restaurant.slug)

    // Get all items or filtered by category
    const getFilteredItems = () => {
        if (selectedCategory === "all") {
            return restaurant.menuCategories.flatMap((category) =>
                category.items.map((item) => ({ ...item, categoryName: category.name })),
            )
        }

        const category = restaurant.menuCategories.find((cat) => cat.id === selectedCategory)
        return category ? category.items.map((item) => ({ ...item, categoryName: category.name })) : []
    }

    const filteredItems = getFilteredItems()

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Header */}
            <MenuHeader restaurant={restaurant} cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />

            <div className="w-full max-w-[1200px] mx-auto pb-8">
                {/* Category Buttons */}
                <CategoryButtons
                    categories={restaurant.menuCategories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />

                {/* Menu Items */}
                <div className="mx-auto px-4 py-3 w-full">
                    <MenuItems items={filteredItems} restaurantSlug={restaurant.slug} selectedCategory={selectedCategory} />
                </div>

                {/* Cart Drawer */}
                <CartDrawer
                    restaurantSlug={restaurant.slug}
                    restaurantName={restaurant.name}
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                />
            </div>
        </div>
    )
}
