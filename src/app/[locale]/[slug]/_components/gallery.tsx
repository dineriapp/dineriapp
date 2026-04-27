"use client";

import { GalleryItemType } from "@/lib/gallery-queries";
import { cn } from "@/lib/utils";
import { ExternalLink, Play } from "lucide-react";
import { useState } from "react";

type RestaurantUIConfig = {
    button_variant?: "solid" | "outline";
    button_style?: "rounded" | "square" | "pill";
    accent_color?: string;
    button_text_icons_color?: string;
    buttons_gap_in_px?: number;
};

interface GalleryCarouselProps {
    items: GalleryItemType[];
    restaurant: RestaurantUIConfig;
    events?: boolean;
}

export function GalleryCarousel({ items, restaurant, events = true }: GalleryCarouselProps) {
    const handleMediaClick = (item: GalleryItemType) => {
        if (!events) return;
        if (item.link) {
            window.open(item.link, "_blank", "noopener,noreferrer");
        }
    };

    if (!items?.length) return null;

    const {
        button_variant = "solid",
        button_style = "rounded",
        accent_color = "#10b981",
        button_text_icons_color = "#000000",
        buttons_gap_in_px = 16,
    } = restaurant;

    const buttonBaseClass = `
        group w-full overflow-hidden transition-all duration-300
        p-0.5 active:scale-[0.98]
        flex flex-col h-full
        ${button_style === "pill" ? "rounded-3xl" : ""}
        ${button_style === "square" ? "rounded-none" : ""}
        ${button_style === "rounded" ? "rounded-2xl" : ""}
    `;

    const buttonBorder = `2px solid ${accent_color}`;
    const buttonBg =
        button_variant === "solid" ? accent_color : "rgba(0,0,0,0.4)";
    const buttonBackdrop = button_variant === "solid" ? "none" : "blur(8px)";

    return (
        <div
            className="w-full flex flex-col"
            style={{ rowGap: `${buttons_gap_in_px}px` }}
        >
            {items.map((item) => (
                <div
                    key={item.id}
                    className={cn(buttonBaseClass)}
                    style={{
                        backgroundColor: buttonBg ?? "",
                        backdropFilter: buttonBackdrop,
                        border: buttonBorder,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                        color: button_text_icons_color ?? "",
                    }}
                >
                    <GalleryItemCard
                        item={item}
                        events={events}
                        buttonStyle={button_style}
                        onLinkClick={handleMediaClick}
                    />
                </div>
            ))}
        </div>
    );
}

interface GalleryItemCardProps {
    item: GalleryItemType;
    buttonStyle: string;
    events?: boolean;
    onLinkClick: (item: GalleryItemType) => void;
}

function GalleryItemCard({ item, buttonStyle, onLinkClick, events = true }: GalleryItemCardProps) {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const isVideo = item.type === "VIDEO";
    const showOverlayAndTitle = !isVideo || (isVideo && !isVideoPlaying);
    const hasLink = !!item.link;

    const mediaContainerClass = cn(
        "relative aspect-video w-full overflow-hidden bg-black/20",
        buttonStyle === "pill" && "rounded-3xl",
        buttonStyle === "square" && "rounded-none",
        buttonStyle === "rounded" && "rounded-2xl"
    );

    const handleExternalLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLinkClick(item);
    };

    const handlePlayClick = (e: React.MouseEvent) => {
        if (!events) return
        e.stopPropagation();
        setIsVideoPlaying(true);
    };

    // Render playing video (iframe)
    if (isVideo && isVideoPlaying) {
        return (
            <div className={mediaContainerClass}>
                <iframe
                    src={`${item.youtubeEmbedUrl}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
            </div>
        );
    }

    // Render image or video thumbnail with overlays
    return (
        <div className={mediaContainerClass} >
            {/* Media (image or video thumbnail) */}
            {isVideo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                    onClick={handlePlayClick}
                />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={item.file.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            )}

            {/* Gradient overlay (only when showing title) */}
            {showOverlayAndTitle && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
            )}

            {/* External link icon (only when link exists and not playing video) */}
            {hasLink && showOverlayAndTitle && (
                <div
                    onClick={handleExternalLinkClick}
                    className="absolute cursor-pointer top-3 right-3 bg-black/60 rounded-full p-1.5 backdrop-blur-sm z-100!"
                >
                    <ExternalLink className="h-4 w-4 text-white" />
                </div>
            )}

            {/* Play button overlay for video thumbnails */}
            {isVideo && !isVideoPlaying && (
                <div
                    onClick={handlePlayClick}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                >
                    <div className="bg-white/90 rounded-full p-3 shadow-lg hover:scale-110 transition">
                        <Play className="w-6 h-6 text-black fill-black" />
                    </div>
                </div>
            )}

            {/* Title (only when showing overlay) */}
            {showOverlayAndTitle && (
                <div className="absolute bottom-0 left-0 right-0 p-3 w-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium text-center">
                        {item.title}
                    </span>
                </div>
            )}
        </div>
    );
}