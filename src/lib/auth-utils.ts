import { createClient } from "@/supabase/clients/server"
import type { User, Restaurant } from "@prisma/client"
import prisma from "@/lib/prisma"
import { User as SupabaseUser } from '@supabase/supabase-js';
import { STRIPE_PLANS, StripePlan } from "./stripe-plans";

export interface AuthResult {
    user: User
    restaurant: Restaurant
}

export interface AuthResponse {
    data?: AuthResult
    error?: string
    status?: number
}
export interface GetCurrentUserResponse {
    data?: { user: SupabaseUser, prismaUser: User }
    error?: string
    status?: number
}

export interface LimitCheckResponse {
    data?: { allowed: boolean }
    error?: string
    status?: number
}

export async function getCurrentUser(): Promise<GetCurrentUserResponse> {
    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return {
                error: "User not found",
                status: 404
            }
        }

        const prismaUser = await prisma.user.findFirst({
            where: {
                supabase_id: data.user.id,
            },
        })

        if (!prismaUser) {
            return {
                error: "User not found",
                status: 404
            }
        }

        return { data: { prismaUser: prismaUser, user: data.user } }
    } catch (error) {
        console.error("Get current user error:", error)
        return {
            error: "User not found",
            status: 404
        }
    }
}

export async function authenticateAndAuthorize(restaurantId: string): Promise<AuthResponse> {
    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return {
                error: "Not authenticated",
                status: 401
            }
        }

        const prismaUser = await prisma.user.findFirst({
            where: {
                supabase_id: data.user.id,
            },
        })

        if (!prismaUser) {
            return {
                error: "User not found",
                status: 404
            }
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        })

        if (!restaurant || restaurant.user_id !== prismaUser.id) {
            return {
                error: "Unauthorized: You do not own this restaurant",
                status: 403
            }
        }

        return {
            data: { user: prismaUser, restaurant }
        }
    } catch (error) {
        console.error("Authentication error:", error)
        return {
            error: "Authentication failed",
            status: 500
        }
    }
}

export async function checkSubscriptionLimits(
    userId: string,
    restaurantId: string,
    resourceType: "links" | "menu_categories" | "menu_items" | "events" | "faq_categories" | "faqs",
    categoryId?: string,
): Promise<LimitCheckResponse> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return {
                error: "User not found",
                status: 404
            }
        }

        if (user.subscription_plan === "basic") {
            let count = 0
            let limit = 0
            let resourceName = ""

            switch (resourceType) {
                case "links":
                    count = await prisma.link.count({
                        where: { restaurant_id: restaurantId },
                    })
                    limit = 4
                    resourceName = "links"
                    break
                case "menu_categories":
                    count = await prisma.menuCategory.count({
                        where: { restaurant_id: restaurantId },
                    })
                    limit = 4
                    resourceName = "menu categories"
                    break
                case "menu_items":
                    if (!categoryId) {
                        return {
                            error: "Category ID required for menu items limit check",
                            status: 400
                        }
                    }
                    count = await prisma.menuItem.count({
                        where: { category_id: categoryId },
                    })
                    limit = 3
                    resourceName = "menu items per category"
                    break
                case "events":
                    count = await prisma.event.count({
                        where: { restaurant_id: restaurantId },
                    })
                    limit = 3
                    resourceName = "events"
                    break
                case "faq_categories":
                    count = await prisma.faqCategory.count({
                        where: { restaurant_id: restaurantId },
                    })
                    limit = 4
                    resourceName = "FAQ categories"
                    break
                case "faqs":
                    if (!categoryId) {
                        return {
                            error: "Category ID required for FAQs limit check",
                            status: 400
                        }
                    }
                    count = await prisma.faq.count({
                        where: { category_id: categoryId },
                    })
                    limit = 2
                    resourceName = "FAQs per category"
                    break
            }

            if (count >= limit) {
                return {
                    error: `You are limited to ${limit} ${resourceName} on the Basic plan`,
                    status: 403
                }
            }
        }

        return {
            data: { allowed: true }
        }
    } catch (error) {
        console.error("Subscription limit check error:", error)
        return {
            error: "Failed to check subscription limits",
            status: 500
        }
    }
}

export async function checkSubscriptionLimitsWithPlans(
    userId: string,
    restaurantId: string,
    resourceType: "links" | "menu_categories" | "menu_items" | "events" | "faq_categories" | "faqs" | "qr_codes",
    categoryId?: string,
): Promise<LimitCheckResponse> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscription_plan: true,
                subscription_status: true,
                subscription_current_period_end: true,
            },
        })

        if (!user) {
            return {
                error: "User not found",
                status: 404,
            }
        }

        // Get user's current plan
        const userPlan = (user.subscription_plan || "basic") as StripePlan
        const planData = STRIPE_PLANS[userPlan]

        // Check if subscription is active
        const isSubscriptionActive =
            user.subscription_status === "active" &&
            (!user.subscription_current_period_end || new Date() < new Date(user.subscription_current_period_end))

        // If user has pro or enterprise plan and subscription is active, no limits apply
        if (planData.limits === null && isSubscriptionActive) {
            return {
                data: { allowed: true },
            }
        }

        // For basic plan or inactive subscriptions, check limits
        const limits = planData.limits || STRIPE_PLANS.basic.limits!

        let count = 0
        let limit = 0
        let resourceName = ""

        switch (resourceType) {
            case "links":
                count = await prisma.link.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.links
                resourceName = "links"
                break
            case "menu_categories":
                count = await prisma.menuCategory.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.menuCategories
                resourceName = "menu categories"
                break
            case "menu_items":
                if (!categoryId) {
                    return {
                        error: "Category ID required for menu items limit check",
                        status: 400,
                    }
                }
                count = await prisma.menuItem.count({
                    where: { category_id: categoryId },
                })
                limit = limits.menuItemsPerCategory
                resourceName = "menu items per category"
                break
            case "events":
                count = await prisma.event.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.events
                resourceName = "events"
                break
            case "faq_categories":
                count = await prisma.faqCategory.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.faqCategories
                resourceName = "FAQ categories"
                break
            case "faqs":
                if (!categoryId) {
                    return {
                        error: "Category ID required for FAQs limit check",
                        status: 400,
                    }
                }
                count = await prisma.faq.count({
                    where: { category_id: categoryId },
                })
                limit = limits.faqsPerCategory
                resourceName = "FAQs per category"
                break
            case "qr_codes":
                count = await prisma.qr_codes.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.qr_codes
                resourceName = "QR codes"
                break
        }

        if (count >= limit) {
            return {
                error: `You are limited to ${limit} ${resourceName} on the ${userPlan} plan. Upgrade to Pro for unlimited access.`,
                status: 403,
            }
        }

        return {
            data: { allowed: true },
        }
    } catch (error) {
        console.error("Subscription limit check error:", error)
        return {
            error: "Failed to check subscription limits",
            status: 500,
        }
    }
}

export async function getUserSubscriptionPlan(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscription_plan: true,
                subscription_status: true,
                subscription_current_period_end: true,
            },
        })

        if (!user) {
            return null
        }

        const plan = (user.subscription_plan || "basic") as StripePlan
        const isActive = user.subscription_status === "active"
        const hasExpired = user.subscription_current_period_end
            ? new Date() > new Date(user.subscription_current_period_end)
            : false

        return {
            plan,
            isActive: isActive && !hasExpired,
            planData: STRIPE_PLANS[plan],
            currentPeriodEnd: user.subscription_current_period_end,
        }
    } catch (error) {
        console.error("Get subscription plan error:", error)
        return null
    }
}

