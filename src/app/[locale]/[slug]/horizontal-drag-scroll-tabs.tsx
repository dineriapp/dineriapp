import { Button } from "@/components/ui/button"; // adjust import path as needed
import { cn } from "@/lib/utils"; // adjust import path as needed
import { Restaurant } from "@prisma/client";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight } from "lucide-react"; // adjust import path as needed
import Link from "next/link";
import { useCallback, useEffect } from "react";

interface MenuItem {
    show_in_quick_menu?: boolean;
}

interface MenuCategory {
    id: string | number;
    name: string;
    show_in_quick_menu?: boolean;
    items: MenuItem[];
}

type RestaurantType = Restaurant & {
    menuCategories: (MenuCategory & {
        items: MenuItem[];
    })[];
}

export interface HorizontalDragScrollTabsProps {
    restaurant: RestaurantType
    selectedMenuCategory: string | number | "all";
    setSelectedMenuCategory: (categoryId: string | "all") => void;
    translate: (key: string) => string;
    onViewAllClick?: () => void;
    className?: string;
}

function countQuickMenuItems(category: MenuCategory): number {
    return category.items?.filter((item) => item.show_in_quick_menu).length ?? 0;
}

function getVisibleCategories(restaurant: RestaurantType): MenuCategory[] {
    return restaurant.menuCategories.filter((category) => {
        if (!category.show_in_quick_menu) return false;
        return countQuickMenuItems(category) > 0;
    });
}

function getTotalQuickMenuItems(restaurant: RestaurantType): number {
    return getVisibleCategories(restaurant).reduce(
        (total, category) => total + countQuickMenuItems(category),
        0
    );
}

export function HorizontalDragScrollTabs({
    restaurant,
    selectedMenuCategory,
    setSelectedMenuCategory,
    translate,
    onViewAllClick,
    className,
}: HorizontalDragScrollTabsProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        dragFree: true,
        containScroll: "trimSnaps",
        align: "start",
        loop: false,
        slidesToScroll: "auto",
        watchDrag: true,
    });

    const visibleCategories = getVisibleCategories(restaurant);
    const totalItemsCount = getTotalQuickMenuItems(restaurant);

    const handleTabClick = useCallback(
        (categoryId: string | "all") => {
            setSelectedMenuCategory(categoryId);
        },
        [setSelectedMenuCategory]
    );

    useEffect(() => {
        if (!emblaApi) return;

        let selectedIndex = -1;
        if (selectedMenuCategory === "all") {
            selectedIndex = 0;
        } else {
            selectedIndex = visibleCategories.findIndex(
                (cat) => cat.id === selectedMenuCategory
            );
            if (selectedIndex !== -1) {
                selectedIndex += 1;
            }
        }

        if (selectedIndex !== -1 && emblaApi.selectedScrollSnap() !== selectedIndex) {
            emblaApi.scrollTo(selectedIndex, true);
        }
    }, [emblaApi, selectedMenuCategory, visibleCategories]);

    const handleViewAllClick = () => {
        if (onViewAllClick) {
            onViewAllClick();
        }
    };

    if (visibleCategories.length === 0 && totalItemsCount === 0) {
        return null;
    }

    return (
        <div className={cn("relative w-fit max-w-full", className)}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-2">
                    <div className="min-w-fit shrink-0">
                        <Button
                            variant={selectedMenuCategory === "all" ? "default" : "outline"}
                            size="lg"
                            onClick={() => handleTabClick("all")}
                            style={{
                                backgroundColor:
                                    selectedMenuCategory === "all"
                                        ? restaurant.tabsButtonBG
                                        : restaurant.tabsButtonDefault,
                                color:
                                    selectedMenuCategory === "all"
                                        ? restaurant.tabsTextColor
                                        : restaurant.tabsTextDefaultColor,
                            }}
                            className={cn(
                                "whitespace-nowrap cursor-pointer !text-sm flex-shrink-0 h-10 px-4 rounded-full font-medium transition-all duration-200",
                                selectedMenuCategory === "all" ? "shadow-md" : ""
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <span>{translate("all_items_tab")}</span>
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={{
                                        backgroundColor:
                                            selectedMenuCategory === "all"
                                                ? restaurant.tabsTextColor
                                                : restaurant.tabsTextDefaultColor,
                                        color:
                                            selectedMenuCategory === "all"
                                                ? restaurant.tabsButtonBG
                                                : restaurant.tabsButtonDefault,
                                    }}
                                >
                                    {totalItemsCount}
                                </span>
                            </span>
                        </Button>
                    </div>

                    {visibleCategories.map((category) => {
                        const itemCount = countQuickMenuItems(category);
                        const isSelected = selectedMenuCategory === category.id;

                        return (
                            <div key={category.id} className="min-w-fit shrink-0">
                                <Button
                                    variant={isSelected ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => handleTabClick(String(category.id))}
                                    style={{
                                        backgroundColor: isSelected
                                            ? restaurant.tabsButtonBG
                                            : restaurant.tabsButtonDefault,
                                        color: isSelected
                                            ? restaurant.tabsTextColor
                                            : restaurant.tabsTextDefaultColor,
                                    }}
                                    className={cn(
                                        "whitespace-nowrap cursor-pointer !text-sm flex-shrink-0 h-10 px-4 rounded-full font-medium transition-all duration-200",
                                        isSelected ? "shadow-md" : ""
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{category.name}</span>
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                            style={{
                                                backgroundColor: isSelected
                                                    ? restaurant.tabsTextColor
                                                    : restaurant.tabsTextDefaultColor,
                                                color: isSelected
                                                    ? restaurant.tabsButtonBG
                                                    : restaurant.tabsButtonDefault,
                                            }}
                                        >
                                            {itemCount}
                                        </span>
                                    </span>
                                </Button>
                            </div>
                        );
                    })}

                    {restaurant.full_menu_btn_show && <div className="min-w-fit shrink-0">
                        <Link
                            href={`/${restaurant.slug}/menu`}
                            onClick={handleViewAllClick}
                            className="flex items-center gap-1 px-4 py-[10px] border text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md"
                            style={{
                                backgroundColor: restaurant.tabsButtonDefault,
                                color: restaurant.tabsTextDefaultColor,
                            }}
                        >
                            <span>{translate("all_items_tab")}</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>}
                </div>
            </div>
        </div>
    );
}