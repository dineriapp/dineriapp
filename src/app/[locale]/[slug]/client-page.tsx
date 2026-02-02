"use client"

import SocialIcons from "@/components/social-icons"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getLucideIconBySlug } from "@/lib/get-icons"
import { cn } from "@/lib/utils"
import { OpeningHoursData, ReviewsInfo } from "@/types"
import type { Event, Faq, FaqCategory, MenuCategory, MenuItem, Link as PrismaLink, Restaurant, User } from "@prisma/client"
import {
    ArrowRight,
    Calendar,
    ExternalLink,
    MenuIcon,
    MoreVertical,
    UtensilsCrossed
} from "lucide-react"
import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { FAQSection } from "./_components/faq-section"
import { GoogleRating } from "./_components/google-rating"
import { OpeningHoursDialog } from "./_components/opening-hours-dialog"
import { OpeningHoursStatus } from "./_components/opening-hours-status"
import { WelcomePopup } from "./_components/welcome-popup"
import { MenuItems } from "./menu-items"
import { SettingsState } from "../(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types"
import { itemSlugPage } from "@/lib/reuseable-data"

// Define the complete types with relations using Prisma types
type RestaurantWithRelations = Restaurant & {
    links: PrismaLink[]
    menuCategories: (MenuCategory & {
        items: MenuItem[]
    })[]
    events: Event[]
    user: User
    faqCategories: (FaqCategory & {
        faqs: Faq[]
    })[]
    reservation_settings: { settings: SettingsState }
}



interface ClientPageProps {
    restaurant: RestaurantWithRelations
    reviewsInfo: ReviewsInfo
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}


const trackLinkClick = async (linkId: string) => {
    try {
        await fetch("/api/links/track-view", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ linkId }),
        })
    } catch (error) {
        console.error("Error tracking link click:", error)
    }
}

