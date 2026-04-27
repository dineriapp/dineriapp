import { GalleryItemType } from "@/lib/gallery-queries"
import prisma from "@/lib/prisma"
import { ReviewsInfo } from "@/types"
import type { Event, FaqCategory, Link, MenuCategory, Restaurant, StoryLine, User } from "@prisma/client"
import { notFound, redirect } from "next/navigation"
import ClientPage from "./client-page"
import { cookies } from "next/headers"

interface PageProps {
    params: Promise<{ slug: string, locale: string }> // locale = en | es | de | fr | it | nl 
}

// Define the complete types with relations
type RestaurantWithRelations = Restaurant & {
    links: Link[]
    StoryLine: StoryLine[]
    menuCategories: (MenuCategory & {
        items: Array<{
            id: string
            category_id: string
            name: string
            description: string | null
            price: number
            image: string
            sort_order: number
            allergens: string[]
            is_halal: boolean | null
            allergen_info: string | null
            addons: any
            createdAt: Date
            updatedAt: Date
        }>
    })[]
    events: Event[]
    galleryItems: GalleryItemType[]
    user: User
    faqCategories: (FaqCategory & {
        faqs: Array<{
            id: string
            category_id: string
            question: string
            answer: string
            sort_order: number
            is_featured: boolean
            view_count: number | null
            createdAt: Date
            updatedAt: Date
        }>
    })[]
}

export default async function RestaurantPage({ params }: PageProps) {
    const { slug, locale } = await params

    const restaurantLangData = await prisma.restaurant.findUnique({
        where: { slug },
        select: { language: true },
    });

    if (!restaurantLangData) {
        notFound();
    }

    const restaurantLang = restaurantLangData.language || "en";

    const cookieStore = await cookies();
    const hasVisited = cookieStore.get(`restaurant_locale_set_${slug}`);

    if (!hasVisited && locale !== restaurantLang) {
        return redirect(`/${restaurantLang}/${slug}`);
    }

    try {

        // Fetch restaurant with all related data
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug },
            include: {
                links: {
                    orderBy: { sort_order: "asc" },
                },
                reservation_settings: true,
                menuCategories: {
                    include: {
                        items: {
                            orderBy: { sort_order: "asc" },
                        },
                    },
                    orderBy: { sort_order: "asc" },
                },
                events: {
                    where: {
                        date: {
                            gte: new Date(), // Only future events
                        },
                    },
                    orderBy: { date: "asc" },
                },
                faqCategories: {
                    include: {
                        faqs: {
                            orderBy: { sort_order: "asc" },
                        },
                    },
                    orderBy: { sort_order: "asc" },
                },
                galleryItems: {
                    orderBy: { sort_order: "asc" }
                },
                user: true,
                StoryLine: {
                    take: 1
                }
            },
        })

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

        // @ts-expect-error due to types 
        return <ClientPage restaurant={restaurant as RestaurantWithRelations} reviewsInfo={reviewsData} />
    } catch (error) {
        console.error("Error fetching restaurant data:", error)
        notFound()
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params

    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { slug },
            select: {
                name: true,
                bio: true,
                logo_url: true,
            },
        })

        if (!restaurant) {
            return {
                title: "Restaurant Not Found",
            }
        }

        return {
            title: `${restaurant.name} - Restaurant Links`,
            description: restaurant.bio || `Visit ${restaurant.name} for an amazing dining experience.`,
            openGraph: {
                title: restaurant.name,
                description: restaurant.bio || `Visit ${restaurant.name} for an amazing dining experience.`,
                images: restaurant.logo_url ? [restaurant.logo_url] : [],
            },
        }
    } catch {
        return {
            title: "Restaurant Not Found",
        }
    }
}
