"use client"
import { Star } from "lucide-react"
import { useState } from "react"

interface GoogleRatingProps {
    placeId: string | null
    className?: string
}

export function GoogleRating({ placeId, className }: GoogleRatingProps) {
    const [rating] = useState<number>(4.8)
    const [reviewCount] = useState<number>(247)

    if (!placeId || !rating) {
        return null
    }

    return (
        <div className={`flex items-center gap-1 text-sm ${className}`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
            <span className="opacity-75">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
        </div>
    )
}
