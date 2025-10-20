"use client"

import { AddressInput, type AddressData } from "@/components/address-input"
import PreferredDeliveryTimeSelect, { PreferredDeliveryTimeChange } from "@/components/preferred-delivery-time-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useRestaurantStatus } from "@/hooks/useRestaurentStatus"
import { loadGoogleMapsScript } from "@/lib/google-maps"
import { normalizeBusinessStatus } from "@/lib/utils"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { OpeningHoursData } from "@/types"
import { Restaurant } from "@prisma/client"
import { AlertCircle, CreditCard, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CartDrawerProps {
    restaurantSlug: string
    restaurantName: string
    restaurant: Restaurant
    isOpen: boolean
    onClose: () => void
}

export function CartDrawer({ restaurantSlug, restaurant, restaurantName, isOpen, onClose }: CartDrawerProps) {
    const { getCartItems, getCartTotal, updateQuantity, removeItem, clearCart } = useCartStore()
    const [isProcessing, setIsProcessing] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)
    const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
    const [preferredISO, setPreferredISO] = useState<string>("");
    const businessStatus = normalizeBusinessStatus(restaurant?.status);
    const t = useTranslations("cart_drawer")
    const handleChangeTime = (next: PreferredDeliveryTimeChange) => {
        setPreferredISO(next.iso);
        // You can also stash next.label / next.timeZone for UI/analytics
        // console.log(next);
    };



    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        email: "",
        phone: "",
    })
    const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup")
    const [deliveryAddress, setDeliveryAddress] = useState<AddressData>({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        formattedAddress: "",
    })
    const [deliveryNotes, setDeliveryNotes] = useState("")
    const [specialInstructions, setSpecialInstructions] = useState("")
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [isAddressValid, setIsAddressValid] = useState(false)


    const isDeliveryAllowed =
        businessStatus === "ALLOKAY" || businessStatus === "DISABLE_PICKUP";
    const isPickupAllowed =
        businessStatus === "ALLOKAY" || businessStatus === "DISABLE_DELIVERY";

    const items = getCartItems(restaurantSlug)
    const subtotal = getCartTotal(restaurantSlug)
    const taxRate = restaurant.tax_percentage / 100;
    const taxAmount = subtotal * taxRate
    const deliveryFee = orderType === "delivery" ? restaurant.delivery_fee : 0
    const total = subtotal + taxAmount + deliveryFee

    // Load Google Maps API when component mounts
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (apiKey && !googleMapsLoaded) {
            loadGoogleMapsScript(apiKey)
                .then(() => setGoogleMapsLoaded(true))
                .catch((error) => {
                    console.error("Failed to load Google Maps:", error)
                    toast.error(t("address_messages.autocomplete_unavailable"))
                })
        }
    }, [googleMapsLoaded])

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(restaurantSlug, itemId)
        } else {
            updateQuantity(restaurantSlug, itemId, newQuantity)
        }
    }

    const safeSetOrderType = (val: "pickup" | "delivery") => {
        if (val === "delivery" && !isDeliveryAllowed) {
            toast.error(t("toasts.delivery_disabled"));
            return;
        }
        if (val === "pickup" && !isPickupAllowed) {
            toast.error(t("toasts.pickup_disabled"));
            return;
        }
        setOrderType(val);
    };

    useEffect(() => {
        if (!isPickupAllowed && orderType === "pickup") {
            setOrderType("delivery");
        } else if (!isDeliveryAllowed && orderType === "delivery") {
            setOrderType("pickup");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessStatus]); // run when restaurant.status changes

    const validateForm = () => {
        const errors: Record<string, string> = {}

        if (!customerInfo.name.trim()) {
            errors.name = t("errors.name_required")
        }

        if (!customerInfo.email.trim()) {
            errors.email = t("errors.email_required")
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
            errors.email = t("errors.email_invalid")
        }

        if (!customerInfo.phone.trim()) {
            errors.phone = t("errors.phone_required")
        } else if (!/^[+]?[1-9][\d]{0,15}$/.test(customerInfo.phone.replace(/[\s\-$$$$]/g, ""))) {
            errors.phone = t("errors.phone_invalid")
        }

        if (orderType === "delivery") {
            if (!isAddressValid) {
                errors.address = t("errors.address_incomplete")
            }
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleProceedToCheckout = async () => {
        if (items.length === 0) {
            toast.error(t("toasts.cart_empty"))
            return
        }

        if (!validateForm()) {
            toast.error(t("toasts.validation_error"))
            return
        }

        setIsProcessing(true)

        try {
            const response = await fetch("/api/payments/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    restaurantSlug,
                    items: items.map((item) => ({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        quantity: item.quantity,
                        category: item.category,
                        allergens: item.allergens,
                        addons: item.addons
                    })),
                    customerInfo,
                    orderType,
                    preferredISO: preferredISO || "",
                    deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
                    deliveryNotes: orderType === "delivery" ? deliveryNotes : undefined,
                    specialInstructions: specialInstructions || undefined,
                    isGuest: true,
                }),
            })

            const data = await response.json()

            if (response.status === 404) {
                throw new Error("Restaurant or Stripe key not found")
            }

            if (!response.ok) {
                throw new Error(data.error || t("errors.failed_checkout_session"))
            }

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(t("errors.checkout_no_url"))
            }
        } catch (error: any) {
            console.error("Checkout error:", error)
            if (error.message === "Restaurant or Stripe key not found") {
                toast.error(t("toasts.restaurant_unavailable_title"), {
                    description: t("toasts.restaurant_unavailable_description"),
                });
                return;
            }
            toast.error(error instanceof Error ? error.message : t("toasts.checkout_failed_generic"))
        } finally {
            setIsProcessing(false)
        }
    }

    const resetCheckoutForm = () => {
        setShowCheckout(false)
        setCustomerInfo({ name: "", email: "", phone: "" })
        setOrderType("pickup")
        setDeliveryAddress({
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            formattedAddress: "",
        })
        setDeliveryNotes("")
        setSpecialInstructions("")
        setFormErrors({})
        setIsAddressValid(false)
    }

    const openingHours = restaurant.opening_hours ? (restaurant.opening_hours as OpeningHoursData) : {
        monday: { open: "", close: "", closed: true },
        tuesday: { open: "", close: "", closed: true },
        wednesday: { open: "", close: "", closed: true },
        thursday: { open: "", close: "", closed: true },
        friday: { open: "", close: "", closed: true },
        saturday: { open: "", close: "", closed: true },
        sunday: { open: "", close: "", closed: true },
    }

    const status = useRestaurantStatus(openingHours, restaurant.timezone || "Asia/Karachi")


    return (
        <Sheet
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    resetCheckoutForm()
                    onClose()
                }
            }}

        >
            <SheetContent

                iconColorClose={"black"}
                className="w-full sm:max-w-md flex flex-col">
                <SheetHeader className="relative shadow-sm gap-1">
                    <SheetTitle

                        className="flex items-center justify-between">
                        {showCheckout ? t("header.checkout") : t("header.your_order")}
                    </SheetTitle>
                    <SheetDescription

                    ><span>{t("header.from_label")} </span> <span className="font-semibold">{restaurantName}</span></SheetDescription>
                    {!showCheckout && items.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearCart(restaurantSlug)}

                            className=" absolute bottom-2 right-2 hover:bg-transparent cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {t("header.clear_all")}
                        </Button>
                    )}
                </SheetHeader>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto py-2 px-4">
                    {!showCheckout ? (
                        // Cart Items View
                        items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <ShoppingBag

                                    className="h-16 w-16 text-gray-400 mb-4" />
                                <h3

                                    className="text-lg font-medium  mb-2">
                                    {t("empty_cart.title")}
                                </h3>
                                <p

                                    className="opacity-80 mb-4">
                                    {t("empty_cart.subtitle")}
                                </p>
                                <Button

                                    onClick={onClose} variant="outline" className="hover:bg-transparent cursor-pointer border-none">
                                    {t("empty_cart.continue_shopping_button")}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <CartItemComponent
                                        key={item.id}
                                        item={item}
                                        restaurant={restaurant}
                                        onQuantityChange={(quantity) => handleQuantityChange(item.cartItemId || "", quantity)}
                                        onRemove={() => removeItem(restaurantSlug, item.cartItemId || "")}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        // Checkout Form View
                        <div className="space-y-3">
                            {/* Guest Order Notice */}
                            <Alert

                                // className="border-none"
                                className="bg-yellow-50"
                            >
                                <AlertCircle

                                    className="h-4 w-4" />
                                <AlertDescription

                                >
                                    {t("guest_order_notice.text")}
                                </AlertDescription>
                            </Alert>

                            {/* Order Summary */}
                            <div

                                className="px-3 py-3 rounded-lg">
                                <h3 className="font-medium mb-2">
                                    {t("order_summary.title")}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>
                                            {t("order_summary.items_plural", { count: items.length })}
                                        </span>
                                        <span>€{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>
                                            {t("tax_label.title", {
                                                taxPercentage: restaurant.tax_percentage
                                            })}
                                        </span>
                                        <span>€{taxAmount.toFixed(2)}</span>
                                    </div>
                                    {orderType === "delivery" && (
                                        <div className="flex justify-between">
                                            <span>
                                                {t("order_summary.delivery_fee_label")}
                                            </span>
                                            <span>€{deliveryFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div
                                        className="flex justify-between font-semibold border-t pt-1">
                                        <span>
                                            {t("order_summary.total_label")}
                                        </span>
                                        <span>€{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div

                                className="space-y-4 p-3 rounded-md shadow-sm">
                                <h3 className="font-medium">
                                    {t("checkout_form.contact_information_label")}
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            {t("checkout_form.full_name_label")}
                                        </Label>
                                        <Input
                                            id="name"
                                            value={customerInfo.name}
                                            onChange={(e) => {
                                                setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                                                if (formErrors.name) {
                                                    setFormErrors((prev) => ({ ...prev, name: "" }))
                                                }
                                            }}

                                            placeholder={t("checkout_form.full_name_placeholder")}
                                            className={formErrors.name ? "border-red-500" : ""}
                                            autoComplete="name"
                                        />
                                        {formErrors.name && <p

                                            className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            {t("checkout_form.email_label")}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={customerInfo.email}
                                            onChange={(e) => {
                                                setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
                                                if (formErrors.email) {
                                                    setFormErrors((prev) => ({ ...prev, email: "" }))
                                                }
                                            }}

                                            placeholder={t("checkout_form.email_placeholder")}
                                            className={formErrors.email ? "border-red-500" : ""}
                                            autoComplete="email"
                                        />
                                        {formErrors.email && <p

                                            className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">
                                            {t("checkout_form.phone_label")}
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={customerInfo.phone}
                                            onChange={(e) => {
                                                setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
                                                if (formErrors.phone) {
                                                    setFormErrors((prev) => ({ ...prev, phone: "" }))
                                                }
                                            }}

                                            placeholder={t("checkout_form.phone_placeholder")}
                                            className={formErrors.phone ? "border-red-500" : ""}
                                            autoComplete="tel"
                                        />
                                        {formErrors.phone && <p

                                            className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Order Type */}
                            <div

                                className="space-y-4">
                                <h3 className="font-medium">
                                    {t("checkout_form.order_type_label")}
                                </h3>
                                <RadioGroup value={orderType} onValueChange={(v: "pickup" | "delivery") => safeSetOrderType(v)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem

                                            value="pickup" id="pickup" />
                                        <Label htmlFor="pickup">
                                            {t("checkout_form.pickup_label")}
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem

                                            value="delivery" id="delivery" />
                                        <Label htmlFor="delivery">
                                            {t("checkout_form.delivery_label", { deliveryFee: restaurant.delivery_fee.toFixed(2) })}
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {orderType === "delivery" && (
                                    <div className="space-y-4">
                                        <AddressInput
                                            value={deliveryAddress}
                                            restaurant={restaurant}
                                            onChange={(address: AddressData) => {
                                                setDeliveryAddress(address)
                                                if (formErrors.address) {
                                                    setFormErrors((prev) => ({ ...prev, address: "" }))
                                                }
                                            }}
                                            onValidationChange={setIsAddressValid}
                                            required
                                            label={t("checkout_form.delivery_address_label")}
                                            placeholder={t("checkout_form.delivery_address_placeholder")}
                                            showCurrentLocation={true}
                                            className={formErrors.address ? "border-red-500" : ""}
                                        />
                                        {formErrors.address && <p className="text-sm text-red-500 mt-1">{formErrors.address}</p>}

                                        <div className="space-y-3">
                                            <Label htmlFor="delivery-notes">
                                                {t("checkout_form.delivery_notes_label")}
                                            </Label>
                                            <Textarea
                                                id="delivery-notes"

                                                value={deliveryNotes}
                                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                                placeholder={t("checkout_form.delivery_notes_placeholder")}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Special Instructions */}
                            <div className="space-y-3 mt-6"

                            >
                                <Label htmlFor="instructions">
                                    {t("checkout_form.special_instructions_label")}
                                </Label>
                                <style>
                                    {`
      .placehodler-placeholder::placeholder {
        color: ${restaurant.accent_color || "black"};
          opacity: 0.8; /* 80% opacity */
      }
    `}
                                </style>
                                <Textarea
                                    id="instructions"
                                    value={specialInstructions}

                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder={t("checkout_form.special_instructions_placeholder")}
                                    rows={3}
                                />
                            </div>
                            {/* <p>
                                {preferredISO}
                            </p> */}
                            <div className="mt-5"

                            >
                                <PreferredDeliveryTimeSelect
                                    value={preferredISO}
                                    label={t("checkout_form.preferred_time_label")}
                                    onChange={handleChangeTime}
                                    minutesAhead={120}
                                    stepMinutes={5}
                                    note={t("checkout_form.note")}
                                    timeZone={restaurant.timezone || "Europe/Rome"} // <- optionally override
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t pt-4 space-y-4 px-4 pb-4"

                    >
                        {!showCheckout ? (
                            <>
                                <div

                                    className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            {t("cart_footer.subtotal_label")}
                                        </span>
                                        <span>€{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            {t("cart_footer.tax_label", { taxPercentage: restaurant.tax_percentage })}
                                        </span>
                                        <span>€{taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div

                                        className="flex justify-between font-semibold text-lg border-t pt-2">
                                        <span>
                                            {t("cart_footer.total_label")}
                                        </span>
                                        <span>€{(subtotal + taxAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button

                                    className="w-full cursor-pointer border-none" size="lg" onClick={() => {

                                        if (!status.isOpen) {
                                            toast.error(t("toasts.restaurant_closed_title"))
                                            return
                                        }
                                        if (restaurant?.status === "DISABLE_BOTH") {
                                            toast.error(t("toasts.restaurant_disabled_title"));
                                            return
                                        }
                                        setShowCheckout(true)
                                    }
                                    }>
                                    {t("buttons.proceed_checkout")}
                                </Button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline" onClick={() => setShowCheckout(false)} className="flex-1 cursor-pointer border">
                                    {t("buttons.back_cart")}
                                </Button>
                                <Button
                                    onClick={handleProceedToCheckout} disabled={isProcessing} className="flex-1 cursor-pointer border-none">
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {t("buttons.processing")}
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            {t("buttons.pay_amount", { total: total.toFixed(2) })}
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

interface CartItemComponentProps {
    item: CartItem
    restaurant: Restaurant
    onQuantityChange: (quantity: number) => void
    onRemove: () => void
}

function CartItemComponent({ item, onQuantityChange, onRemove }: CartItemComponentProps) {
    return (
        <Card

            className="gap-2 py-3">
            <CardContent className="px-4 py-0">
                <div className="flex justify-between items-start mb-3">
                    <div
                        className="flex-1 mr-3">
                        <h4 className="font-medium  line-clamp-1">{item.name}</h4>
                        {item.description && <p className="text-sm  mt-1 line-clamp-2 opacity-80">{item.description}</p>}
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
                                <Badge
                                    key={allergen} variant="secondary" className="text-xs">
                                    {allergen}
                                </Badge>
                            ))}
                            {item.allergens.length > 3 && (
                                <Badge
                                    variant="secondary" className="text-xs">
                                    +{item.allergens.length - 3}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {item?.addons && item?.addons?.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                            {item.addons.slice(0, 3).map((addon) => (
                                <Badge key={addon.name} variant="outline" className="text-xs">
                                    {addon.name} (€{addon.price.toFixed(2)})
                                </Badge>
                            ))}
                            {item.addons.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{item.addons.length - 3}
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
                            className="h-8 w-8 p-0 border-none"
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span

                            className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onQuantityChange(item.quantity + 1)}
                            className="h-8 w-8 p-0 border-none"
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                    <span className="font-semibold text-green-600">
                        €{(
                            (item.price +
                                (Array.isArray(item.addons)
                                    ? item.addons.reduce((sum, addon) => sum + addon.price, 0)
                                    : 0)) * item.quantity
                        ).toFixed(2)}
                    </span>                </div>
            </CardContent>
        </Card>
    )
}
