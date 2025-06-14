"use client"

import type React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    AlertTriangle,
    Calendar,
    ExternalLink,
    Facebook,
    HelpCircle,
    Instagram,
    Leaf,
    Mail,
    MapPin,
    MenuIcon,
    MessageCircle
} from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { GoogleRating } from "./_components/google-rating"
import { OpeningHoursStatus } from "./_components/opening-hours-stats"
import { WelcomePopup } from "./_components/welcome-popup"
import { FAQSection } from "./_components/faq"

// Types
interface Restaurant {
    id: string
    name: string
    slug: string
    bio?: string
    logo_url?: string
    bg_type: "color" | "gradient" | "image"
    bg_color?: string
    bg_gradient_start?: string
    bg_gradient_end?: string
    bg_image_url?: string
    gradient_direction?: string
    accent_color: string
    font_family?: string
    button_style: "rounded" | "pill" | "square"
    button_variant: "solid" | "outline"
    social_icons_position: "top" | "bottom"
    phone?: string
    email?: string
    address?: string
    instagram?: string
    facebook?: string
    whatsapp?: string
    google_place_id?: string
    opening_hours?: OpeningHours[]
    average_rating?: number
    review_count?: number
    welcome_popup_message?: string
    welcome_popup_show_info?: {
        ratings: boolean
        address: boolean
        hours: boolean
        phone: boolean
    }
    welcome_popup_show_button?: boolean
    event_announcements_enabled?: boolean
    event_rotation_speed?: number
}

interface RestaurantLink {
    id: string
    title: string
    url: string
    sort_order: number
}

interface MenuCategory {
    id: string
    name: string
    description?: string
    sort_order: number
    updated_at: string
    menu_items?: MenuItem[]
}

interface MenuItem {
    id: string
    name: string
    description?: string
    price: number
    is_halal?: boolean
    allergens?: string[]
    allergen_info?: string
}

interface Event {
    id: string
    title: string
    description?: string
    date: string
    ticket_url?: string
}




interface OpeningHours {
    day: string
    hours: string
}

