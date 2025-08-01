"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StylesDataType } from "@/types"
import type { MenuCategory, MenuItem, Restaurant } from "@prisma/client"

type CategoryWithItems = MenuCategory & {
    items: MenuItem[]
}

interface CategoryButtonsProps {
    categories: CategoryWithItems[]
    selectedCategory: string
    stylesData: StylesDataType
    restaurant: Restaurant
    onCategorySelect: (categoryId: string) => void
}

export function CategoryButtons({ categories, selectedCategory, stylesData, onCategorySelect }: CategoryButtonsProps) {
    const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0)

    return (
        <div className="">
            <div className="mx-auto  py-3">
                {/* Section Header */}
                <div className="mb-5">
                    <h2 className="text-xl font-semibold"
                        style={{
                            color: stylesData.textColor
                        }}
                    >Menu Categories</h2>
                    <p
                        style={{
                            color: stylesData.textColor
                        }}
                        className="text-sm opacity-80">Browse our menu by category</p>
                </div>

                {/* Category Buttons */}
                <div className="flex gap-x-3 gap-y-2 flex-wrap scrollbar-hide pb-2">
                    {/* All button */}
                    <Button
                        variant={"default"}
                        size="lg"
                        style={{
                            backgroundColor: selectedCategory === "all" ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
                            color: selectedCategory === "all" ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                        }}
                        onClick={() => onCategorySelect("all")}
                        className={cn(
                            "whitespace-nowrap border-none flex-shrink-0 cursor-pointer h-11 px-4 rounded-full font-medium transition-all duration-200",
                            selectedCategory === "all"
                                ? "shadow-md"
                                : "",
                        )}
                    >
                        <span className="flex items-center gap-2">
                            <span>All Items</span>
                            <span
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-semibold",)}
                                style={{
                                    backgroundColor: selectedCategory === "all" ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                                    color: selectedCategory === "all" ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
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
                            style={{
                                backgroundColor: selectedCategory === category.id ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
                                color: selectedCategory === category.id ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                            }}

                        >
                            <span className="flex items-center gap-2">
                                <span>{category.name}</span>
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-semibold",)}
                                    style={{
                                        backgroundColor: selectedCategory === category.id ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                                        color: selectedCategory === category.id ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
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
                        <div className="flex items-center gap-2 text-sm ">
                            <span
                                style={{
                                    color: stylesData.textColor
                                }}
                            >Showing:</span>
                            <span
                                style={{
                                    color: stylesData.textColor
                                }}
                                className="font-medium">
                                {categories.find((cat) => cat.id === selectedCategory)?.name}
                            </span>
                            <span
                                style={{
                                    color: stylesData.textColor
                                }}
                                className="opacity-70"
                            >({categories.find((cat) => cat.id === selectedCategory)?.items.length} items)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
