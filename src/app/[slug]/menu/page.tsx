import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { MenuClient } from "./_components/menu-client"

interface MenuPageProps {
    params: Promise<{ slug: string }>
}

async function getRestaurantWithMenu(slug: string) {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug },
            include: {
                menuCategories: {
                    orderBy: { sort_order: "asc" },
                    include: {
                        items: {
                            orderBy: { sort_order: "asc" },
                        },
                    },
                },
            },
        })

        return restaurant
    } catch (error) {
        console.error("Error fetching restaurant menu:", error)
        return null
    }
}

export default async function MenuPage({ params }: MenuPageProps) {
    const { slug } = await params
    const restaurant = await getRestaurantWithMenu(slug)

    if (!restaurant) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <MenuClient restaurant={restaurant} />
        </div>
    )
}

export async function generateMetadata({ params }: MenuPageProps) {
    const { slug } = await params
    const restaurant = await getRestaurantWithMenu(slug)

    if (!restaurant) {
        return {
            title: "Menu Not Found",
        }
    }

    return {
        title: `${restaurant.name} - Menu`,
        description: `Browse the menu at ${restaurant.name}. ${restaurant.bio || ""}`,
    }
}
