"use client"

import type { MenuItem } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Leaf } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import Image from "next/image"

interface MenuItemCardProps {
    item: MenuItem
    categoryName: string
    restaurantSlug: string
}

export function MenuItemCard({ item, categoryName, restaurantSlug }: MenuItemCardProps) {
    const { addItem } = useCartStore()

    const handleAddToCart = () => {
        addItem(restaurantSlug, {
            id: item.id,
            name: item.name,
            description: item.description || undefined,
            price: item.price,
            category: categoryName,
            allergens: item.allergens,
            is_halal: item.is_halal || undefined,
        })
    }

    return (
        <Card className="overflow-hidden gap-0 !pt-0 !pb-0 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
            {/* Image */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
                <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzcgFyUtPS-o5LVocypCY6nTPxLyAjkdmYIQ&s"
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-200 hover:scale-105"
                />
                {item.is_halal && (
                    <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
                        <Leaf className="h-3 w-3 mr-1" />
                        Halal
                    </Badge>
                )}
            </div>

            <CardContent className="p-4 flex flex-col flex-1">
                {/* Header with name and price */}
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-tight flex-1 mr-2">{item.name}</h3>
                    <span className="font-bold text-lg text-green-600 whitespace-nowrap">${item.price.toFixed(2)}</span>
                </div>

                {/* Description */}
                {item.description && <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">{item.description}</p>}

                {/* Allergens */}
                {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {item.allergens.slice(0, 3).map((allergen) => (
                                <Badge key={allergen} variant="secondary" className="text-xs">
                                    {allergen}
                                </Badge>
                            ))}
                            {item.allergens.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{item.allergens.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Allergen info */}
                {item.allergen_info && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.allergen_info}</p>}

                {/* Add to cart button - always at bottom */}
                <div className="mt-auto">
                    <Button onClick={handleAddToCart} className="w-full" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
