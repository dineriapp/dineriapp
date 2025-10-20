"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { StylesDataType } from "@/types"
import type { MenuCategory, MenuItem, Restaurant } from "@prisma/client"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { useTranslations } from "next-intl"

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
    const t = useTranslations("category_buttons")
    const [sliderRef] = useKeenSlider<HTMLDivElement>({
        mode: "free",
        slides: {
            perView: "auto",
            spacing: 12, // no spacing from Keen
        },
    })

    return (
        <div className="">
            <div className="mx-auto py-3">
                {/* Section Header */}
                <div className="mb-5">
                    <h2 className="text-xl font-semibold" style={{ color: stylesData.textColor }}>
                        {t("section_title")}
                    </h2>
                    <p className="text-sm opacity-80" style={{ color: stylesData.textColor }}>
                        {t("section_subtitle")}
                    </p>
                </div>

                {/* Scrollable Container with Chevron Overlay */}
                <div className="relative">
                    <div ref={sliderRef} className="keen-slider px-1">
                        {/* All button */}
                        <div className="keen-slider__slide !w-auto !min-w-fit ">
                            <Button
                                variant={selectedCategory === "all" ? "default" : "outline"}
                                size="lg"
                                onClick={() => onCategorySelect("all")}
                                style={{
                                    backgroundColor: selectedCategory === "all" ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
                                    color: selectedCategory === "all" ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                                }}
                                className={cn(
                                    "whitespace-nowrap  flex-shrink-0 h-11 px-4 rounded-full font-medium transition-all duration-200",
                                    selectedCategory === "all" ? "shadow-md" : ""
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    <span>
                                        {t("all_items")}
                                    </span>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: selectedCategory === "all" ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                                            color: selectedCategory === "all" ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
                                        }}
                                    >
                                        {totalItems}
                                    </span>
                                </span>
                            </Button>
                        </div>

                        {/* Other category buttons */}
                        {categories.map((category) => (
                            <div className="keen-slider__slide !w-auto !min-w-fit" key={category.id}>
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => onCategorySelect(category.id)}
                                    className={cn(
                                        "whitespace-nowrap  flex-shrink-0 h-11 px-4 rounded-full font-medium transition-all duration-200",
                                        selectedCategory === category.id ? "shadow-md" : ""
                                    )}
                                    style={{
                                        backgroundColor: selectedCategory === category.id ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
                                        color: selectedCategory === category.id ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{category.name}</span>
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                            style={{
                                                backgroundColor: selectedCategory === category.id ? stylesData.tabsTextColor : stylesData.tabsTextDefaultColor,
                                                color: selectedCategory === category.id ? stylesData.tabsButtonBG : stylesData.tabsButtonDefault,
                                            }}
                                        >
                                            {category.items.length}
                                        </span>
                                    </span>
                                </Button>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Active Category Label */}
                {selectedCategory !== "all" && (
                    <div className="mt-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span style={{ color: stylesData.textColor }}>
                                {t("showing_label")}
                            </span>
                            <span className="font-medium" style={{ color: stylesData.textColor }}>
                                {categories.find((cat) => cat.id === selectedCategory)?.name}
                            </span>
                            <span className="opacity-70" style={{ color: stylesData.textColor }}>
                                ({categories.find((cat) => cat.id === selectedCategory)?.items.length} {t("items_count")})
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
