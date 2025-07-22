import { z } from "zod"

export const createLinkSchema = z.object({
    restaurant_id: z.string().uuid(),
    title: z.string().min(1).max(255),
    url: z.string().url(),
    iconSlug: z.string().min(1).max(255),
})

export const updateLinkSchema = z.object({
    title: z.string().min(1).max(255),
    url: z.string().url(),
    iconSlug: z.string().min(1).max(255),
})

export const reorderLinkSchema = z.object({
    linkId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

function formatUrl(url: string): string {
    const trimmedUrl = url.trim()
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        return `https://${trimmedUrl}`
    }
    return trimmedUrl
}

export { formatUrl }

// Menu Category schemas
export const createCategorySchema = z.object({
    restaurant_id: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
})

export const updateCategorySchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
})

export const reorderCategorySchema = z.object({
    categoryId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

// Menu Item schemas
export const createItemSchema = z.object({
    category_id: z.string().uuid(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.number().min(0), // This will be Float in Prisma
    allergens: z.array(z.string()).default([]),
    is_halal: z.boolean().optional().default(false), // Match Boolean? in schema
    allergen_info: z.string().optional(),
    image: z.string().optional(), // it can be an empty string or relative path
    addons: z
        .array(
            z.object({
                name: z.string().min(1),
                price: z.number().nonnegative(),
            })
        )
        .optional(),
})

export const updateItemSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.number().min(0), // This will be Float in Prisma
    allergens: z.array(z.string()).default([]),
    is_halal: z.boolean().optional().default(false), // Match Boolean? in schema
    allergen_info: z.string().optional(),
    image: z.string().optional(), // it can be an empty string or relative path
    addons: z
        .array(
            z.object({
                name: z.string().min(1),
                price: z.number().nonnegative(),
            })
        )
        .optional(),
})

export const reorderItemSchema = z.object({
    itemId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>


// Event validation schemas
export const createEventSchema = z.object({
    restaurant_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    date: z.string().datetime(),
    ticket_url: z.string().url().optional(),
})

export const updateEventSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    date: z.string().datetime(),
    ticket_url: z.string().url().optional(),
})

// FAQ Category validation schemas
export const createFaqCategorySchema = z.object({
    restaurant_id: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
})

export const updateFaqCategorySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
})

// FAQ validation schemas
export const createFaqSchema = z.object({
    category_id: z.string().uuid(),
    question: z.string().min(1).max(500),
    answer: z.string().min(1),
    is_featured: z.boolean().optional().default(false),
})

export const updateFaqSchema = z.object({
    question: z.string().min(1).max(500),
    answer: z.string().min(1),
    is_featured: z.boolean().optional(),
})

export const reorderEventSchema = z.object({
    eventId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

export const reorderFaqCategorySchema = z.object({
    categoryId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

export const reorderFaqSchema = z.object({
    faqId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

// Bulk operation schemas
export const bulkDeleteLinksSchema = z.object({
    linkIds: z.array(z.string().uuid()).min(1, "At least one link ID is required"),
})

export const bulkDeleteEventsSchema = z.object({
    eventIds: z.array(z.string().uuid()).min(1, "At least one event ID is required"),
})

export const bulkDeleteFaqsSchema = z.object({
    faqIds: z.array(z.string().uuid()).min(1, "At least one FAQ ID is required"),
})
