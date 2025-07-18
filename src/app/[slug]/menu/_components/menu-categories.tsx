"use client"

import type { MenuCategory, MenuItem } from "@prisma/client"
import { cn } from "@/lib/utils"
import Image from "next/image"

type CategoryWithItems = MenuCategory & {
    items: MenuItem[]
}

interface MenuCategoriesProps {
    categories: CategoryWithItems[]
    selectedCategory: string | null
    onCategorySelect: (categoryId: string) => void
}

export function MenuCategories({ categories, selectedCategory, onCategorySelect }: MenuCategoriesProps) {
    if (categories.length === 0) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">No menu categories available</p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategorySelect(category.id)}
                        className={cn(
                            "w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3",
                            selectedCategory === category.id
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "hover:bg-gray-50 text-gray-700",
                        )}
                    >
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src="/placeholder.svg?height=40&width=40" alt={category.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{category.name}</p>
                            <p className="text-sm text-gray-500">
                                {category.items.length} item{category.items.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
