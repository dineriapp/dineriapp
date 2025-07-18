"use client"

import type { Restaurant } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MenuHeaderProps {
    restaurant: Restaurant
    cartItemCount: number
    onCartClick: () => void
}

export function MenuHeader({ restaurant, cartItemCount, onCartClick }: MenuHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Restaurant info */}
                    <div className="flex items-center space-x-4">
                        <Link href={`/${restaurant.slug}`}>
                            <Button variant="ghost" size="sm" className="p-2">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>

                        <div className="flex items-center space-x-3">
                            {restaurant.logo_url && (
                                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                    <Image
                                        src={restaurant.logo_url || "/placeholder.svg"}
                                        alt={restaurant.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="space-y-1">
                                <h1 className="text-lg !leading-[1] font-bold text-gray-900 line-clamp-1">{restaurant.name}</h1>
                                <p className="text-sm text-gray-500 !leading-[1]">Menu</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Cart button */}
                    <Button onClick={onCartClick} variant="outline" className="relative bg-transparent" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                                {cartItemCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
