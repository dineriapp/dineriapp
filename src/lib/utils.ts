import { OrderStatus, RestaurantStatus } from "@prisma/client";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { OrderStatusActions } from "./reuseable-data";
import { Locale } from "@/i18n/routing";
import { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types";

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
type BackgroundType = string;

interface BackgroundProps {
  bg_type?: BackgroundType;
  bg_image_url?: string | null;
  bg_gradient_start?: string | null;
  bg_gradient_end?: string | null;
  gradient_direction?: string | null;
  bg_color?: string | null;
}

export function getBackgroundStyle({
  bg_type,
  bg_image_url,
  bg_gradient_start,
  bg_gradient_end,
  gradient_direction,
  bg_color,
}: BackgroundProps): React.CSSProperties {
  if (bg_type === "image" && bg_image_url) {
    return {
      backgroundImage: `url(${bg_image_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  if (bg_type === "gradient" && bg_gradient_start && bg_gradient_end) {
    const directionMap: Record<string, string> = {
      top: "to top",
      bottom: "to bottom",
      left: "to left",
      right: "to right",
      "top-right": "to top right",
      "top-left": "to top left",
      "bottom-right": "to bottom right",
      "bottom-left": "to bottom left",
    };

    return {
      backgroundImage: `linear-gradient(${directionMap[gradient_direction || ""] || "to bottom right"
        }, ${bg_gradient_start}, ${bg_gradient_end})`,
    };
  }

  return {
    backgroundColor: bg_color || "#ffffff",
  };
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

export function getEstimatedDuration(
  settings: SettingsState | undefined,
  partySize: number
) {
  if (!settings) return 120; // fallback

  const config = settings.restaurantSettings ?? settings;

  // If tiered durations OFF → use default
  if (!config.use_tiered_duration) {
    return config.default_reservation_duration_minutes || 120;
  }

  // TIERED LOGIC
  if (partySize <= 2) {
    return config.small_party_duration || config.default_reservation_duration_minutes || 120;
  }

  if (partySize <= 4) {
    return config.medium_party_duration || config.default_reservation_duration_minutes || 120;
  }

  return config.large_party_duration || config.default_reservation_duration_minutes || 120;
}

import { differenceInDays } from "date-fns";

export function getReservationStatus(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  const daysUntil = differenceInDays(selectedDate, today);

  if (daysUntil <= 2) {
    return "important";
  } else if (daysUntil <= 7) {
    return "upcoming";
  } else {
    return "followup";
  }
}

export function getQueryStatusColor(status: string): string {
  switch (status) {
    case "important":
      return "bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-200";

    case "upcoming":
      return "bg-sky-100 border-sky-200 text-sky-800 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-200";

    case "followup":
      return "bg-violet-100 border-violet-200 text-violet-800 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-200";

    default:
      return "bg-slate-100 border-slate-200 text-slate-800 dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-200";
  }
}


export function getStatusLabel(status: string): string {
  switch (status) {
    case "important":
      return "Important";
    case "upcoming":
      return "Upcoming";
    case "followup":
      return "Follow Up";
    default:
      return "Pending";
  }
}

export function generateTimeslots() {
  const slots: string[] = [];
  const intervals = ["00", "15", "30", "45"];

  for (let hour = 1; hour <= 12; hour++) {
    for (const m of intervals) {
      slots.push(`${hour.toString().padStart(2, "0")}:${m} AM`);
      slots.push(`${hour.toString().padStart(2, "0")}:${m} PM`);
    }
  }

  return slots;
}

export function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function renderTemplate(template: string, vars: Record<string, any>) {
  if (!template) return "";
  // supports whitespace: {{ guest_name }}
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = vars[key];
    return val === undefined || val === null ? "" : String(val);
  });
}

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function textToSimpleHtml(text: string) {
  // safe + keeps formatting
  return `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space: pre-wrap; margin: 0;">${escapeHtml(
    text
  )}</pre>`;
}

export async function sha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

export function hexToRGBA(hex: string, opacity: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}