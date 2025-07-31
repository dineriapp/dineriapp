"use client"

import type { MenuCategory, MenuItem, Restaurant } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CategoryWithItems = MenuCategory & {
    items: MenuItem[]
}

interface CategoryButtonsProps {
    categories: CategoryWithItems[]
    selectedCategory: string
    restaurant: Restaurant
    onCategorySelect: (categoryId: string) => void
}

export function CategoryButtons({ categories, selectedCategory, onCategorySelect }: CategoryButtonsProps) {
    const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)

    return (
        <div className="">
            <div className="mx-auto  py-3">
                {/* Section Header */}
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-black">Menu Categories</h2>
                    <p className="text-sm opacity-80 text-black">Browse our menu by category</p>
                </div>

                {/* Category Buttons */}
                <div className="flex gap-x-3 gap-y-2 flex-wrap scrollbar-hide pb-2">
                    {/* All button */}
                    <Button
                        variant={selectedCategory === "all" ? "default" : "outline"}
                        size="lg"
                        onClick={() => onCategorySelect("all")}
                        className={cn(
                            "whitespace-nowrap border-none flex-shrink-0 cursor-pointer h-11 px-4 rounded-full font-medium transition-all duration-200",
                            selectedCategory === "all"
                                ? "shadow-md"
                                : "",
                        )}
                    // style={{
                    //     backgroundColor: selectedCategory === "all" ? restaurant.accent_color || "black" : restaurant.button_text_icons_color || "black",
                    //     color: selectedCategory === "all" ? restaurant.button_text_icons_color || "black" : restaurant.accent_color || "black"
                    // }}
                    >
                        <span className="flex items-center gap-2">
                            <span>All Items</span>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-semibold",)}
                                // style={{
                                //     color: selectedCategory === "all" ? restaurant.accent_color || "black" : restaurant.button_text_icons_color || "black",
                                //     backgroundColor: selectedCategory === "all" ? restaurant.button_text_icons_color || "black" : restaurant.accent_color || "black"
                                // }}
                                style={{
                                    color: selectedCategory === "all" ? "black" : "white",
                                    backgroundColor: selectedCategory === "all" ? "white" : "black"
                                }}
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
                                "whitespace-nowrap flex-shrink-0 cursor-pointer border-none h-11 px-4 rounded-full font-medium transition-all duration-200",
                                selectedCategory === category.id
                                    ? " shadow-md"
                                    : "",
                            )}
                        // style={{
                        //     backgroundColor: selectedCategory === category.id ? restaurant.accent_color || "black" : restaurant.button_text_icons_color || "black",
                        //     color: selectedCategory === category.id ? restaurant.button_text_icons_color || "black" : restaurant.accent_color || "black"
                        // }}
                        >
                            <span className="flex items-center gap-2">
                                <span>{category.name}</span>
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-semibold",)}
                                    // style={{
                                    //     color: selectedCategory === category.id ? restaurant.accent_color || "black" : restaurant.button_text_icons_color || "black",
                                    //     backgroundColor: selectedCategory === category.id ? restaurant.button_text_icons_color || "black" : restaurant.accent_color || "black"
                                    // }}
                                    style={{
                                        color: selectedCategory === category.id ? "black" : "white",
                                        backgroundColor: selectedCategory === category.id ? "white" : "black"
                                    }}
                                >
                                    {category.items.length}
                                </span>
                            </span>
                        </Button>
                    ))}
                </div>

                {/* Active Category Indicator */}
                {selectedCategory !== "all" && (
                    <div className="mt-0 pt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span
                            >Showing:</span>
                            <span

                                className="font-medium">
                                {categories.find((cat) => cat.id === selectedCategory)?.name}
                            </span>
                            <span

                                className="opacity-70"
                            >({categories.find((cat) => cat.id === selectedCategory)?.items.length} items)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
