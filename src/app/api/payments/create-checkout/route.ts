import { checkAuth } from "@/lib/auth/utils"
import { decrypt_key } from "@/lib/crypto-encrypt-and-decrypt"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

interface CheckoutItem {
    id: string
    name: string
    description?: string
    price: number
    quantity: number
    category: string
    allergens?: string[]
    addons: {
        name: string;
        price: number;
    }[]
}

interface CustomerInfo {
    name: string
    email: string
    phone: string
}

interface DeliveryAddress {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
    latitude?: number
    longitude?: number
    formattedAddress: string
}

interface CheckoutRequest {
    restaurantSlug: string
    items: CheckoutItem[]
    customerInfo: CustomerInfo
    orderType: "pickup" | "delivery"
    preferredISO: string
    deliveryAddress?: DeliveryAddress
    deliveryNotes?: string
    specialInstructions?: string
    isGuest?: boolean
}

export async function POST(request: NextRequest) {
    const t = await getTranslations("payments_create_checkout")
    try {
        const body: CheckoutRequest = await request.json()
        const {
            restaurantSlug,
            items,
            customerInfo,
            orderType,
            deliveryAddress,
            deliveryNotes,
            specialInstructions,
            isGuest = false,
            preferredISO
        } = body
        console.log({ location: "Create CheckOut:- ", body })

        // Validate required fields
        if (!restaurantSlug || !items?.length || !customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
            return NextResponse.json({ error: t("err_missing_fields") }, { status: 400 })
        }

        if (orderType === "delivery" && !deliveryAddress) {
            return NextResponse.json({ error: t("err_delivery_addr_required") }, { status: 400 })
        }

        // Get restaurant details
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug: restaurantSlug },
            select: { id: true, name: true, stripe_secret_key_encrypted: true, delivery_fee: true, status: true, tax_percentage: true },
        })

        if (restaurant?.status === "DISABLE_BOTH") {
            return NextResponse.json(
                { error: t("err_disabled_all") },
                { status: 403 }
            )
        } else if (restaurant?.status === "DISABLE_DELIVERY" && orderType === "delivery") {
            return NextResponse.json(
                { error: t("err_disabled_delivery_pickup") },
                { status: 403 }
            )
        } else if (restaurant?.status === "DISABLE_PICKUP" && orderType === "pickup") {
            return NextResponse.json(
                { error: t("err_disabled_pickup_delivery") },
                { status: 403 }
            )
        }

        if (!restaurant || !restaurant.stripe_secret_key_encrypted) {
            return NextResponse.json({ error: t("err_rest_or_stripe_missing") }, { status: 404 })
        }

        const stripeSecretKey = decrypt_key(restaurant.stripe_secret_key_encrypted)
        const stripeClient = new Stripe(stripeSecretKey, {
            apiVersion: "2025-07-30.basil",
        })

        // Get user ID if authenticated
        let userId: string | null = null
        if (!isGuest) {
            try {

                const session = await checkAuth()

                if (session?.user) {
                    userId = session?.user?.id || null
                }
            } catch (error) {
                console.log(error)
                console.log("User not authenticated, proceeding as guest")
            }
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => {
            const hasAddons = Array.isArray(item.addons) && item.addons.length > 0
            const addonsTotal = hasAddons
                ? item.addons.reduce((aSum, addon) => aSum + addon.price, 0)
                : 0

            return sum + (item.price + addonsTotal) * item.quantity
        }, 0)
        const taxRate = restaurant.tax_percentage / 100
        const taxAmount = subtotal * taxRate
        const deliveryFee = orderType === "delivery" ? restaurant.delivery_fee : 0
        const totalAmount = subtotal + taxAmount + deliveryFee

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        // Create Stripe checkout session
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                ...items.map((item) => {
                    const hasAddons = Array.isArray(item.addons) && item.addons.length > 0
                    const addonsTotal = hasAddons
                        ? item.addons.reduce((sum, addon) => sum + addon.price, 0)
                        : 0

                    return {
                        price_data: {
                            currency: "eur",
                            product_data: {
                                name: item.name,
                                description: [
                                    item.description,
                                    Array.isArray(item.addons) && item.addons.length > 0
                                        ? "Addons: " + item.addons
                                            .map((addon) => `${addon.name} (€${addon.price.toFixed(2)})`)
                                            .join(", ")
                                        : null
                                ]
                                    .filter(Boolean)
                                    .join(" | "),
                                metadata: {
                                    category: item.category,
                                    allergens: item.allergens?.join(", ") || "",
                                },
                            },
                            unit_amount: Math.round((item.price + addonsTotal) * 100), // ✅ include addons
                        },
                        quantity: item.quantity,
                    }
                }),
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Tax",
                        },
                        unit_amount: Math.round(taxAmount * 100),
                    },
                    quantity: 1,
                },
                ...(deliveryFee > 0
                    ? [
                        {
                            price_data: {
                                currency: "eur",
                                product_data: {
                                    name: "Delivery Fee",
                                },
                                unit_amount: Math.round(deliveryFee * 100),
                            },
                            quantity: 1,
                        },
                    ]
                    : []),
            ],
            mode: "payment",
            success_url: `${request.nextUrl.origin}/${restaurantSlug}/order-success?session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`,
            cancel_url: `${request.nextUrl.origin}/${restaurantSlug}/menu`,
            customer_email: customerInfo.email,
            metadata: {
                type: "payment",
                user_id: userId || "guest",
                restaurant_id: restaurant.id,
                order_number: orderNumber,
                order_type: orderType,
                preferredISO: preferredISO,
                subtotal: subtotal.toString(),
                tax_amount: taxAmount.toString(),
                delivery_fee: deliveryFee.toString(),
                total_amount: totalAmount.toString(),
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone,
                // Address fields
                delivery_address: deliveryAddress?.formattedAddress || "",
                street: deliveryAddress?.street || "",
                city: deliveryAddress?.city || "",
                state: deliveryAddress?.state || "",
                postal_code: deliveryAddress?.postalCode || "",
                country: deliveryAddress?.country || "",
                latitude: deliveryAddress?.latitude?.toString() || "",
                longitude: deliveryAddress?.longitude?.toString() || "",
                delivery_notes: deliveryNotes || "",
                special_instructions: specialInstructions || "",
                is_guest: isGuest.toString(),
                items: JSON.stringify(items),
            },
        })

        return NextResponse.json({ url: session.url })
    } catch (error) {
        console.error("Checkout error:", error)
        return NextResponse.json({ error: t("err_checkout_create_failed") }, { status: 500 })
    }
}
