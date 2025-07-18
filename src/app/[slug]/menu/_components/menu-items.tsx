"use client"

import type { MenuItem } from "@prisma/client"
import { MenuItemCard } from "./menu-item-card"

type MenuItemWithCategory = MenuItem & {
    categoryName: string
}

interface MenuItemsProps {
    items: MenuItemWithCategory[]
    restaurantSlug: string
    selectedCategory: string
}

export function MenuItems({ items, restaurantSlug, selectedCategory }: MenuItemsProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedCategory === "all" ? "No menu items available" : "No items in this category"}
                </h3>
                <p className="text-gray-500">
                    {selectedCategory === "all"
                        ? "This restaurant hasn't added any menu items yet."
                        : "This category doesn't have any menu items yet."}
                </p>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCategory === "all" ? "All Items" : items[0]?.categoryName}
                </h2>
                <p className="text-gray-600">
                    {items.length} item{items.length !== 1 ? "s" : ""} available
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} categoryName={item.categoryName} restaurantSlug={restaurantSlug} />
                ))}
            </div>
        </div>
    )
}
