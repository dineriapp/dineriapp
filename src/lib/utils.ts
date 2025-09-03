import { RestaurantStatus } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertHexToRgba(hex: string, opacity: number) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const DELIVERY_COST = 10.0

export function normalizeBusinessStatus(raw?: string | null): RestaurantStatus {
  const v = (raw ?? "ALLOKAY").toString().trim().toUpperCase();
  if (v === "DISABLE_DELIVERY" || v === "DISABLE_PICKUP" || v === "DISABLE_BOTH" || v === "ALLOKAY") {
    return v as RestaurantStatus;
  }
  return "ALLOKAY";
}

export const getBackgroundStyle = ({ props }: { props: { bg_type: string, bg_image_url: string, bg_gradient_start: string, bg_gradient_end: string, gradient_direction: string, bg_color: string } }) => {
  if (props?.bg_type === "image" && props?.bg_image_url) {
    return {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${props?.bg_image_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  }

  if (props?.bg_type === "gradient" && props?.bg_gradient_start && props?.bg_gradient_end) {
    const directionMap: Record<string, string> = {
      top: "to top",
      bottom: "to bottom",
      left: "to left",
      right: "to right",
      "top-right": "to top right",
      "top-left": "to top left",
      "bottom-right": "to bottom right",
      "bottom-left": "to bottom left",
    }

    return {
      backgroundImage: `linear-gradient(${directionMap[props?.gradient_direction] || "to bottom right"}, ${props?.bg_gradient_start}, ${props?.bg_gradient_end})`,
    }
  }

  return { backgroundColor: props?.bg_color || "#ffffff" }
}

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const motionItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}