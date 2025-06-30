import { z } from "zod"

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

// Reorder validation schemas
export const reorderFaqCategorySchema = z.object({
    categoryId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

export const reorderFaqSchema = z.object({
    faqId: z.string().uuid(),
    direction: z.enum(["up", "down"]),
})

// Bulk operation schemas
export const bulkDeleteFaqsSchema = z.object({
    faqIds: z.array(z.string().uuid()).min(1, "At least one FAQ ID is required"),
})

// Type exports
export type CreateFaqCategoryInput = z.infer<typeof createFaqCategorySchema>
export type UpdateFaqCategoryInput = z.infer<typeof updateFaqCategorySchema>
export type ReorderFaqCategoryInput = z.infer<typeof reorderFaqCategorySchema>

export type CreateFaqInput = z.infer<typeof createFaqSchema>
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>
export type ReorderFaqInput = z.infer<typeof reorderFaqSchema>
export type BulkDeleteFaqsInput = z.infer<typeof bulkDeleteFaqsSchema>
