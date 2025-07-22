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

    const getBackgroundStyle = () => {
        if (restaurant.bg_type === "image" && restaurant.bg_image_url) {
            return {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${restaurant.bg_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }
        }

        if (restaurant.bg_type === "gradient" && restaurant.bg_gradient_start && restaurant.bg_gradient_end) {
            const directionMap: Record<string, string> = {
                top: "to top",
                bottom: "to bottom",
                left: "to left",
                right: "to right",
                "top-right": "to top right",
                "top-left": "to top left",
                "bottom-right": "to bottom right",
                "bottom-left": "to bottom left",
            }

            return {
                backgroundImage: `linear-gradient(${directionMap[restaurant.gradient_direction] || "to bottom right"}, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`,
            }
        }

        return { backgroundColor: restaurant.bg_color || "#ffffff" }
    }


    return (
        <div className="min-h-screen w-full" style={getBackgroundStyle()}>
            {/* Header */}
            <MenuHeader restaurant={restaurant} cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />

            <div className="w-full max-w-[1200px] mx-auto pb-8">
                {/* Category Buttons */}
                <CategoryButtons
                    categories={restaurant.menuCategories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    restaurant={restaurant}
                />

                {/* Menu Items */}
                <div className="mx-auto px-4 py-3 w-full">
                    <MenuItems restaurant={restaurant} items={filteredItems} restaurantSlug={restaurant.slug} selectedCategory={selectedCategory} />
                </div>

                {/* Cart Drawer */}
                <CartDrawer
                    restaurantSlug={restaurant.slug}
                    restaurantName={restaurant.name}
                    restaurant={restaurant}
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                />
            </div>
        </div>
    )
}
