"use client";
import { ReviewsInfo } from "@/types";
import { Star } from "lucide-react";

interface GoogleRatingProps {
    info: ReviewsInfo;
    className?: string;
    color?: string;
    underline?: boolean
    iconsColor?: string;
}


export function GoogleRating({ info, color, className, iconsColor, underline = false }: GoogleRatingProps) {
    if (!info) {
        return null
    }

    return (
        <div className={`flex items-center gap-1 text-sm ${className}`}>
            <Star className={`h-4 w-4 ${!iconsColor && "fill-yellow-400 text-yellow-400"}`}
                style={{
                    color: iconsColor ? iconsColor : "",
                    fill: iconsColor ? iconsColor : ""
                }}
            />
            <span
                style={{
                    color,
                    textDecoration: underline ? 'underline' : "",
                    textDecorationColor: color
                }}
            >{info.rating.toFixed(1)}</span>
            <span
                style={{
                    color,
                    textDecoration: underline ? 'underline' : "",
                    textDecorationColor: color
                }}
                className="">
                ({info.user_ratings_total || 0} {info.user_ratings_total === 1 ? "review" : "reviews"})
            </span>
        </div>
    );
}
