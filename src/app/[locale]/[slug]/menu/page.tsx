import prisma from "@/lib/prisma"
import { ReviewsInfo } from "@/types"
import { notFound } from "next/navigation"
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
                user: true
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

    let reviewsData: ReviewsInfo = null;

    if (restaurant.google_place_id) {
        try {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.google_place_id}&fields=rating,user_ratings_total&key=${apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (
                response.ok &&
                data.status === "OK" &&
                data.result?.rating !== undefined &&
                data.result?.user_ratings_total !== undefined
            ) {
                reviewsData = {
                    rating: data.result.rating,
                    user_ratings_total: data.result.user_ratings_total,
                };
            } else {
                console.warn("Google Place API error or missing fields:", data);
                reviewsData = null;
            }
        } catch (err) {
            console.error("Error fetching Google Place reviews:", err);
            reviewsData = null;
        }
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <MenuClient restaurant={restaurant} reviewsInfo={reviewsData} />
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