// Dummy Data
const DUMMY_RESTAURANT: Restaurant = {
    id: "1",
    name: "Bella Vista Ristorante",
    slug: "bella-vista",
    bio: "Authentic Italian cuisine in the heart of the city. Family-owned since 1985, we bring you traditional recipes passed down through generations.",
    logo_url: "https://www.shumail.dev/shumail.png",
    bg_type: "gradient",
    bg_gradient_start: "#0f766e",
    bg_gradient_end: "#2563eb",
    gradient_direction: "bottom-right",
    accent_color: "#0f766e",
    font_family: "Inter",
    button_style: "rounded",
    button_variant: "solid",
    social_icons_position: "top",
    phone: "+1 (555) 123-4567",
    email: "info@bellavista.com",
    address: "123 Main Street, Downtown, NY 10001",
    instagram: "https://instagram.com/bellavista",
    facebook: "https://facebook.com/bellavista",
    whatsapp: "+15551234567",
    google_place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
    opening_hours: [
        { day: "Monday", hours: "11:00 AM - 10:00 PM" },
        { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
        { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
        { day: "Thursday", hours: "11:00 AM - 11:00 PM" },
        { day: "Friday", hours: "11:00 AM - 11:00 PM" },
        { day: "Saturday", hours: "10:00 AM - 11:00 PM" },
        { day: "Sunday", hours: "10:00 AM - 9:00 PM" },
    ],
    average_rating: 4.8,
    review_count: 247,
    welcome_popup_message: "Welcome to Bella Vista! Experience authentic Italian flavors in our cozy atmosphere.",
    welcome_popup_show_info: {
        ratings: true,
        address: true,
        hours: true,
        phone: true,
    },
    welcome_popup_show_button: true,
    event_announcements_enabled: true,
    event_rotation_speed: 5,
}

const DUMMY_LINKS: RestaurantLink[] = [
    { id: "1", title: "Order Online", url: "https://order.bellavista.com", sort_order: 1 },
    { id: "2", title: "Make Reservation", url: "https://reservations.bellavista.com", sort_order: 2 },
    { id: "3", title: "Catering Services", url: "https://catering.bellavista.com", sort_order: 3 },
    { id: "4", title: "Gift Cards", url: "https://giftcards.bellavista.com", sort_order: 4 },
]

const DUMMY_MENU_CATEGORIES: MenuCategory[] = [
    {
        id: "1",
        name: "Antipasti",
        description: "Traditional Italian appetizers to start your meal",
        sort_order: 1,
        updated_at: new Date().toISOString(),
        menu_items: [
            {
                id: "1",
                name: "Bruschetta Classica",
                description: "Toasted bread with fresh tomatoes, basil, and garlic",
                price: 12.5,
                allergens: ["gluten"],
            },
            {
                id: "2",
                name: "Antipasto Misto",
                description: "Selection of cured meats, cheeses, and marinated vegetables",
                price: 18.0,
                allergens: ["dairy", "nuts"],
            },
            {
                id: "3",
                name: "Calamari Fritti",
                description: "Crispy fried squid rings with marinara sauce",
                price: 15.5,
                allergens: ["seafood", "gluten"],
            },
        ],
    },
    {
        id: "2",
        name: "Primi Piatti",
        description: "Fresh pasta and risotto dishes",
        sort_order: 2,
        updated_at: new Date().toISOString(),
        menu_items: [
            {
                id: "4",
                name: "Spaghetti Carbonara",
                description: "Classic Roman pasta with eggs, pancetta, and pecorino cheese",
                price: 22.0,
                allergens: ["gluten", "dairy", "eggs"],
            },
            {
                id: "5",
                name: "Risotto ai Funghi Porcini",
                description: "Creamy risotto with porcini mushrooms and truffle oil",
                price: 26.0,
                allergens: ["dairy"],
            },
            {
                id: "6",
                name: "Penne Arrabbiata",
                description: "Spicy tomato sauce with garlic and red peppers",
                price: 19.5,
                allergens: ["gluten"],
            },
        ],
    },
    {
        id: "3",
        name: "Secondi Piatti",
        description: "Main courses featuring the finest meats and seafood",
        sort_order: 3,
        updated_at: new Date().toISOString(),
        menu_items: [
            {
                id: "7",
                name: "Osso Buco alla Milanese",
                description: "Braised veal shanks with saffron risotto",
                price: 38.0,
                allergens: ["dairy"],
            },
            {
                id: "8",
                name: "Branzino al Sale",
                description: "Mediterranean sea bass baked in sea salt crust",
                price: 32.0,
                allergens: ["seafood"],
            },
            {
                id: "9",
                name: "Pollo alla Parmigiana",
                description: "Breaded chicken breast with tomato sauce and mozzarella",
                price: 28.0,
                is_halal: true,
                allergens: ["gluten", "dairy"],
            },
        ],
    },
    {
        id: "4",
        name: "Pizza",
        description: "Wood-fired pizzas made with San Marzano tomatoes",
        sort_order: 4,
        updated_at: new Date().toISOString(),
        menu_items: [
            {
                id: "10",
                name: "Margherita",
                description: "San Marzano tomatoes, fresh mozzarella, and basil",
                price: 18.0,
                allergens: ["gluten", "dairy"],
            },
            {
                id: "11",
                name: "Quattro Stagioni",
                description: "Four seasons pizza with artichokes, mushrooms, ham, and olives",
                price: 24.0,
                allergens: ["gluten", "dairy"],
            },
            {
                id: "12",
                name: "Diavola",
                description: "Spicy salami with mozzarella and chili oil",
                price: 22.0,
                allergens: ["gluten", "dairy"],
            },
        ],
    },
    {
        id: "5",
        name: "Dolci",
        description: "Traditional Italian desserts",
        sort_order: 5,
        updated_at: new Date().toISOString(),
        menu_items: [
            {
                id: "13",
                name: "Tiramisu",
                description: "Classic coffee-flavored dessert with mascarpone",
                price: 9.5,
                allergens: ["dairy", "eggs", "gluten"],
            },
            {
                id: "14",
                name: "Panna Cotta",
                description: "Vanilla cream with berry compote",
                price: 8.5,
                allergens: ["dairy"],
            },
            {
                id: "15",
                name: "Cannoli Siciliani",
                description: "Crispy shells filled with sweet ricotta and chocolate chips",
                price: 10.0,
                allergens: ["dairy", "gluten", "nuts"],
            },
        ],
    },
]

const DUMMY_EVENTS: Event[] = [
    {
        id: "1",
        title: "Wine Tasting Evening",
        description: "Join us for an exclusive wine tasting featuring Italian wines paired with our signature appetizers.",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ticket_url: "https://tickets.bellavista.com/wine-tasting",
    },
    {
        id: "2",
        title: "Cooking Class: Pasta Making",
        description: "Learn the art of making fresh pasta from our head chef. Includes dinner and wine.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        ticket_url: "https://tickets.bellavista.com/cooking-class",
    },
    {
        id: "3",
        title: "Live Jazz Night",
        description: "Enjoy dinner with live jazz music every Friday evening.",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
]


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
    // Simulate tracking - in real app this would call an API
    console.log(`Link clicked: ${linkId}`)
}

export default function ClientPage({ params }: { params: { slug: string } }) {
    const pathname = usePathname()
    const isMenuPage = pathname.endsWith("/menu")

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [links, setLinks] = useState<RestaurantLink[]>([])
    const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showMenuDialog, setShowMenuDialog] = useState(false)
    const [showEventsDialog, setShowEventsDialog] = useState(false)
    const [showFAQDialog, setShowFAQDialog] = useState(false)

    // Welcome popup state
    const [showWelcomePopup, setShowWelcomePopup] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)

                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Check if restaurant exists (simulate 404 for unknown slugs)
                // if (params.slug !== "bella-vista" && params.slug !== "demo") {
                //   setError("Restaurant not found")
                //   setLoading(false)
                //   return
                // }

                // Load dummy data
                setRestaurant(DUMMY_RESTAURANT)
                setLinks(DUMMY_LINKS)
                setMenuCategories(DUMMY_MENU_CATEGORIES)
                setEvents(DUMMY_EVENTS)

                // Show welcome popup after data loads
                setTimeout(() => {
                    const dismissed = localStorage.getItem(`welcome-popup-${DUMMY_RESTAURANT.slug}`)
                    if (!dismissed) {
                        setShowWelcomePopup(true)
                    }
                }, 500)

                setLoading(false)
            } catch (error) {
                console.error("Error loading data:", error)
                setError("Failed to load restaurant data")
                setLoading(false)
            }
        }

        loadData()
    }, [params.slug])

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.style.display = "none"
        e.currentTarget.parentElement?.querySelector(".fallback-initial")?.classList.remove("hidden")
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-600 to-blue-600">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                    <p className="text-white">Loading restaurant...</p>
                </div>
            </div>
        )
    }

    if (error || !restaurant) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-blue-600 p-4">
                <div className="text-center text-white">
                    <h1 className="mb-4 text-2xl font-bold">Restaurant Not Found</h1>
                    <p className="mb-8 text-center opacity-90">We couldn&apos;t find a restaurant at this address.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-teal-600 transition-transform hover:scale-105"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        )
    }

    // const getBackgroundStyle = () => {
    //     if (restaurant.bg_type === "image" && restaurant.bg_image_url) {
    //         return {
    //             backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${restaurant.bg_image_url})`,
    //             backgroundSize: "cover",
    //             backgroundPosition: "center",
    //         }
    //     }

    //     if (restaurant.bg_type === "gradient" && restaurant.bg_gradient_start && restaurant.bg_gradient_end) {
    //         return {
    //             backgroundImage: `linear-gradient(${restaurant.gradient_direction === "top"
    //                 ? "to top"
    //                 : restaurant.gradient_direction === "bottom"
    //                     ? "to bottom"
    //                     : restaurant.gradient_direction === "left"
    //                         ? "to left"
    //                         : restaurant.gradient_direction === "right"
    //                             ? "to right"
    //                             : restaurant.gradient_direction === "top-right"
    //                                 ? "to top right"
    //                                 : restaurant.gradient_direction === "top-left"
    //                                     ? "to top left"
    //                                     : restaurant.gradient_direction === "bottom-right"
    //                                         ? "to bottom right"
    //                                         : restaurant.gradient_direction === "bottom-left"
    //                                             ? "to bottom left"
    //                                             : "to bottom right"
    //                 }, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`,
    //         }
    //     }

    //     return { backgroundColor: restaurant.bg_color || "#ffffff" }
    // }

    // const textColor =
    //     restaurant.bg_type === "image" ? "#ffffff" : restaurant.bg_color === "#ffffff" ? "#000000" : "#ffffff"

    const textColorWithOpacity =
        restaurant.bg_type === "image"
            ? "rgba(255,255,255,0.9)"
            : restaurant.bg_color === "#ffffff"
                ? "rgba(0,0,0,0.7)"
                : "rgba(255,255,255,0.9)"

    const SocialIcons = () => (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 flex flex-wrap items-center justify-center gap-3"
        >
            {restaurant.instagram && (
                <a
                    href={restaurant.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-300 hover:scale-110"
                    style={{ color: restaurant.accent_color }}
                >
                    <Instagram className="h-6 w-6" />
                </a>
            )}
            {restaurant.facebook && (
                <a
                    href={restaurant.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-300 hover:scale-110"
                    style={{ color: restaurant.accent_color }}
                >
                    <Facebook className="h-6 w-6" />
                </a>
            )}
            {restaurant.whatsapp && (
                <a
                    href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-300 hover:scale-110"
                    style={{ color: restaurant.accent_color }}
                >
                    <MessageCircle className="h-6 w-6" />
                </a>
            )}
            {restaurant.email && (
                <a
                    href={`mailto:${restaurant.email}`}
                    className="transition-all duration-300 hover:scale-110"
                    style={{ color: restaurant.accent_color }}
                >
                    <Mail className="h-6 w-6" />
                </a>
            )}
            {restaurant.address && (
                <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-all duration-300 hover:scale-110"
                    style={{ color: restaurant.accent_color }}
                >
                    <MapPin className="h-6 w-6" />
                </a>
            )}
        </motion.div>
    )

    return (
        // <div className="relative flex min-h-screen flex-col" style={getBackgroundStyle()}>
        <div className="relative flex min-h-screen flex-col" >
            {/* <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
                style={{
                    background:
                        restaurant.bg_type === "gradient"
                            ? `linear-gradient(to bottom, transparent, ${restaurant.bg_gradient_end})`
                            : restaurant.bg_type === "image"
                                ? "linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))"
                                : `linear-gradient(to bottom, transparent, ${restaurant.bg_color || "#ffffff"})`,
                }}
            /> */}

            <div className="container relative mx-auto flex max-w-md flex-grow flex-col px-4 py-8">
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
                            className="mb-5 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ring-white/20"
                            style={{ backgroundColor: restaurant.accent_color }}
                        >
                            <span className="text-2xl font-bold text-white">{restaurant.name.charAt(0)}</span>
                        </motion.div>
                    )}

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-3 text-2xl font-bold text-black"
                    // style={{
                    //     color: textColor,
                    //     fontFamily: restaurant.font_family,
                    // }}
                    >
                        {restaurant?.name}
                    </motion.h2>

                    {/* Opening Hours Status */}
                    {restaurant.opening_hours && restaurant.opening_hours.length > 0 && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mb-4"
                        >
                            <OpeningHoursStatus
                                openingHours={restaurant.opening_hours}
                                className={"text-black"
                                    // restaurant?.bg_type === "image"
                                    //     ? "text-white"
                                    //     : restaurant?.bg_color === "#ffffff"
                                    //         ? "text-gray-700"
                                    //         : "text-white"
                                }
                                accentColor={restaurant.accent_color}
                            />
                        </motion.div>
                    )}

                    {restaurant?.google_place_id && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="mb-4"
                        >
                            <GoogleRating
                                placeId={restaurant.google_place_id}
                                className={"text-black"
                                    // restaurant?.bg_type === "image"
                                    //     ? "text-white"
                                    //     : restaurant?.bg_color === "#ffffff"
                                    //         ? "text-gray-700"
                                    //         : "text-white"
                                }
                            />
                        </motion.div>
                    )}

                    {restaurant?.bio && (
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mx-auto mb-6 text-black max-w-md text-sm"
                        // style={{
                        //     color: textColorWithOpacity,
                        //     fontFamily: restaurant.font_family,
                        // }}
                        >
                            {restaurant.bio}
                        </motion.p>
                    )}

                    {(restaurant.instagram ||
                        restaurant.facebook ||
                        restaurant.email ||
                        restaurant.address ||
                        restaurant.whatsapp) &&
                        restaurant.social_icons_position === "top" && <SocialIcons />}

                    {/* {restaurant.phone && (
                        <motion.a
                            variants={item}
                            href={`tel:${restaurant.phone}`}
                            style={{
                                border: `2px solid ${restaurant.accent_color}`,
                            }}
                            className="mb-8 flex w-full items-center justify-center gap-2 rounded-lg bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.02]"
                        >
                            <Phone className="h-4 w-4" style={{ color: restaurant.accent_color }} />
                            <span className="text-sm">{restaurant.phone}</span>
                        </motion.a>
                    )} */}
                </motion.div>

                <motion.div variants={container} initial="hidden" animate="show" className="flex-grow space-y-4">
                    {links.map((link) => (
                        <motion.a
                            key={link.id}
                            variants={item}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackLinkClick(link.id)}
                            className={`group flex items-center justify-center text-center p-4 w-full transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor: restaurant.button_variant === "solid" ? "rgba(255, 255, 255, 0.95)" : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? "#1a1a1a" : restaurant.accent_color,
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >
                            <span
                                className="absolute inset-0 h-full w-full origin-left scale-x-0 transform transition-transform duration-300 group-hover:scale-x-100"
                                style={{
                                    backgroundColor: restaurant.accent_color,
                                    opacity: restaurant.button_variant === "solid" ? 0.1 : 0.95,
                                }}
                            />

                            <span
                                className={`relative text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                            >
                                {link.title}
                            </span>
                        </motion.a>
                    ))}

                    {menuCategories.length > 0 && !isMenuPage && (
                        <motion.button
                            variants={item}
                            onClick={() => setShowMenuDialog(true)}
                            className={`group flex items-center justify-center text-center p-4 w-full transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor: restaurant.button_variant === "solid" ? "rgba(255, 255, 255, 0.95)" : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? "#1a1a1a" : restaurant.accent_color,
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >
                            <span
                                className="absolute inset-0 h-full w-full origin-left scale-x-0 transform transition-transform duration-300 group-hover:scale-x-100"
                                style={{
                                    backgroundColor: restaurant.accent_color,
                                    opacity: restaurant.button_variant === "solid" ? 0.1 : 0.95,
                                }}
                            />

                            <span
                                className={`relative text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                            >
                                Menu
                            </span>
                        </motion.button>
                    )}

                    {events.length > 0 && (
                        <motion.button
                            variants={item}
                            onClick={() => setShowEventsDialog(true)}
                            className={`group flex items-center justify-center text-center p-4 w-full transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant.button_style === "pill"
                                ? "rounded-full"
                                : restaurant.button_style === "square"
                                    ? "rounded-md"
                                    : "rounded-xl"
                                }`}
                            style={{
                                backgroundColor: restaurant.button_variant === "solid" ? "rgba(255, 255, 255, 0.95)" : "transparent",
                                backdropFilter: "blur(8px)",
                                border: `2px solid ${restaurant.accent_color}`,
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                color: restaurant.button_variant === "solid" ? "#1a1a1a" : restaurant.accent_color,
                                fontFamily: restaurant.font_family || "Inter",
                                letterSpacing: "0.01em",
                            }}
                        >
                            <span
                                className="absolute inset-0 h-full w-full origin-left scale-x-0 transform transition-transform duration-300 group-hover:scale-x-100"
                                style={{
                                    backgroundColor: restaurant.accent_color,
                                    opacity: restaurant.button_variant === "solid" ? 0.1 : 0.95,
                                }}
                            />

                            <span
                                className={`relative text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                    } transition-colors duration-300 font-medium`}
                            >
                                Events
                            </span>
                        </motion.button>
                    )}

                    {/* FAQ Button - Always show */}
                    <motion.button
                        variants={item}
                        onClick={() => setShowFAQDialog(true)}
                        className={`group flex items-center justify-center text-center p-4 w-full transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${restaurant.button_style === "pill"
                            ? "rounded-full"
                            : restaurant.button_style === "square"
                                ? "rounded-md"
                                : "rounded-xl"
                            }`}
                        style={{
                            backgroundColor: restaurant.button_variant === "solid" ? "rgba(255, 255, 255, 0.95)" : "transparent",
                            backdropFilter: "blur(8px)",
                            border: `2px solid ${restaurant.accent_color}`,
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                            color: restaurant.button_variant === "solid" ? "#1a1a1a" : restaurant.accent_color,
                            fontFamily: restaurant.font_family || "Inter",
                            letterSpacing: "0.01em",
                        }}
                    >
                        <span
                            className="absolute inset-0 h-full w-full origin-left scale-x-0 transform transition-transform duration-300 group-hover:scale-x-100"
                            style={{
                                backgroundColor: restaurant.accent_color,
                                opacity: restaurant.button_variant === "solid" ? 0.1 : 0.95,
                            }}
                        />

                        <span
                            className={`relative text-[15px] ${restaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                } transition-colors duration-300 font-medium`}
                        >
                            FAQ
                        </span>
                    </motion.button>

                    {links.length === 0 && !menuCategories.length && !events.length && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-8 text-center"
                            style={{ color: textColorWithOpacity }}
                        >
                            No links added yet
                        </motion.div>
                    )}

                    {(restaurant.instagram ||
                        restaurant.facebook ||
                        restaurant.email ||
                        restaurant.address ||
                        restaurant.whatsapp) &&
                        restaurant.social_icons_position === "bottom" && <SocialIcons />}
                </motion.div>

                <Dialog open={showMenuDialog} onOpenChange={setShowMenuDialog}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <MenuIcon className="h-5 w-5" style={{ color: restaurant.accent_color }} />
                                <span>Menu</span>
                            </DialogTitle>
                            <DialogDescription>
                                Last updated{" "}
                                {new Date(Math.max(...menuCategories.map((cat) => new Date(cat.updated_at).getTime()))).toLocaleString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    },
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-8 py-4">
                            {menuCategories.map((category) => (
                                <div key={category.id} className="space-y-4">
                                    <h3 className="border-b pb-2 text-lg font-bold">{category.name}</h3>
                                    {category.description && (
                                        <p className="-mt-2 mb-4 text-sm text-muted-foreground">{category.description}</p>
                                    )}

                                    <div className="space-y-6">
                                        {category.menu_items?.map((item) => (
                                            <div key={item.id} className="flex justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{item.name}</span>
                                                        {item.is_halal && (
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                                                                title="Halal"
                                                            >
                                                                <Leaf className="h-3 w-3" />
                                                                Halal
                                                            </span>
                                                        )}
                                                        {item.allergens && item.allergens.length > 0 && (
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                                                                title={`Contains: ${item.allergens.join(", ")}`}
                                                            >
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Allergens
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                                                    {item.allergen_info && <p className="text-xs italic text-yellow-700">{item.allergen_info}</p>}
                                                </div>
                                                <div className="flex-shrink-0 font-medium">&euro;{item.price.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" style={{ color: restaurant.accent_color }} />
                                <span>Upcoming Events</span>
                            </DialogTitle>
                            <DialogDescription>
                                {events.length} upcoming {events.length === 1 ? "event" : "events"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {events.map((event) => (
                                <div key={event.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                    <h3 className="mb-2 text-lg font-semibold">{event.title}</h3>
                                    {event.description && <p className="mb-4 text-muted-foreground">{event.description}</p>}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" style={{ color: restaurant.accent_color }} />
                                        <span>
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
                                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-transform hover:scale-105"
                                                style={{ backgroundColor: restaurant.accent_color }}
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

                <Dialog open={showFAQDialog} onOpenChange={setShowFAQDialog}>
                    <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" style={{ color: restaurant.accent_color }} />
                                <span>Frequently Asked Questions</span>
                            </DialogTitle>
                            <DialogDescription>Find answers to common questions</DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <FAQSection restaurantId={restaurant.id} accentColor={restaurant.accent_color} />
                        </div>
                    </DialogContent>
                </Dialog>

                <motion.footer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-12 pb-6 text-center"
                >
                    {/* <p className="text-xs !text-black" style={{ color: textColorWithOpacity }}> */}
                    <p className="text-xs !text-black" >
                        Powered by{" "}
                        <Link href="/" className="hover:underline" style={{ color: restaurant.accent_color }}>
                            dineri.app
                        </Link>
                    </p>
                </motion.footer>
            </div>

            {/* Welcome Popup */}
            <WelcomePopup
                restaurant={restaurant as any}
                isOpen={showWelcomePopup}
                onClose={() => setShowWelcomePopup(false)}
                upcomingEvents={events}
            />
        </div>
    )
}




