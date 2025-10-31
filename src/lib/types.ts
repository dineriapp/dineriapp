import { Area, GradientDirection, Payment, Prisma, Reservation, Table } from "@prisma/client";

export interface Restaurant {
    id: string;
    user_id: string;
    name: string;
    bio: string;
    website: string;
    logo_url: string | null;
    bg_color: string;
    accent_color: string;
    bg_type: 'color' | 'gradient' | 'image';
    bg_gradient_start: string;
    bg_gradient_end: string;
    gradient_direction?: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    button_style: 'rounded' | 'square' | 'pill';
    button_variant: 'solid' | 'outline';
    font_family: string;
    slug: string;
    created_at: string;
    address?: string;
    phone?: string;
    email?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    opening_hours?: {
        day: string;
        hours: string;
    }[];
    latitude?: number;
    longitude?: number;
    social_icons_position?: 'top' | 'bottom';
    google_place_id?: string;
    average_rating?: number;
    review_count?: number;
    bg_image_url?: string;
    subscription_plan?: string;
    subscription_status?: string;
    welcome_popup_enabled?: boolean;
    welcome_popup_message?: string;
    welcome_popup_delay?: number;
    welcome_popup_show_info?: {
        ratings: boolean;
        address: boolean;
        hours: boolean;
        phone: boolean;
    };
    event_announcements_enabled?: boolean;
    event_announcement_days?: number;
    max_events_in_popup?: number;
    event_rotation_speed?: number;
    welcome_popup_show_button?: boolean;
}

export interface Link {
    id: string;
    restaurant_id: string;
    title: string;
    url: string;
    sort_order: number;
    created_at: string;
    show_icon: boolean;
}

export interface User {
    id: string;
    email: string;
}

export interface MenuCategory {
    id: string;
    restaurant_id: string;
    name: string;
    description?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    menu_items?: MenuItem[];
}

export interface MenuItem {
    id: string;
    category_id: string;
    name: string;
    description?: string;
    price: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
    allergens?: string[];
    is_halal?: boolean;
    allergen_info?: string;
}

export interface Event {
    id: string;
    restaurant_id: string;
    title: string;
    description?: string;
    date: string;
    ticket_url?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface FAQCategory {
    id: string;
    restaurant_id: string;
    name: string;
    description?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    faqs?: FAQ[];
}

export interface FAQ {
    id: string;
    category_id: string;
    question: string;
    answer: string;
    sort_order: number;
    is_featured: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
}

export interface AppearanceFormData {
    bg_color: string
    accent_color: string
    headings_text_color: string
    button_text_icons_color: string
    button_style: "rounded" | "square" | "pill"
    font_family: string
    bg_type: "color" | "gradient" | "image"
    bg_gradient_start: string
    social_icon_bg_color: string
    social_icon_color: string
    button_icons_show: boolean
    buttons_gap_in_px: number
    social_icon_gap: number
    social_icon_bg_show: boolean
    bg_gradient_end: string
    gradient_direction: GradientDirection
    button_variant: "solid" | "outline"
    bg_image_url?: string
}

export interface Template {
    id: string
    name: string
    description: string
    preview: AppearanceFormData
    category: string
}

export interface CreateAreaInput {
    name: string
    active?: boolean
}

export interface UpdateAreaInput {
    name?: string
    active?: boolean
}

export interface AreaResponse {
    success: boolean
    data?: Area
    error?: string
}

export interface AreasListResponse {
    success: boolean
    data?: Area[]
    error?: string
}



export interface CreateTableInput {
    tableNumber: string
    capacity: number
    areaId: string
    status?: "ACTIVE" | "INACTIVE"
}

export interface UpdateTableInput {
    tableNumber?: string
    capacity?: number
    areaId?: string
    status?: "ACTIVE" | "INACTIVE"
}

export interface TableResponse {
    success: boolean
    data?: Table
    error?: string
}

export interface TablesListResponse {
    success: boolean
    data?: (Table & { area: Area })[]
    error?: string
}


export interface CreateReservationInput {
    name: string
    email: string
    phone: string
    date: Date
    fromTime: string
    endTime: string
    partySize: number
    preferredArea: string
    specialRequest: string
    status: "PENDING" | "CONFIRMED" | "CANCELLED"
    source: "ONLINE" | "PHONE" | "WALK_IN" | "PARTNER"
    tableIds?: string[]
    payment?: {
        paidAmount: number
        totalAmount: number
        currency: string
        paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
        method: string
    }
    timezone?: string
}

export interface UpdateReservationInput {
    name?: string
    email?: string
    phone?: string
    date?: Date
    fromTime?: string
    endTime?: string
    partySize?: number
    preferredArea?: string
    specialRequest?: string
    status?: "PENDING" | "CONFIRMED" | "CANCELLED"
    tableIds?: string[]
    payment?: {
        paidAmount?: number
        totalAmount?: number
        currency?: string
        paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
        method?: string
    }
}

export type ReservationUp = Prisma.ReservationGetPayload<{
    include: {
        payment: true;
        table_reservations: {
            include: { table: true };
        };
    };
}>;

export interface ReservationsListResponse {
    success: boolean
    data?: ReservationUp[]
    error?: string
}

export type ReservationPayment = (Payment & {
    reservation: Pick<Reservation, "customer_name" | "customer_email" | "status">
})

export interface ReservationsPaymentsListResponse {
    success: boolean
    data?: ReservationPayment[]
    error?: string
}

export interface ReservationStatsResponse {
    success: boolean
    data?: {
        total: number
        confirmed: number
        pending: number
        cancelled: number
        checkedIn: number
    }
    error?: string
}
