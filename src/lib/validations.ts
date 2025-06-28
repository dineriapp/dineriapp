import { z } from "zod"

export const createLinkSchema = z.object({
    restaurant_id: z.string().uuid(),
    title: z.string().min(1).max(255),
    url: z.string().url(),
})

export const updateLinkSchema = z.object({
    title: z.string().min(1).max(255),
    url: z.string().url(),
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
})

export const updateItemSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    price: z.number().min(0), // This will be Float in Prisma
    allergens: z.array(z.string()).default([]),
    is_halal: z.boolean().optional().default(false), // Match Boolean? in schema
    allergen_info: z.string().optional(),
})

export const reorderItemSchema = z.object({
    itemId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>