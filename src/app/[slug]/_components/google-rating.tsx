"use client";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface GoogleRatingProps {
    placeId: string;
    className?: string;
}

interface GooglePlaceDetails {
    rating?: number;
    user_ratings_total?: number;
}

export function GoogleRating({ placeId, className }: GoogleRatingProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGoogleRating() {
            try {
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

                if (!apiKey) {
                    throw new Error("Google Maps API key is not defined");
                }

                const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${apiKey}`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.status !== "OK") {
                    throw new Error(data.error_message || "Failed to fetch place details");
                }

                const details: GooglePlaceDetails = data.result;

                setRating(details.rating ?? null);
                setReviewCount(details.user_ratings_total ?? null);
            } catch (error) {
                console.error("Error fetching Google rating:", error);
                setRating(null);
                setReviewCount(null);
            } finally {
                setLoading(false);
            }
        }

        if (placeId) {
            fetchGoogleRating();
        } else {
            setLoading(false);
        }
    }, [placeId]);

    if (loading) {
        return (
            <div className={`flex items-center gap-1 text-sm ${className}`}>
                <div className="h-4 w-4 animate-pulse rounded bg-gray-300" />
                <div className="h-4 w-12 animate-pulse rounded bg-gray-300" />
            </div>
        );
    }

    if (rating === null) {
        return null;
    }

    return (
        <div className={`flex items-center gap-1 text-sm ${className}`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
            <span className="opacity-75">
                ({reviewCount || 0} {reviewCount === 1 ? "review" : "reviews"})
            </span>
        </div>
    );
}
