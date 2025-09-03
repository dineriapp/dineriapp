"use client"
import { useEffect, useState } from "react";

export const useMonthlyVisits = (restaurantId?: string) => {
    const [monthlyVisits, setMonthlyVisits] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMonthlyVisits = async () => {
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/restaurants/${restaurantId}/monthly-visits`);
            const data = await res.json();
            setMonthlyVisits(data.count);
        } catch (error) {
            console.error("Failed to fetch monthly visitors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlyVisits();
    }, [restaurantId]);

    return {
        monthlyVisits,
        refetchMonthlyVisits: fetchMonthlyVisits,
        isLoading,
    };
};
