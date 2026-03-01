"use client";

import { itemSlugPage } from "@/lib/reuseable-data";
import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";

type RestaurantButtonTheme = {
    button_icons_show?: boolean;
    button_style: "pill" | "square" | "rounded";
    button_variant: "solid" | "outline";
    accent_color?: string | null;
    button_text_icons_color?: string | null;
};

interface RestaurantButtonProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    isPreview?: boolean;
    target?: string;
    rel?: string;
    restaurant: RestaurantButtonTheme;
    buttonTextColor: string;
    variants?: any;
}

export default function RestaurantButton({
    children,
    icon,
    onClick,
    // isPreview,
    href,
    target,
    rel,
    restaurant,
    buttonTextColor,
}: RestaurantButtonProps) {
    const isLink = !!href;

    const commonClass = `
    group flex items-center justify-center text-center
    w-full h-[52px] sm:h-[74px]
    transition-all hover:scale-[1.02] active:scale-[0.98]
    relative overflow-hidden
    ${restaurant?.button_icons_show ? "px-14 sm:px-16" : "px-4"}
    ${restaurant.button_style === "pill"
            ? "rounded-full"
            : restaurant.button_style === "square"
                ? "rounded-md"
                : "rounded-xl"
        }
  `;

    const commonStyle = {
        backgroundColor:
            restaurant.button_variant === "solid"
                ? restaurant.accent_color || "#10b981"
                : "transparent",
        backdropFilter: "blur(8px)",
        border: `2px solid ${restaurant.accent_color || "#10b981"}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        color:
            restaurant.button_variant === "solid"
                ? buttonTextColor
                : restaurant.accent_color || "#10b981",
        letterSpacing: "0.01em",
    };

    const Content = (
        <>
            {restaurant?.button_icons_show && icon && (
                <div
                    className="flex aspect-square absolute left-[7px] sm:left-[9px] shrink-0 size-[38px] sm:!size-[54px] items-center justify-center rounded-full"
                    style={{
                        backgroundColor:
                            restaurant.button_text_icons_color || "transparent",
                    }}
                >
                    {icon}
                </div>
            )}

            <span
                className={`relative w-full text-[20px] ${restaurant.button_variant === "outline"
                    ? "group-hover:text-white"
                    : ""
                    } transition-colors duration-300 font-medium`}
                style={{
                    color:
                        restaurant.button_variant === "outline"
                            ? restaurant.accent_color || "#10b981"
                            : buttonTextColor,
                }}
            >
                {children}
            </span>

            {restaurant?.button_icons_show && (
                <div className="absolute right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                    <MoreVertical className="size-5" />
                </div>
            )}
        </>
    );

    if (isLink) {
        return (
            <motion.a
                variants={itemSlugPage}
                href={href}
                target={target}
                rel={rel}
                className={commonClass}
                style={commonStyle}
            >
                {Content}
            </motion.a>
        );
    }

    return (
        <motion.button
            variants={itemSlugPage}
            onClick={onClick}
            className={commonClass}
            style={commonStyle}
        >
            {Content}
        </motion.button>
    );
}