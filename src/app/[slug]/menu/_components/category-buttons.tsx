"use client"

import type { MenuCategory, MenuItem } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CategoryWithItems = MenuCategory & {
    items: MenuItem[]
}

interface CategoryButtonsProps {
    categories: CategoryWithItems[]
    selectedCategory: string
    onCategorySelect: (categoryId: string) => void
}

export function CategoryButtons({ categories, selectedCategory, onCategorySelect }: CategoryButtonsProps) {
    const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)

    return (
        <div className="">
            <div className="mx-auto px-4 py-3">
                {/* Section Header */}
                <div className="mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Menu Categories</h2>
                    <p className="text-sm text-gray-600">Browse our menu by category</p>
                </div>

                {/* Category Buttons */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    {/* All button */}
                    <Button
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        size="lg"
                        onClick={() => onCategorySelect("all")}
                        className={cn(
                            "whitespace-nowrap flex-shrink-0 cursor-pointer h-11 px-4 rounded-full font-medium transition-all duration-200",
                            selectedCategory === "all"
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300",
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <span>All Items</span>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                                    selectedCategory === "all" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600",
                                )}
                            >
                                {totalItems}
                            </span>
                        </span>
                    </Button>

                    {/* Category buttons */}
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            size="lg"
                            onClick={() => onCategorySelect(category.id)}
                            className={cn(
                                "whitespace-nowrap flex-shrink-0 cursor-pointer h-11 px-4 rounded-full font-medium transition-all duration-200",
                                selectedCategory === category.id
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                    : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300",
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span>{category.name}</span>
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                                        selectedCategory === category.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600",
                                    )}
                                >
                                    {category.items.length}
                                </span>
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Active Category Indicator */}
                {selectedCategory !== "all" && (
                    <div className="mt-0 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Showing:</span>
                            <span className="font-medium text-blue-600">
                                {categories.find((cat) => cat.id === selectedCategory)?.name}
                            </span>
                            <span>({categories.find((cat) => cat.id === selectedCategory)?.items.length} items)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
