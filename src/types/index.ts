import { Restaurant } from "@prisma/client";

export type RestaurantWithCount = Restaurant & {
    _count: {
        restaurantViews: number;
        links: number
        faqCategories: number
        menuCategories: number
        events: number
    };
};


export type GetRestaurantsResponse = {
    restaurants: RestaurantWithCount[];
    error: string;
};

export type ReviewsInfo = { rating: number; user_ratings_total: number } | null

export interface OpeningHoursData {
    [key: string]: {
        open: string
        close: string
        closed: boolean
    }
}