export default function ClientPage({ restaurant, reviewsInfo }: ClientPageProps) {
    const pathname = usePathname()
    const isMenuPage = pathname.endsWith("/menu")
    const hasTracked = useRef(false);
    const t = useTranslations("slug_page")
    const e = useTranslations("events_dialog")
    const m = useTranslations("menu_dialog")
    const [showMenuDialog, setShowMenuDialog] = useState(false)
    const [showEventsDialog, setShowEventsDialog] = useState(false)
    const [showFAQDialog, setShowFAQDialog] = useState(false)
    const [showWelcomePopup, setShowWelcomePopup] = useState(false)
    const [showOpeningHoursDialog, setShowOpeningHoursDialog] = useState(false)
    const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>("all")

    // Parse JSON fields
    const openingHours = restaurant.opening_hours ? (restaurant.opening_hours as OpeningHoursData) : null

    const welcomePopupShowInfo = restaurant.welcome_popup_show_info
        ? (restaurant.welcome_popup_show_info as { ratings: boolean; address: boolean; hours: boolean; phone: boolean })
        : { ratings: true, address: true, hours: true, phone: true }

    useEffect(() => {
        // Show welcome popup after component mounts
        const timer = setTimeout(
            () => {
                const dismissed = localStorage.getItem(`welcome-popup-${restaurant.slug}`)
                if (!dismissed && restaurant.welcome_popup_enabled) {
                    setShowWelcomePopup(true)
                }
            },
            (restaurant.welcome_popup_delay || 2) * 1000,
        )

        return () => clearTimeout(timer)
    }, [restaurant.slug, restaurant.welcome_popup_enabled, restaurant.welcome_popup_delay])



    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.style.display = "none"
        const fallback = e.currentTarget.parentElement?.querySelector(".fallback-initial")
        if (fallback) {
            fallback.classList.remove("hidden")
        }
    }

    const getBackgroundStyle = () => {
        if (restaurant.bg_type === "image" && restaurant.bg_image_url) {
            return {
                backgroundImage: `url(${restaurant.bg_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }
        }

        if (restaurant.bg_type === "gradient" && restaurant.bg_gradient_start && restaurant.bg_gradient_end) {
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
                backgroundImage: `linear-gradient(${directionMap[restaurant.gradient_direction] || "to bottom right"}, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`,
            }
        }

        return { backgroundColor: restaurant.bg_color || "#ffffff" }
    }


    const headingsColor = restaurant.headings_text_color || "#ffffff"
    const buttonTextColor = restaurant.button_text_icons_color || "#000000"


    useEffect(() => {
        if (!hasTracked.current) {
            hasTracked.current = true;

            fetch(`/api/restaurants/${restaurant.id}/track-view`, {
                method: "POST",
            });
        }
    }, [restaurant.id]);

    // Get filtered menu items based on selected category
    const getFilteredMenuItems = () => {
        if (selectedMenuCategory === "all") {
            return restaurant.menuCategories.filter(c => c.show_in_quick_menu).flatMap((category) =>
                category.items.filter(itm => itm.show_in_quick_menu).map((item) => ({ ...item, categoryName: category.name })),
            )
        }

        const category = restaurant.menuCategories.filter(c => c.show_in_quick_menu).find((cat) => cat.id === selectedMenuCategory)
        return category ? category.items.filter(itm => itm.show_in_quick_menu).map((item) => ({ ...item, categoryName: category.name })) : []
    }

    const filteredMenuItems = getFilteredMenuItems()

    const bookingDisabled =
        restaurant?.reservation_settings?.settings?.restaurantSettings?.pause_new_reservations === true ||
        restaurant?.reservation_settings?.settings?.restaurantSettings?.emergency_closure === true;

    const hasMenuItems =
        restaurant.menuCategories?.some(
            (category) => category.items && category.items.length > 0
        )
    const hasFaqsItems =
        restaurant.faqCategories?.some(
            (category) => category.faqs && category.faqs.length > 0
        )


    return (
        <div className="relative flex min-h-screen flex-col" style={getBackgroundStyle()}>
            <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
                style={{
                    background:
                        restaurant.bg_type === "gradient"
                            ? `linear-gradient(to bottom, transparent, ${restaurant.bg_gradient_end})`
                            : restaurant.bg_type === "image"
                                ? "linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))"
                                : `linear-gradient(to bottom, transparent, ${restaurant.bg_color || "#ffffff"})`,
                }}
            />

            <div className="container relative mx-auto flex max-w-[570px] flex-grow flex-col px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center"
                >
                    {restaurant.logo_url ? (
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            src={restaurant.logo_url}
                            alt={restaurant.name}
                            onError={handleImageError}
                            className="mb-5 h-24 w-24 rounded-full object-cover"
                            loading="eager"
                        />
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="mb-5 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ring-white/20 fallback-initial"
                            style={{ backgroundColor: restaurant.accent_color || "#10b981" }}
                        >
                            <span className="text-2xl font-bold text-white">{restaurant.name.charAt(0)}</span>
                        </motion.div>
                    )}

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-3 text-2xl font-bold"
                        style={{
                            color: headingsColor,
                            fontFamily: restaurant.font_family || "Inter",
                        }}
                    >
                        {restaurant.name}
                    </motion.h2>

                    {/* Opening Hours Status */}
                    {openingHours && restaurant.timezone && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mb-4"
                        >
                            <OpeningHoursStatus
                                openingHours={openingHours}
                                restaurentTimeZone={restaurant.timezone || ""}
                                color={restaurant.headings_text_color || "#000000"}
                                className="text-white cursor-pointer text-center"
                                accentColor={restaurant.headings_text_color || "#10b981"}
                                onClick={() => setShowOpeningHoursDialog(true)}
                            />
                        </motion.div>
                    )}

                    {restaurant.google_place_id && restaurant?.user?.subscription_plan !== "basic" && (
                        <motion.a
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            target="_blank"
                            href={`https://search.google.com/local/reviews?placeid=${restaurant.google_place_id}`}
                            className="mb-4"
                        >
                            <GoogleRating info={reviewsInfo}
                                color={restaurant.headings_text_color || "#000000"}
                                className="text-white" />
                        </motion.a>
                    )}

                    {restaurant.bio && (
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mx-auto mb-4 sm:mb-6 max-w-md text-sm"
                            style={{
                                color: headingsColor,
                                fontFamily: restaurant.font_family || "Inter",
                                opacity: 0.9,
                            }}
                        >
                            {restaurant.bio}
                        </motion.p>
                    )}

                    {(restaurant.instagram ||
                        restaurant.facebook ||
                        restaurant.email ||
                        restaurant.address ||
                        restaurant.whatsapp) &&
                        restaurant.social_icons_position === "top" &&
                        <SocialIcons
                            restaurant={
                                {
                                    address: restaurant?.address,
                                    email: restaurant.email,
                                    facebook: restaurant.facebook,
                                    instagram: restaurant.facebook,
                                    whatsapp: restaurant.whatsapp,
                                    tiktok: restaurant.tiktok
                                }
                            }
                            className="mb-4 sm:mb-8"
                            theme={{
                                socialIconColor: restaurant.social_icon_color,
                                socialIconBgShow: restaurant.social_icon_bg_show,
                                socialIconBgColor: restaurant.social_icon_bg_color,
                                social_icon_gap: restaurant.social_icon_gap
                            }}
                        />
                    }
                </motion.div>

                <motion.div variants={container} initial="hidden" animate="show" className="flex-grow flex flex-col"
                    style={{ rowGap: `${restaurant.buttons_gap_in_px}px` }}
                >
                    {!bookingDisabled && restaurant?.user?.subscription_plan !== "basic" &&
                        <motion.a
                            variants={itemSlugPage}
                            href={`/${restaurant.slug}/reservation`}
                            target="_blank"
                            rel="noopener noreferrer"
                            // onClick={() => trackLinkClick(link.id)}
                            className={`group flex items-center justify-center  text-center  w-full h-[52px] sm:h-[64px] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant?.button_icons_show ? "px-14 sm:px-16" : "px-4"} ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor:
                                    restaurant.button_variant === "solid"
                                        ? restaurant.accent_color || "#10b981"
                                        : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color || "#10b981"}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? buttonTextColor : restaurant.accent_color || "#10b981",
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="flex aspect-square absolute left-[7px] sm:left-[9px] shrink-0 size-[38px] sm:!size-[46px] items-center justify-center rounded-full "
                                    style={{
                                        backgroundColor: restaurant.button_text_icons_color || "transparent"
                                    }}
                                >
                                    <UtensilsCrossed style={{ color: restaurant.accent_color || "transparent" }} className="w-4 sm:w-5 h-4 sm:h-5" />
                                </div>
                            }
                            <span
                                className={`relative w-full text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                                style={{
                                    color:
                                        restaurant.button_variant === "outline" ? restaurant.accent_color || "#10b981" : buttonTextColor,
                                }}
                            >
                                {t("reserve_table")}{restaurant.reservation_settings?.settings?.deposit_settings?.depositSystemEnabled ? `${restaurant.reservation_settings?.settings?.deposit_settings?.depositAmount}${restaurant.reservation_settings?.settings?.deposit_settings?.depositCurrency}` : "NO"}
                            </span>
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                    <MoreVertical className="size-4" />
                                </div>
                            }
                        </motion.a>
                    }
                    {restaurant.links.map((link) => (
                        <motion.a
                            key={link.id}
                            variants={itemSlugPage}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackLinkClick(link.id)}
                            className={`group flex items-center justify-center  text-center  w-full h-[52px] sm:h-[64px] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant?.button_icons_show ? "px-14 sm:px-16" : "px-4"} ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor:
                                    restaurant.button_variant === "solid"
                                        ? restaurant.accent_color || "#10b981"
                                        : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color || "#10b981"}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? buttonTextColor : restaurant.accent_color || "#10b981",
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="flex aspect-square absolute left-[7px] sm:left-[9px] shrink-0 size-[38px] sm:!size-[46px] items-center justify-center rounded-full "
                                    style={{
                                        backgroundColor: restaurant.button_text_icons_color || "transparent"
                                    }}
                                >
                                    {getLucideIconBySlug(link.icon_slug, { className: "w-4 sm:w-5 h-4 sm:h-5", style: { color: restaurant.accent_color || "transparent" } })}
                                </div>
                            }
                            <span
                                className={`relative w-full text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                                style={{
                                    color:
                                        restaurant.button_variant === "outline" ? restaurant.accent_color || "#10b981" : buttonTextColor,
                                }}
                            >
                                {link.title}
                            </span>
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                    <MoreVertical className="size-4" />
                                </div>
                            }
                        </motion.a>
                    ))}



                    {restaurant.menuCategories.length > 0 && !isMenuPage && hasMenuItems && (
                        <motion.button
                            variants={itemSlugPage}
                            onClick={() => setShowMenuDialog(true)}
                            className={`group flex items-center justify-center  text-center ${restaurant?.button_icons_show ? "px-14 sm:px-16" : "px-4"} w-full h-[52px] sm:h-[64px] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor:
                                    restaurant.button_variant === "solid"
                                        ? restaurant.accent_color || "#10b981"
                                        : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color || "#10b981"}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? buttonTextColor : restaurant.accent_color || "#10b981",
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="flex aspect-square absolute left-[7px] sm:left-[9px] shrink-0 size-[38px] sm:!size-[46px] items-center justify-center rounded-full "
                                    style={{
                                        backgroundColor: restaurant.button_text_icons_color || "transparent"
                                    }}
                                >
                                    {getLucideIconBySlug("menu", { className: "w-4 sm:w-5 h-4 sm:h-5", style: { color: restaurant.accent_color || "transparent" } })}
                                </div>
                            }
                            <span
                                className={`relative w-full text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                                style={{
                                    color:
                                        restaurant.button_variant === "outline" ? restaurant.accent_color || "#10b981" : buttonTextColor,
                                }}
                            >

                                {t("menu")}
                            </span>
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                    <MoreVertical className="size-4" />
                                </div>
                            }
                        </motion.button>
                    )}

                    {restaurant.events.length > 0 && (
                        <motion.button
                            variants={itemSlugPage}
                            onClick={() => setShowEventsDialog(true)}
                            className={`group flex items-center justify-center  text-center ${restaurant?.button_icons_show ? "px-14 sm:px-16" : "px-4"} w-full h-[52px] sm:h-[64px] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor:
                                    restaurant.button_variant === "solid"
                                        ? restaurant.accent_color || "#10b981"
                                        : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color || "#10b981"}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? buttonTextColor : restaurant.accent_color || "#10b981",
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="flex aspect-square absolute left-[7px] sm:left-[9px] shrink-0 size-[38px] sm:!size-[46px] items-center justify-center rounded-full "
                                    style={{
                                        backgroundColor: restaurant.button_text_icons_color || "transparent"
                                    }}
                                >
                                    {getLucideIconBySlug("events", { className: "w-4 sm:w-5 h-4 sm:h-5", style: { color: restaurant.accent_color || "transparent" } })}
                                </div>
                            }
                            <span
                                className={`relative w-full text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                                style={{
                                    color:
                                        restaurant.button_variant === "outline" ? restaurant.accent_color || "#10b981" : buttonTextColor,
                                }}
                            >
                                {t("events")}
                            </span>
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                    <MoreVertical className="size-4" />
                                </div>
                            }
                        </motion.button>
                    )}

                    {/* FAQ Button - Always show if there are FAQ categories */}
                    {restaurant.faqCategories.length > 0 && hasFaqsItems && (
                        <motion.button
                            variants={itemSlugPage}
                            onClick={() => setShowFAQDialog(true)}
                            className={`group flex items-center justify-center  text-center ${restaurant?.button_icons_show ? "px-14 sm:px-16" : "px-4"} w-full h-[52px] sm:h-[64px] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor:
                                    restaurant.button_variant === "solid"
                                        ? restaurant.accent_color || "#10b981"
                                        : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color || "#10b981"}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? buttonTextColor : restaurant.accent_color || "#10b981",
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >

                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="flex aspect-square absolute left-[7px] sm:left-[9px] shrink-0 size-[38px] sm:!size-[46px] items-center justify-center rounded-full "
                                    style={{
                                        backgroundColor: restaurant.button_text_icons_color || "transparent"
                                    }}
                                >
                                    {getLucideIconBySlug("faq", { className: "w-4 sm:w-5 h-4 sm:h-5", style: { color: restaurant.accent_color || "transparent" } })}
                                </div>
                            }
                            <span
                                className={`relative w-full text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                                style={{
                                    color:
                                        restaurant.button_variant === "outline" ? restaurant.accent_color || "#10b981" : buttonTextColor,
                                }}
                            >

                                {t("faq")}
                            </span>
                            {
                                restaurant?.button_icons_show
                                &&
                                <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                    <MoreVertical className="size-4" />
                                </div>
                            }

                        </motion.button>
                    )}

                    {restaurant.links.length === 0 && !restaurant.menuCategories.length && !restaurant.events.length && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-8 text-center"
                            style={{ color: headingsColor, opacity: 0.7 }}
                        >

                            {t("no_links_added")}
                        </motion.div>
                    )}

                    {(restaurant.instagram ||
                        restaurant.facebook ||
                        restaurant.email ||
                        restaurant.address ||
                        restaurant.whatsapp) &&
                        restaurant.social_icons_position === "bottom"
                        &&
                        <SocialIcons
                            restaurant={
                                {
                                    address: restaurant?.address,
                                    email: restaurant.email,
                                    facebook: restaurant.facebook,
                                    instagram: restaurant.facebook,
                                    whatsapp: restaurant.whatsapp,
                                }
                            }
                            className="mb-4 sm:mb-8"
                            theme={{
                                socialIconColor: restaurant.social_icon_color,
                                socialIconBgShow: restaurant.social_icon_bg_show,
                                socialIconBgColor: restaurant.social_icon_bg_color,
                                social_icon_gap: restaurant.social_icon_gap
                            }}
                        />
                    }
                </motion.div>

                {/* Opening Hours Dialog */}
                {openingHours && restaurant.timezone
                    &&
                    <OpeningHoursDialog
                        isOpen={showOpeningHoursDialog}
                        onClose={() => setShowOpeningHoursDialog(false)}
                        openingHours={openingHours}
                        restaurentTimeZone={restaurant.timezone || ""}
                        restaurantName={restaurant.name}
                        accentColor={restaurant.accent_color || "#10b981"}
                    />
                }

                {/* Enhanced Menu Dialog */}
                <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}

                >
                    <DialogContent
                        style={{
                            backgroundColor: restaurant.bgColor
                        }}
                        closeIconColor={restaurant.textColor}
                        className="max-h-[90vh] max-w-[90vw] border-transparent no-scroll sm:!max-w-[570px] overflow-hidden overflow-y-auto">
                        <DialogHeader className="pb-1">
                            <DialogTitle
                                style={{ color: restaurant.textColor }}
                                className="flex items-center text-start gap-2 text-xl">
                                <MenuIcon className="h-6 w-6" />
                                <span>
                                    {m("title")}
                                </span>
                            </DialogTitle>
                            <DialogDescription
                                style={{ color: restaurant.textColor }}
                                className="text-base text-start">
                                {m("description")}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Category Tabs */}
                        <div className="relative mb-0 flex items-center ">
                            <div className="flex gap-2 overflow-x-auto no-scroll max-w-[70vw] sm:!max-w-[430px]">
                                {/* All Items Tab */}
                                <Button
                                    variant={selectedMenuCategory === "all" ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => setSelectedMenuCategory("all")}
                                    style={{
                                        backgroundColor: selectedMenuCategory === "all" ? restaurant.tabsButtonBG : restaurant.tabsButtonDefault,
                                        color: selectedMenuCategory === "all" ? restaurant.tabsTextColor : restaurant.tabsTextDefaultColor,
                                    }}
                                    className={cn(
                                        "whitespace-nowrap cursor-pointer !text-sm flex-shrink-0 h-10 px-4 rounded-full font-medium transition-all duration-200",
                                        selectedMenuCategory === "all" ? "shadow-md" : ""
                                    )}
                                >
                                    <span className="flex items-center  gap-2">
                                        <span className="">
                                            {m("all_items_tab")}
                                        </span>
                                        <span
                                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                            style={{
                                                backgroundColor: selectedMenuCategory === "all" ? restaurant.tabsTextColor : restaurant.tabsTextDefaultColor,
                                                color: selectedMenuCategory === "all" ? restaurant.tabsButtonBG : restaurant.tabsButtonDefault,
                                            }}
                                        >
                                            {restaurant.menuCategories.filter(c => c.show_in_quick_menu).flatMap((category) =>
                                                category.items.filter(itm => itm.show_in_quick_menu)
                                            ).length}
                                        </span>
                                    </span>
                                </Button>
                                {/* Category Tabs */}
                                {restaurant.menuCategories.filter(cat => cat.items.filter(i => i.show_in_quick_menu).length !== 0).map((category) => {
                                    if (!category.show_in_quick_menu) return null

                                    return <div className="keen-slider__slide !w-auto !min-w-fit" key={category.id}>
                                        <Button
                                            key={category.id}
                                            variant={selectedMenuCategory === category.id ? "default" : "outline"}
                                            size="lg"
                                            onClick={() => setSelectedMenuCategory(category.id)}
                                            className={cn(
                                                "whitespace-nowrap cursor-pointer !text-sm flex-shrink-0 h-10 px-4 rounded-full font-medium transition-all duration-200",
                                                selectedMenuCategory === category.id ? "shadow-md" : ""
                                            )}
                                            style={{
                                                backgroundColor: selectedMenuCategory === category.id ? restaurant.tabsButtonBG : restaurant.tabsButtonDefault,
                                                color: selectedMenuCategory === category.id ? restaurant.tabsTextColor : restaurant.tabsTextDefaultColor,
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{category.name}</span>
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: selectedMenuCategory === category.id ? restaurant.tabsTextColor : restaurant.tabsTextDefaultColor,
                                                        color: selectedMenuCategory === category.id ? restaurant.tabsButtonBG : restaurant.tabsButtonDefault,
                                                    }}
                                                >
                                                    {restaurant.menuCategories.find((cat) => cat.id === category.id)?.items?.filter(item => item.show_in_quick_menu).length}
                                                </span>
                                            </span>
                                        </Button>
                                    </div>
                                })}
                            </div>

                            {/* View More Button */}
                            <div className="absolute w-[180px] flex justify-end right-0 bottom-0 items-center">
                                <div
                                    className="w-fit  flex items-center justify-end"
                                    style={{
                                        background: `linear-gradient(to left, ${restaurant.bgColor} 80%, transparent 100%)`
                                    }}
                                >
                                    <Link
                                        href={`/${restaurant.slug}/menu`}
                                        className="flex items-center gap-1 px-4 py-[12px] shadow-md text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md"
                                        style={{
                                            backgroundColor: restaurant.tabsButtonDefault,
                                            color: restaurant.tabsTextDefaultColor,
                                        }}
                                        onClick={() => setShowMenuDialog(false)}
                                    >
                                        <span>
                                            {m("all_items_tab")}
                                        </span>
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="overflow-y-auto  max-h-[52vh] pr-2 ">
                            <MenuItems
                                restaurant={restaurant}
                                items={filteredMenuItems}
                                searchQuery={""}
                                restaurantSlug={restaurant.slug}
                                selectedCategory={selectedMenuCategory}
                            />
                        </div>

                        {/* Footer with full menu link */}
                        <div className="pt-2 border-t border-black/30 mt-2">
                            <Link
                                href={`/${restaurant.slug}/menu`}
                                className="w-full flex items-center justify-center  gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                                style={{
                                    backgroundColor: restaurant.tabsButtonBG,
                                    color: restaurant.tabsTextColor,
                                }}
                                onClick={() => setShowMenuDialog(false)}
                            >
                                <MenuIcon className="h-4 w-4" />
                                <span>
                                    {m("view_full_menu_button")}
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Events Dialog */}
                <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog} >
                    <DialogContent closeIconColor={restaurant.accent_color || "#10b981"} className="max-h-[90vh] max-w-[90vw] sm:!max-w-[570px] border-transparent no-scroll overflow-y-auto" style={{ ...getBackgroundStyle() }}>
                        <DialogHeader>
                            <DialogTitle className="flex text-start items-center gap-2">
                                <Calendar className="h-5 w-5" style={{ color: restaurant.accent_color || "#10b981" }} />
                                <span style={{ color: restaurant.accent_color || "#10b981" }}>
                                    {e("title")}
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-start" style={{ color: restaurant.accent_color || "#10b981" }}>

                                {
                                    restaurant.events.length === 1 ?
                                        <>
                                            {e("description_singular", { count: restaurant.events.length })}
                                        </>
                                        :
                                        <>
                                            {e("description_plural", { count: restaurant.events.length })}
                                        </>
                                }
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {restaurant.events.map((event) => (
                                <div key={event.id} className="border-b pb-6 last:border-0 last:pb-0" style={{ borderColor: restaurant.headings_text_color || "white" }}>
                                    <h3 className="mb-1 text-lg font-semibold" style={{ color: restaurant.accent_color || "#10b981" }}>{event.title}</h3>
                                    {event.description &&
                                        <p
                                            className="mb-4 text-[15px] text-muted-foreground opacity-80"
                                            style={{ color: restaurant.accent_color || "#10b981" }}
                                        >
                                            {event.description}
                                        </p>
                                    }
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" style={{ color: restaurant.accent_color || "#10b981" }} />
                                        <span style={{ color: restaurant.accent_color || "#10b981" }}>
                                            {new Date(event.date).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    {event.ticket_url && (
                                        <div className="mt-4">
                                            <a
                                                href={event.ticket_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-transform hover:scale-105"
                                                style={{ backgroundColor: restaurant.accent_color || "#10b981", color: restaurant.button_text_icons_color || "white" }}
                                            >
                                                {e("get_tickets_button")}
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* FAQ Dialog */}
                <Dialog open={showFAQDialog} onOpenChange={setShowFAQDialog}>
                    <DialogContent className="max-h-[90vh] no-scroll max-w-[90vw] sm:!max-w-[570px] overflow-y-auto border-transparent" >
                        <FAQSection faqCategories={restaurant.faqCategories} cardstextColor={restaurant.button_text_icons_color || "black"} accentColor={restaurant.accent_color || "#10b981"} />
                    </DialogContent>
                </Dialog>

                {restaurant?.user?.subscription_plan === "basic" && <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 pb-6 text-center"
                >
                    <p className="text-xs" style={{ color: headingsColor, opacity: 0.7 }}>
                        {" "}
                        {t("powered_by")}{" "}
                        <Link href="/" className="hover:underline" style={{ color: restaurant.accent_color || "#10b981" }}>
                            dineri.app
                        </Link>
                    </p>
                </motion.footer>}
            </div>

            {/* Welcome Popup */}
            <WelcomePopup
                restaurant={restaurant}
                isOpen={showWelcomePopup}
                RatingInfo={reviewsInfo}
                onClose={() => setShowWelcomePopup(false)}
                upcomingEvents={restaurant.events}
                welcomePopupShowInfo={welcomePopupShowInfo}
            />
        </div>
    )
}
