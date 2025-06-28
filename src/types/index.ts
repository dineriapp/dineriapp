import { Restaurant } from "@/generated/prisma";

export type GetRestaurantsResponse = {
    restaurants: Restaurant[];
    error: string;
};