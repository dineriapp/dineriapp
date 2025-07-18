"use client"

import { useCartStore, type CartItem } from "@/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Plus, Minus, ShoppingBag, Trash2, X } from "lucide-react"
import Image from "next/image"

interface CartDrawerProps {
    restaurantSlug: string
    restaurantName: string
    isOpen: boolean
    onClose: () => void
}

export function CartDrawer({ restaurantSlug, restaurantName, isOpen, onClose }: CartDrawerProps) {
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
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-md gap-0 flex flex-col">
                <SheetHeader className="gap-0 shadow-sm relative">
                    <SheetTitle className="flex items-center justify-between">
                        Your Order
                    </SheetTitle>
                    <SheetDescription>From {restaurantName}</SheetDescription>
                    {items.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearCart(restaurantSlug)}
                            className="text-red-600 absolute right-2 bottom-2 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear All
                        </Button>
                    )}
                </SheetHeader>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto py-4 px-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-4">Add some delicious items from the menu!</p>
                            <Button onClick={onClose} variant="outline">
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartItemComponent
                                    key={item.id}
                                    item={item}
                                    onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
                                    onRemove={() => removeItem(restaurantSlug, item.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t pt-4 space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax (8%)</span>
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
            </SheetContent>
        </Sheet>
    )
}

interface CartItemComponentProps {
    item: CartItem
    onQuantityChange: (quantity: number) => void
    onRemove: () => void
}

function CartItemComponent({ item, onQuantityChange, onRemove }: CartItemComponentProps) {
    return (
        <Card className="gap-0 !py-0">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-3">
                        <div className="border max-w-[120px] p-1 rounded-sm aspect-square">
                            <Image
                                src="data:image/jpeg;base64,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"
                                alt={item.name}
                                width={100}
                                height={100}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h4 className="font-medium text-gray-900 mt-2 line-clamp-1">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        {item.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

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
                                    +{item.allergens.length - 3}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuantityChange(item.quantity - 1)}
                            className="h-8 w-8 p-0"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuantityChange(item.quantity + 1)}
                            className="h-8 w-8 p-0"
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
