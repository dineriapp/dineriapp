"use client"

import SocialIcons from "@/components/social-icons"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getLucideIconBySlug } from "@/lib/get-icons"
import { OpeningHoursData, ReviewsInfo } from "@/types"
import type { Event, Faq, FaqCategory, MenuCategory, MenuItem, Link as PrismaLink, Restaurant, User } from "@prisma/client"
import {
    AlertTriangle,
    ArrowRight,
    Calendar,
    ExternalLink,
    HelpCircle,
    Leaf,
    MenuIcon,
    MoreVertical
} from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { FAQSection } from "./_components/faq-section"
import { GoogleRating } from "./_components/google-rating"
import { OpeningHoursDialog } from "./_components/opening-hours-dialog"
import { OpeningHoursStatus } from "./_components/opening-hours-status"
import { WelcomePopup } from "./_components/welcome-popup"

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

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
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
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${restaurant.bg_image_url})`,
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
            return restaurant.menuCategories.flatMap((category) =>
                category.items.map((item) => ({ ...item, categoryName: category.name })),
            )
        }

        const category = restaurant.menuCategories.find((cat) => cat.id === selectedMenuCategory)
        return category ? category.items.map((item) => ({ ...item, categoryName: category.name })) : []
    }

    const filteredMenuItems = getFilteredMenuItems()


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
                    {openingHours && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mb-4"
                        >
                            <OpeningHoursStatus
                                openingHours={openingHours}
                                color={restaurant.headings_text_color || "#000000"}
                                className="text-white cursor-pointer text-center"
                                accentColor={restaurant.accent_color || "#10b981"}
                                onClick={() => setShowOpeningHoursDialog(true)}
                            />
                        </motion.div>
                    )}

                    {restaurant.google_place_id && restaurant?.user?.subscription_plan !== "basic" && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mb-4"
                        >
                            <GoogleRating info={reviewsInfo}
                                color={restaurant.headings_text_color || "#000000"}
                                className="text-white" />
                        </motion.div>
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
                    {restaurant.links.map((link) => (
                        <motion.a
                            key={link.id}
                            variants={item}
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

                    {restaurant.menuCategories.length > 0 && !isMenuPage && (
                        <motion.button
                            variants={item}
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
                                Menu
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
                            variants={item}
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
                                Events
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
                    {restaurant.faqCategories.length > 0 && (
                        <motion.button
                            variants={item}
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
                                FAQ
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
                            No links added yet
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
                <OpeningHoursDialog
                    isOpen={showOpeningHoursDialog}
                    onClose={() => setShowOpeningHoursDialog(false)}
                    openingHours={openingHours}
                    restaurantName={restaurant.name}
                    accentColor={restaurant.accent_color || "#10b981"}
                />

                {/* Menu Dialog */}
                {/* <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
                    <DialogContent className="max-h-[90vh] max-w-[90vw] sm:!max-w-[570px] w-full overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex text-start items-center justify-start gap-4">
                                <div className="flex items-center gap-2">
                                    <MenuIcon
                                        className="h-5 w-5"
                                        style={{ color: restaurant.accent_color || '#10b981' }}
                                    />
                                    <span>Menu</span>
                                </div>
                            </DialogTitle>
                            <DialogDescription className="text-start">
                                {restaurant.menuCategories.length > 0 && (
                                    <>
                                        Last updated{" "}
                                        {new Date(
                                            Math.max(...restaurant.menuCategories.map((cat) => new Date(cat.updatedAt).getTime())),
                                        ).toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-8 py-2">
                            {restaurant.menuCategories.map((category) => (
                                <div key={category.id} className="space-y-3">
                                    <div>
                                        <h3 className="text-xl leading-[1.3] font-semibold text-gray-900">{category.name}</h3>
                                        {category.description && (
                                            <p className="mb-2 mt-1 text-sm text-muted-foreground">{category.description}</p>
                                        )}
                                    </div>
                                    <div className="w-full border-b" />
                                    <div className="space-y-2">
                                        {category.items?.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border border-gray-200 px-3 py-4 shadow-sm bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                                            >
                                                <div className="space-y-1 w-full sm:w-auto">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-base font-medium text-gray-900">{item.name}</span>

                                                        {item.is_halal && (
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                                                                title="Halal"
                                                            >
                                                                <Leaf className="h-3 w-3" />
                                                                Halal
                                                            </span>
                                                        )}

                                                        {item.allergens?.length > 0 && (
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                                                                title={`Contains: ${item.allergens.join(', ')}`}
                                                            >
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Allergens
                                                            </span>
                                                        )}
                                                    </div>

                                                    {item.description && (
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    )}

                                                    {item.allergen_info && (
                                                        <p className="text-xs italic text-yellow-700">{item.allergen_info}</p>
                                                    )}
                                                </div>

                                                <div className="text-sm sm:text-base font-semibold text-gray-800">
                                                    &euro;{item.price.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog> */}
                {/* Enhanced Menu Dialog */}
                <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
                    <DialogContent closeIconColor={restaurant.accent_color || "#10b981"} style={{ ...getBackgroundStyle() }} className="max-h-[90vh] max-w-[90vw] border-transparent no-scroll sm:!max-w-[570px] overflow-hidden overflow-y-auto">
                        <DialogHeader className="pb-1">
                            <DialogTitle className="flex items-center text-start gap-2 text-xl">
                                <MenuIcon className="h-6 w-6" style={{ color: restaurant.accent_color || "#10b981" }} />
                                <span style={{ color: restaurant.accent_color || "#10b981" }}>Menu</span>
                            </DialogTitle>
                            <DialogDescription style={{ color: restaurant.accent_color || "#10b981" }} className="text-base text-start">
                                Browse our delicious menu items organized by category
                            </DialogDescription>
                        </DialogHeader>

                        {/* Category Tabs */}
                        <div className="relative mb-0 flex items-center ">
                            <div className="flex gap-0 overflow-x-auto no-scroll max-w-[70vw] sm:!max-w-[430px]">
                                {/* All Items Tab */}
                                <button
                                    onClick={() => setSelectedMenuCategory("all")}
                                    className={`flex-shrink-0 px-3 cursor-pointer border-b py-2 text-sm font-medium transition-all duration-200 ${selectedMenuCategory === "all"
                                        ? ""
                                        : "hover:opacity-70"
                                        }`}
                                    style={{
                                        color: restaurant.accent_color || "#10b981",
                                        borderColor: selectedMenuCategory === "all" ? `${restaurant.accent_color || "#10b981"}` : "transparent",
                                    }}
                                >
                                    All ({restaurant.menuCategories.reduce((sum, cat) => sum + cat.items.length, 0)})
                                </button>
                                {/* Category Tabs */}
                                {restaurant.menuCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedMenuCategory(category.id)}
                                        className={`flex-shrink-0 px-3 cursor-pointer border-b py-2 text-sm font-medium transition-all duration-200 ${selectedMenuCategory === category.id
                                            ? ""
                                            : "hover:opacity-70"
                                            }`}
                                        style={{
                                            color: restaurant.accent_color || "#10b981",
                                            borderColor: selectedMenuCategory === category.id ? `${restaurant.accent_color || "#10b981"}` : "transparent",
                                        }}
                                    >
                                        {category.name} ({category.items.length})
                                    </button>
                                ))}
                            </div>

                            {/* View More Button */}
                            <div className="absolute w-[180px] flex justify-end right-0 bottom-0 items-center">
                                <div
                                    className="w-[120px] h-full  flex items-center justify-end"
                                >
                                    <Link
                                        href={`/${restaurant.slug}/menu`}
                                        className="flex items-center gap-1 px-4 py-[11px] text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md"
                                        style={{
                                            backgroundColor: restaurant.accent_color || "#10b981",
                                            color: restaurant.button_text_icons_color || "white",
                                        }}
                                        onClick={() => setShowMenuDialog(false)}
                                    >
                                        <span>View More</span>
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="overflow-y-auto max-h-[60vh] pr-2">
                            {filteredMenuItems.length > 0 ? (
                                <div className="space-y-6">
                                    {selectedMenuCategory === "all" ? (
                                        // Group by category when showing all items
                                        restaurant.menuCategories.map((category) => (
                                            <div key={category.id} className="space-y-4">
                                                <div style={{
                                                    color: restaurant.accent_color || "#10b981",
                                                    borderColor: restaurant.accent_color || "#10b981"
                                                }} className="flex items-center gap-2 pb-2 border-b ">
                                                    <h3 className="text-lg font-semibold ">{category.name}</h3>
                                                    <span className="text-sm opacity-80">({category.items.length} items)</span>
                                                </div>
                                                {category.description && (
                                                    <p className="text-sm  -mt-2 mb-4 opacity-80"
                                                        style={{
                                                            color: restaurant.accent_color || "#10b981",
                                                        }}
                                                    >{category.description}</p>
                                                )}
                                                <div className="grid gap-2">
                                                    {category.items.slice(0, 3).map((item) => {
                                                        const parsedAddons = Array.isArray(item.addons)
                                                            ? (item.addons as { name: string; price: number }[])
                                                            : [];
                                                        return <div
                                                            key={item.id}
                                                            className="flex justify-between items-start gap-4 p-3 rounded-lg"
                                                            style={{
                                                                backgroundColor: restaurant.accent_color || "white"
                                                            }}
                                                        >
                                                            <div className="flex-1 space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium"
                                                                        style={{
                                                                            color: restaurant.button_text_icons_color || "black"
                                                                        }}
                                                                    >{item.name}</span>
                                                                    {item.is_halal && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                            <Leaf className="h-3 w-3" />
                                                                            Halal
                                                                        </span>
                                                                    )}
                                                                    {item.allergens && item.allergens.length > 0 && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            Allergens
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {item.description && <p className="text-sm opacity-80"
                                                                    style={{
                                                                        color: restaurant.button_text_icons_color || "black"
                                                                    }}
                                                                >{item.description}</p>}
                                                                {item.allergen_info && (
                                                                    <p className="text-xs italic w-fit px-2 py-1"
                                                                        style={{
                                                                            backgroundColor: restaurant.button_text_icons_color || "white",
                                                                            color: restaurant.accent_color || "black"
                                                                        }}
                                                                    >{item.allergen_info}</p>
                                                                )}
                                                                {item.addons && parsedAddons.length > 0 && (
                                                                    <div style={{
                                                                        color: restaurant.button_text_icons_color || "black"
                                                                    }}>
                                                                        <h3 className="text-xs mt-2 font-medium mb-1">Available Addons:</h3>
                                                                        <ul className="list-disc list-inside text-xs ">
                                                                            {parsedAddons.map((addon: any, index: number) => (
                                                                                <li key={index}>
                                                                                    {addon.name} — €{addon.price.toFixed(2)}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-shrink-0 font-semibold text-gray-900">€{item.price.toFixed(2)}</div>
                                                        </div>
                                                    })}
                                                    {category.items.length > 3 && (
                                                        <div className="text-center py-2">
                                                            <span
                                                                style={{
                                                                    color: restaurant.accent_color || "black"
                                                                }}
                                                                className="text-sm">
                                                                +{category.items.length - 3} more items in this category
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Show items from selected category
                                        <div className="grid gap-2">
                                            {filteredMenuItems.map((item) => {
                                                const parsedAddons = Array.isArray(item.addons)
                                                    ? (item.addons as { name: string; price: number }[])
                                                    : [];
                                                return <div
                                                    key={item.id}
                                                    className="flex justify-between items-start gap-4 p-3 rounded-lg"
                                                    style={{
                                                        backgroundColor: restaurant.accent_color || "white"
                                                    }}
                                                >
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium"
                                                                style={{
                                                                    color: restaurant.button_text_icons_color || "black"
                                                                }}
                                                            >{item.name}</span>
                                                            {item.is_halal && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                                    <Leaf className="h-3 w-3" />
                                                                    Halal
                                                                </span>
                                                            )}
                                                            {item.allergens && item.allergens.length > 0 && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Allergens
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.description && <p className="text-sm opacity-80"
                                                            style={{
                                                                color: restaurant.button_text_icons_color || "black"
                                                            }}
                                                        >{item.description}</p>}
                                                        {item.allergen_info && (
                                                            <p className="text-xs italic w-fit px-2 py-1"
                                                                style={{
                                                                    backgroundColor: restaurant.button_text_icons_color || "white",
                                                                    color: restaurant.accent_color || "black"
                                                                }}
                                                            >{item.allergen_info}</p>
                                                        )}
                                                        {item.addons && parsedAddons.length > 0 && (
                                                            <div style={{
                                                                color: restaurant.button_text_icons_color || "black"
                                                            }}>
                                                                <h3 className="text-xs mt-2 font-medium mb-1">Available Addons:</h3>
                                                                <ul className="list-disc list-inside text-xs ">
                                                                    {parsedAddons.map((addon: any, index: number) => (
                                                                        <li key={index}>
                                                                            {addon.name} — €{addon.price.toFixed(2)}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-shrink-0 font-semibold text-gray-900">€{item.price.toFixed(2)}</div>
                                                </div>
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MenuIcon className="h-12 w-12 mx-auto mb-2" style={{
                                        color: restaurant.accent_color || "black"
                                    }} />
                                    <p className="text-sm" style={{
                                        color: restaurant.accent_color || "black"
                                    }}>No menu items available</p>
                                </div>
                            )}
                        </div>

                        {/* Footer with full menu link */}
                        <div className="pt-2 border-t border-gray-100 mt-2">
                            <Link
                                href={`/${restaurant.slug}/menu`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                                style={{
                                    backgroundColor: restaurant.accent_color || "#10b981",
                                    color: restaurant.button_text_icons_color || "#10b981",
                                }}
                                onClick={() => setShowMenuDialog(false)}
                            >
                                <MenuIcon className="h-4 w-4" />
                                <span>View Full Menu & Order Online</span>
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
                                <span style={{ color: restaurant.accent_color || "#10b981" }}>Upcoming Events</span>
                            </DialogTitle>
                            <DialogDescription className="text-start" style={{ color: restaurant.accent_color || "#10b981" }}>
                                {restaurant.events.length} upcoming {restaurant.events.length === 1 ? "event" : "events"}
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
                                                Get Tickets
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
                    <DialogContent closeIconColor={restaurant.accent_color || "#10b981"} className="max-h-[90vh] no-scroll max-w-[90vw] sm:!max-w-[570px] overflow-y-auto border-transparent" style={{ ...getBackgroundStyle() }}>
                        <DialogHeader>
                            <DialogTitle className="flex text-start items-center gap-2">
                                <HelpCircle className="h-5 w-5" style={{ color: restaurant.accent_color || "#10b981" }} />
                                <span style={{ color: restaurant.accent_color || "#10b981" }}>Frequently Asked Questions</span>
                            </DialogTitle>
                            <DialogDescription className="text-start" style={{ color: restaurant.accent_color || "#10b981" }}>Find answers to common questions</DialogDescription>
                        </DialogHeader>

                        <div className="py-0">
                            <FAQSection faqCategories={restaurant.faqCategories} cardstextColor={restaurant.button_text_icons_color || "black"} accentColor={restaurant.accent_color || "#10b981"} />
                        </div>
                    </DialogContent>
                </Dialog>

                {restaurant?.user?.subscription_plan === "basic" && <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 pb-6 text-center"
                >
                    <p className="text-xs" style={{ color: headingsColor, opacity: 0.7 }}>
                        Powered by{" "}
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
