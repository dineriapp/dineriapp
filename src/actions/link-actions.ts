"use server"

import prisma from "@/lib/prisma";
import { BulkDeleteLinksInput, bulkDeleteLinksSchema, CreateLinkInput, createLinkSchema, DeleteLinkInput, deleteLinkSchema, GetLinksInput, getLinksSchema, ReorderLinkInput, reorderLinkSchema, UpdateLinkInput, updateLinkSchema } from "@/lib/validations";

import { revalidatePath } from "next/cache"

export type ActionResult<T = any> = { data: T; error?: never } | { data?: never; error: string }

// Helper function to format URL
function formatUrl(url: string): string {
    const trimmedUrl = url.trim()
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        return `https://${trimmedUrl}`
    }
    return trimmedUrl
}

export async function getLinks(input: GetLinksInput): Promise<ActionResult<any[]>> {
    try {
        const validatedInput = getLinksSchema.parse(input)

        const links = await prisma.link.findMany({
            where: {
                restaurant_id: validatedInput.restaurant_id,
            },
            orderBy: {
                sort_order: "asc",
            },
        })

        return { data: links }
    } catch (error) {
        console.error("Error fetching links:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to fetch links" }
    }
}

export async function createLink(input: CreateLinkInput): Promise<ActionResult<any>> {
    try {
        const validatedInput = createLinkSchema.parse({
            ...input,
            url: formatUrl(input.url),
        })

        // Check if restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: validatedInput.restaurant_id },
        })

        if (!restaurant) {
            return { error: "Restaurant not found" }
        }

        // Get the next sort order
        const lastLink = await prisma.link.findFirst({
            where: { restaurant_id: validatedInput.restaurant_id },
            orderBy: { sort_order: "desc" },
        })

        const nextSortOrder = lastLink ? lastLink.sort_order + 1 : 0

        const link = await prisma.link.create({
            data: {
                restaurant_id: validatedInput.restaurant_id,
                title: validatedInput.title.trim(),
                url: validatedInput.url,
                sort_order: nextSortOrder,
            },
        })

        revalidatePath("/links")
        return { data: link }
    } catch (error) {
        console.error("Error creating link:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to create link" }
    }
}

export async function updateLink(input: UpdateLinkInput): Promise<ActionResult<any>> {
    try {
        const validatedInput = updateLinkSchema.parse({
            ...input,
            url: formatUrl(input.url),
        })

        // Check if link exists
        const existingLink = await prisma.link.findUnique({
            where: { id: validatedInput.id },
        })

        if (!existingLink) {
            return { error: "Link not found" }
        }

        const link = await prisma.link.update({
            where: { id: validatedInput.id },
            data: {
                title: validatedInput.title.trim(),
                url: validatedInput.url,
            },
        })

        revalidatePath("/links")
        return { data: link }
    } catch (error) {
        console.error("Error updating link:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to update link" }
    }
}

export async function deleteLink(input: DeleteLinkInput): Promise<ActionResult<{ success: boolean }>> {
    try {
        const validatedInput = deleteLinkSchema.parse(input)

        // Check if link exists
        const existingLink = await prisma.link.findUnique({
            where: { id: validatedInput.id },
        })

        if (!existingLink) {
            return { error: "Link not found" }
        }

        // Delete associated link views first (cascade should handle this, but being explicit)
        await prisma.linkView.deleteMany({
            where: { link_id: validatedInput.id },
        })

        // Delete the link
        await prisma.link.delete({
            where: { id: validatedInput.id },
        })

        revalidatePath("/links")
        return { data: { success: true } }
    } catch (error) {
        console.error("Error deleting link:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to delete link" }
    }
}

export async function bulkDeleteLinks(input: BulkDeleteLinksInput): Promise<ActionResult<{ deletedCount: number }>> {
    try {
        const validatedInput = bulkDeleteLinksSchema.parse(input)

        // Check if all links exist
        const existingLinks = await prisma.link.findMany({
            where: {
                id: {
                    in: validatedInput.linkIds,
                },
            },
        })

        if (existingLinks.length !== validatedInput.linkIds.length) {
            return { error: "One or more links not found" }
        }

        // Delete associated link views first
        await prisma.linkView.deleteMany({
            where: {
                link_id: {
                    in: validatedInput.linkIds,
                },
            },
        })

        // Delete the links
        const result = await prisma.link.deleteMany({
            where: {
                id: {
                    in: validatedInput.linkIds,
                },
            },
        })

        revalidatePath("/links")
        return { data: { deletedCount: result.count } }
    } catch (error) {
        console.error("Error bulk deleting links:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to delete links" }
    }
}

export async function reorderLink(input: ReorderLinkInput): Promise<ActionResult<any[]>> {
    try {
        const validatedInput = reorderLinkSchema.parse(input)

        // Get the current link
        const currentLink = await prisma.link.findUnique({
            where: { id: validatedInput.linkId },
        })

        if (!currentLink) {
            return { error: "Link not found" }
        }

        // Get all links for the same restaurant, ordered by sort_order
        const allLinks = await prisma.link.findMany({
            where: { restaurant_id: currentLink.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        const currentIndex = allLinks.findIndex((link) => link.id === validatedInput.linkId)

        if (currentIndex === -1) {
            return { error: "Link not found in restaurant" }
        }

        const newIndex = validatedInput.direction === "up" ? currentIndex - 1 : currentIndex + 1

        if (newIndex < 0 || newIndex >= allLinks.length) {
            return { error: `Cannot move link ${validatedInput.direction}` }
        }

        // Swap sort orders using a transaction
        const targetLink = allLinks[newIndex]

        await prisma.$transaction([
            prisma.link.update({
                where: { id: currentLink.id },
                data: { sort_order: targetLink.sort_order },
            }),
            prisma.link.update({
                where: { id: targetLink.id },
                data: { sort_order: currentLink.sort_order },
            }),
        ])

        // Return updated links
        const updatedLinks = await prisma.link.findMany({
            where: { restaurant_id: currentLink.restaurant_id },
            orderBy: { sort_order: "asc" },
        })

        revalidatePath("/links")
        return { data: updatedLinks }
    } catch (error) {
        console.error("Error reordering links:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to reorder links" }
    }
}

export async function trackLinkView(linkId: string, ipHash: string, userAgent?: string): Promise<ActionResult<any>> {
    try {
        if (!linkId || !ipHash) {
            return { error: "Link ID and IP hash are required" }
        }

        // Check if link exists
        const link = await prisma.link.findUnique({
            where: { id: linkId },
        })

        if (!link) {
            return { error: "Link not found" }
        }

        const linkView = await prisma.linkView.create({
            data: {
                link_id: linkId,
                ip_hash: ipHash,
                user_agent: userAgent,
            },
        })

        return { data: linkView }
    } catch (error) {
        console.error("Error tracking link view:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to track link view" }
    }
}

export async function getLinkAnalytics(restaurantId: string): Promise<ActionResult<any>> {
    try {
        if (!restaurantId) {
            return { error: "Restaurant ID is required" }
        }

        const analytics = await prisma.link.findMany({
            where: { restaurant_id: restaurantId },
            include: {
                _count: {
                    select: {
                        views: true,
                    },
                },
                views: {
                    select: {
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 10,
                },
            },
            orderBy: {
                sort_order: "asc",
            },
        })

        return { data: analytics }
    } catch (error) {
        console.error("Error fetching link analytics:", error)

        if (error instanceof Error) {
            return { error: error.message }
        }

        return { error: "Failed to fetch link analytics" }
    }
}
