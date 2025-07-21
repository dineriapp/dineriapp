import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/supabase/clients/server"
import Stripe from "stripe"
import { decrypt_key } from "@/lib/crypto-encrypt-and-decrypt"

interface CheckoutItem {
    id: string
    name: string
    description?: string
    price: number
    quantity: number
    category: string
    allergens?: string[]
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
    deliveryAddress?: DeliveryAddress
    deliveryNotes?: string
    specialInstructions?: string
    isGuest?: boolean
}

export async function POST(request: NextRequest) {
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
        } = body
        console.log(restaurantSlug)

        // Validate required fields
        if (!restaurantSlug || !items?.length || !customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (orderType === "delivery" && !deliveryAddress) {
            return NextResponse.json({ error: "Delivery address is required for delivery orders" }, { status: 400 })
        }

        // Get restaurant details
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug: restaurantSlug },
            select: { id: true, name: true, stripe_secret_key_encrypted: true },
        })

        if (!restaurant || !restaurant.stripe_secret_key_encrypted) {
            return NextResponse.json({ error: "Restaurant or Stripe key not found" }, { status: 404 })
        }

        const stripeSecretKey = decrypt_key(restaurant.stripe_secret_key_encrypted)
        const stripeClient = new Stripe(stripeSecretKey, {
            apiVersion: "2025-06-30.basil",
        })

        // Get user ID if authenticated
        let userId: string | null = null
        if (!isGuest) {
            try {
                const supabase = await createClient()
                const {
                    data: { user },
                } = await supabase.auth.getUser()
                if (user) {
                    const dbUser = await prisma.user.findUnique({
                        where: { supabase_id: user.id },
                        select: { id: true },
                    })
                    userId = dbUser?.id || null
                }
            } catch (error) {
                console.log(error)
                console.log("User not authenticated, proceeding as guest")
            }
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const taxRate = 0.08
        const taxAmount = subtotal * taxRate
        const deliveryFee = orderType === "delivery" ? 5.0 : 0
        const totalAmount = subtotal + taxAmount + deliveryFee

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

        // Create Stripe checkout session
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                ...items.map((item) => ({
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: item.name,
                            description: item.description || undefined,
                            metadata: {
                                category: item.category,
                                allergens: item.allergens?.join(", ") || "",
                            },
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                })),
                {
                    price_data: {
                        currency: "usd",
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
                                currency: "usd",
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
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
    }
}
