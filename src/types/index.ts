import { Restaurant } from "@prisma/client";

export type GetRestaurantsResponse = {
    restaurants: Restaurant[];
    error: string;
};