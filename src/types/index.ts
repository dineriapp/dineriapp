import { SettingsState } from "@/app/[locale]/(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types";
import type { Event, Faq, FaqCategory, MenuCategory, MenuItem, Link as PrismaLink, User } from "@prisma/client";
import { Restaurant } from "@prisma/client";

export type RestaurantWithCount = Restaurant & {
    _count: {
        restaurantViews: number;
        links: number
        faqCategories: number
        menuCategories: number
        events: number
    };
    reservation_settings: { settings: SettingsState }
};

export type GetRestaurantsResponse = {
    restaurants: RestaurantWithCount[];
    error: string;
};

export type ReviewsInfo = { rating: number; user_ratings_total: number } | null

export interface OpeningHoursData {
    [key: string]: {
        open: string
        close: string
        closed: boolean
    }
}


export type RestaurantWithRelations = Restaurant & {
    links: PrismaLink[]
    menuCategories: (MenuCategory & {
        items: MenuItem[]
    })[]
    events: Event[]
    user: User
    faqCategories: (FaqCategory & {
        faqs: Faq[]
    })[]
}

export type StylesDataType = {
    background: {
        backgroundImage: string;
        backgroundSize: string;
        backgroundPosition: string;
    };
    headerBg: string;
    headerText: string;
    headerCartButtonBG: string;
    headerCartButtonBorder: string;
    headerCartButtonCountBG: string;
    headerCartButtonCountBorder: string;
    textColor: string;
    bgColor: string;
    infoIconsColor: string;
    tabsButtonBG: string;
    tabsButtonDefault: string;
    tabsBorderColor: string;
    tabsTextColor: string;
    tabsTextDefaultColor: string;
    cardsBG: string;
    cardsText: string;
    cardsBadgesBg: string;
    cardsBadgesTextColor: string;
};


export interface PopupFormData {
    welcome_popup_enabled: boolean
    welcome_popup_message: string
    welcome_popup_delay: number
    welcome_popup_show_button: boolean
    welcome_popup_show_info: {
        ratings: boolean
        address: boolean
        hours: boolean
        phone: boolean
    }
    menu_popup_enabled: boolean
    menu_popup_message: string
    menu_popup_delay: number
    menu_popup_show_button: boolean
    menu_popup_show_info: {
        ratings: boolean
        address: boolean
        hours: boolean
        phone: boolean
    }
    event_announcements_enabled: boolean
    event_announcement_days: number
    max_events_in_popup: number
    event_rotation_speed: number
}