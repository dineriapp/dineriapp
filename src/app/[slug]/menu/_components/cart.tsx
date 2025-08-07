"use client"

import { useCartStore, type CartItem } from "@/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CartProps {
    restaurantSlug: string
    restaurantName: string
    isOpen: boolean
    onClose: () => void
}

export function Cart({ restaurantSlug, restaurantName, isOpen, onClose }: CartProps) {
    const { getCartItems, getCartTotal, updateQuantity, removeItem, clearCart } = useCartStore()

    const items = getCartItems(restaurantSlug)
    const total = getCartTotal(restaurantSlug)
    const subtotal = total
    const tax = total * 0.08 // 8% tax
    const finalTotal = subtotal + tax

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(restaurantSlug, itemId)
        } else {
            updateQuantity(restaurantSlug, itemId, newQuantity)
        }
    }

    return (
        <>
            {/* Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={onClose} />}

            {/* Cart Sidebar */}
            <div
                className={cn(
                    "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:shadow-none lg:border-l lg:border-gray-200",
                    isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
                        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Cart Content */}
                    <div className="flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500">Add some delicious items from the menu!</p>
                            </div>
                        ) : (
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">From {restaurantName}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => clearCart(restaurantSlug)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                </div>

                                {items.map((item) => (
                                    <CartItemComponent
                                        key={item.id}
                                        item={item}
                                        onQuantityChange={(quantity) => handleQuantityChange(item.cartItemId || "", quantity)}
                                        onRemove={() => removeItem(restaurantSlug, item.cartItemId || "")}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t border-gray-200 p-4 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>${finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Button className="w-full" size="lg">
                                Proceed to Checkout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

interface CartItemComponentProps {
    item: CartItem
    onQuantityChange: (quantity: number) => void
    onRemove: () => void
}

function CartItemComponent({ item, onQuantityChange, onRemove }: CartItemComponentProps) {
    return (
        <Card>
            <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.category}</p>
                        {item.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:text-red-700 p-1">
                        <X className="h-3 w-3" />
                    </Button>
                </div>

                {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                            {item.allergens.map((allergen) => (
                                <Badge key={allergen} variant="secondary" className="text-xs">
                                    {allergen}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuantityChange(item.quantity - 1)}
                            className="h-6 w-6 p-0"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuantityChange(item.quantity + 1)}
                            className="h-6 w-6 p-0"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                    <span className="font-semibold text-green-600">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
