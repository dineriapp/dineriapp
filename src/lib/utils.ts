import { OrderStatus, RestaurantStatus } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { OrderStatusActions } from "./reuseable-data";
import { Locale } from "@/i18n/routing";

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


export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "preparing":
      return "bg-blue-100 text-blue-800";
    case "ready":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case "pending":
      return "confirmed";
    case "confirmed":
      return "preparing";
    case "preparing":
      return "ready";
    case "ready":
      return "delivered";
    default:
      return null;
  }
};

export const getStatusAction = (
  status: OrderStatus,
  locale: Locale
) => {
  return OrderStatusActions[locale]?.[status] ?? null;
};



export const SaveChangesBtnClasses = "bg-main-green cursor-pointer rounded-full shadow-lg !px-5 font-poppins !h-[44px] transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl disabled:opacity-50"
export const ResetChangesBtnClasses = "shadow-lg cursor-pointer transition-all duration-200 !px-5 font-poppins !h-[44px] rounded-full bg-white hover:shadow-xl disabled:opacity-50"

export const formatDateTime = (date?: string | Date | null, tz?: string) => {
  if (!date) return ""
  return new Date(date).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: tz || "Asia/Karachi",
  })
}

