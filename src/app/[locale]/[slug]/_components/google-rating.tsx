"use client";
import { Locale } from "@/i18n/routing";
import { ReviewsInfo } from "@/types";
import { Star } from "lucide-react";
import { useLocale } from "next-intl";

interface GoogleRatingProps {
    info: ReviewsInfo;
    className?: string;
    color?: string;
    underline?: boolean
    iconsColor?: string;
}


export function GoogleRating({ info, color, className, iconsColor, underline = false }: GoogleRatingProps) {

    const locale: Locale = useLocale() as Locale

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
                {info.user_ratings_total || 0}{" "}
                ( {info.user_ratings_total === 1
                    ? (
                        locale === "en" ? "review" :
                            locale === "es" ? "reseña" :
                                locale === "de" ? "Bewertung" :
                                    locale === "fr" ? "avis" :
                                        locale === "it" ? "recensione" :
                                            locale === "nl" ? "beoordeling" :
                                                "review"
                    )
                    : (
                        locale === "en" ? "reviews" :
                            locale === "es" ? "reseñas" :
                                locale === "de" ? "Bewertungen" :
                                    locale === "fr" ? "avis" :
                                        locale === "it" ? "recensioni" :
                                            locale === "nl" ? "beoordelingen" :
                                                "reviews"
                    )
                } )
            </span>
        </div>
    );
}
