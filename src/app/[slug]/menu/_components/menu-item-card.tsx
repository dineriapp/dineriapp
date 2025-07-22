"use client"

import type { MenuItem, Restaurant } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Leaf } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import Image from "next/image"
import { toast } from "sonner"
import { parse, isAfter, isBefore } from "date-fns";

interface MenuItemCardProps {
    item: MenuItem
    categoryName: string
    restaurantSlug: string
    restaurant: Restaurant

}

type OpeningHours = {
    [key: string]: {
        open: string;
        close: string;
        closed: boolean;
    };
};

export function isRestaurantOpenNow(openingHours: OpeningHours): boolean {
    const daysOfWeek = [
        "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
    ];

    const now = new Date();
    const currentDay = daysOfWeek[now.getDay()];
    const todayHours = openingHours[currentDay];

    if (!todayHours || todayHours.closed) return false;

    // Parse times in same day context
    const openTime = parse(todayHours.open, "hh:mm a", now);
    const closeTime = parse(todayHours.close, "hh:mm a", now);

    return isAfter(now, openTime) && isBefore(now, closeTime);
}

export function MenuItemCard({ item, categoryName, restaurant, restaurantSlug }: MenuItemCardProps) {
    const { addItem } = useCartStore()

    const handleAddToCart = () => {
        console.log(restaurant.opening_hours)

        const parsedAddons = Array.isArray(item.addons)
            ? (item.addons as { name: string; price: number }[])
            : [];
        addItem(restaurantSlug, {
            id: item.id,
            name: item.name,
            description: item.description || undefined,
            price: item.price,
            image_url: item.image || "",
            category: categoryName,
            allergens: item.allergens,
            is_halal: item.is_halal || undefined,
            addons: item.addons ? parsedAddons : undefined
        })
        toast.success("Added to cart", { description: "Item has been added to your cart." })
    }

    return (
        <Card style={{
            backgroundColor: restaurant.button_text_icons_color || "black",
            borderColor: restaurant.accent_color || "black"
        }} className="overflow-hidden gap-0 !pt-0 !pb-0 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                {<Image
                    src={item?.image ? item.image : "/dummy.jfif"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-200 hover:scale-105"
                />}
                {item.is_halal && (
                    <Badge
                        style={{
                            backgroundColor: restaurant.button_text_icons_color || "black",
                            color: restaurant.accent_color || "black"
                        }
                        }
                        className="absolute top-3 right-3 ">
                        <Leaf className="h-3 w-3 mr-1" />
                        Halal
                    </Badge>
                )}
            </div>

            <CardContent className="p-4 flex flex-col flex-1">
                {/* Header with name and price */}
                <div className="flex justify-between items-start">
                    <h3
                        style={{
                            color: restaurant.accent_color || "black"
                        }}
                        className="font-semibold line-clamp-2 text-base leading-tight flex-1 mr-2">{item.name}</h3>
                    <span
                        style={{
                            color: restaurant.accent_color || "black"
                        }}
                        className="font-bold text-lg  whitespace-nowrap">${item.price.toFixed(2)}</span>
                </div>

                {/* Description */}
                {item.description && <p
                    style={{
                        color: restaurant.accent_color || "black"
                    }}
                    className=" text-sm mb-3 opacity-80 line-clamp-3 flex-1">{item.description}</p>}

                {/* Allergens */}
                {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {item.allergens.slice(0, 3).map((allergen) => (
                                <Badge
                                    style={{
                                        color: restaurant.button_text_icons_color || "black",
                                        backgroundColor: restaurant.accent_color || "black"
                                    }}
                                    key={allergen} variant="secondary" className="text-xs">
                                    {allergen}
                                </Badge>
                            ))}
                            {item.allergens.length > 3 && (
                                <Badge
                                    style={{
                                        color: restaurant.button_text_icons_color || "black",
                                        backgroundColor: restaurant.accent_color || "black"
                                    }}
                                    variant="secondary" className="text-xs">
                                    +{item.allergens.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Allergen info */}
                {item.allergen_info && <p
                    style={{
                        color: restaurant.button_text_icons_color || "black",
                        backgroundColor: restaurant.accent_color || "black"
                    }}
                    className="text-xs  italic w-fit px-2 py-0.5 mb-3 line-clamp-2">{item.allergen_info}</p>}

                {/* Add to cart button - always at bottom */}
                <div className="mt-auto">
                    <Button
                        style={{
                            color: restaurant.button_text_icons_color || "black",
                            backgroundColor: restaurant.accent_color || "black"
                        }}
                        onClick={handleAddToCart} className="w-full cursor-pointer" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
