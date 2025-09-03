"use client"
import { useRestaurants } from "@/lib/restaurents-queries";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { GetRestaurantsResponse } from "@/types"; // adjust import as needed
import { QueryObserverResult } from "@tanstack/react-query";

export const useSyncRestaurants = () => {
    const { setRestaurants, setSelectedRestaurant } = useRestaurantStore();
    const { refetch } = useRestaurants();

    const fetchAndSet = async () => {
        const { data }: QueryObserverResult<GetRestaurantsResponse, unknown> = await refetch();

        if (!data) return;

        setRestaurants(data.restaurants);

        const firstRestaurant = data.restaurants[0];
        const restaurantID = localStorage.getItem("selected-restaurant-id");

        if (!restaurantID) {
            localStorage.setItem("selected-restaurant-id", firstRestaurant.id);
            setSelectedRestaurant(firstRestaurant);
        } else {
            const restaurantSelected = data.restaurants.find(res => res.id === restaurantID);
            if (restaurantSelected) {
                setSelectedRestaurant(restaurantSelected);
            } else {
                setSelectedRestaurant(firstRestaurant);
            }
        }
    };

    return { fetchAndSet };
};
