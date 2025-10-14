import prisma from "@/lib/prisma";
import { createClient } from "@/supabase/clients/server";
import type { Restaurant, User } from "@prisma/client";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { getStripePlans, StripePlan } from "./stripe-plans";

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
    const t = await getTranslations("auth_and_subscription_messages")
    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return {
                error: t("user_not_found"),
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
                error: t("user_not_found"),
                status: 404
            }
        }

        return { data: { prismaUser: prismaUser, user: data.user } }
    } catch (error) {
        console.error("Get current user error:", error)
        return {
            error: t("user_not_found"),
            status: 404
        }
    }
}

export async function authenticateAndAuthorize(restaurantId: string): Promise<AuthResponse> {
    const t = await getTranslations("auth_and_subscription_messages")

    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
            return {
                error: t("not_authenticated"),
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
                error: t("user_not_found"),
                status: 404
            }
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        })

        if (!restaurant || restaurant.user_id !== prismaUser.id) {
            return {
                error: t("unauthorized_restaurant"),
                status: 403
            }
        }

        return {
            data: { user: prismaUser, restaurant }
        }
    } catch (error) {
        console.error("Authentication error:", error)
        return {
            error: t("authentication_failed"),
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
    const t = await getTranslations("auth_and_subscription_messages")
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
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
                error: t("user_not_found"),
                status: 404,
            }
        }

        // Get user's current plan
        const userPlan = (user.subscription_plan || "basic") as StripePlan
        const planData = getStripePlans(locale)[userPlan]

        // Check if subscription is active
        const isSubscriptionActive =
            user.subscription_status === "active"

        // If user has pro or enterprise plan and subscription is active, no limits apply
        if (planData.limits === null && isSubscriptionActive) {
            return {
                data: { allowed: true },
            }
        }

        // For basic plan or inactive subscriptions, check limits
        const limits = planData.limits || getStripePlans(locale).basic.limits!

        let count = 0
        let limit = 0
        let resourceName = ""

        switch (resourceType) {
            case "links":
                count = await prisma.link.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.links
                resourceName = t("resource_names.links")
                break
            case "menu_categories":
                count = await prisma.menuCategory.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.menuCategories
                resourceName = t("resource_names.menu_categories")
                break
            case "menu_items":
                if (!categoryId) {
                    return {
                        error: t("category_id_required_for_menu_items"),
                        status: 400,
                    }
                }
                count = await prisma.menuItem.count({
                    where: { category_id: categoryId },
                })
                limit = limits.menuItemsPerCategory
                resourceName = t("resource_names.menu_items_per_category")
                break
            case "events":
                count = await prisma.event.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.events
                resourceName = t("resource_names.events")
                break
            case "faq_categories":
                count = await prisma.faqCategory.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.faqCategories
                resourceName = t("resource_names.faq_categories")
                break
            case "faqs":
                if (!categoryId) {
                    return {
                        error: t("category_id_required_for_faqs"),
                        status: 400,
                    }
                }
                count = await prisma.faq.count({
                    where: { category_id: categoryId },
                })
                limit = limits.faqsPerCategory
                resourceName = t("resource_names.faqs_per_category")
                break
            case "qr_codes":
                count = await prisma.qr_codes.count({
                    where: { restaurant_id: restaurantId },
                })
                limit = limits.qr_codes
                resourceName = t("resource_names.qr_codes")
                break
        }

        if (count >= limit) {
            return {
                error: `${t("subscription_limit_reached_dynamic", {
                    limit: limit,
                    resourceName: resourceName,
                    userPlan: userPlan
                })}`,
                status: 403,
            }
        }

        return {
            data: { allowed: true },
        }
    } catch (error) {
        console.error("Subscription limit check error:", error)
        return {
            error: t("failed_to_check_subscription_limits"),
            status: 500,
        }
    }
}

export async function getUserSubscriptionPlan(userId: string) {
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
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
            planData: getStripePlans(locale)[plan],
            currentPeriodEnd: user.subscription_current_period_end,
        }
    } catch (error) {
        console.error("Get subscription plan error:", error)
        return null
    }
}

