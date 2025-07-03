"use client";
import { ReviewsInfo } from "@/types";
import { Star } from "lucide-react";

interface GoogleRatingProps {
    info: ReviewsInfo;
    className?: string;
    color?: string;
}


export function GoogleRating({ info, color, className }: GoogleRatingProps) {
    if (!info) {
        return null
    }

    return (
        <div className={`flex items-center gap-1 text-sm ${className}`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span
                style={{
                    color
                }}
            >{info.rating.toFixed(1)}</span>
            <span
                style={{
                    color
                }}
                className="opacity-80">
                ({info.user_ratings_total || 0} {info.user_ratings_total === 1 ? "review" : "reviews"})
            </span>
        </div>
    );
}
