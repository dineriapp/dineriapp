"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import {
    Instagram,
    Facebook,
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    AlertTriangle,
    Leaf,
    MenuIcon,
    Calendar,
    ExternalLink,
    HelpCircle,
    Star,
    X,
    Search,
    ChevronDown,
} from "lucide-react"
import { Clock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface FAQCategory {
    id: string
    name: string
    description?: string
    sort_order: number
    faqs?: FAQ[]
}

interface FAQ {
    id: string
    question: string
    answer: string
    is_featured: boolean
    view_count: number
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

const DUMMY_FAQ_CATEGORIES: FAQCategory[] = [
    {
        id: "1",
        name: "Reservations & Hours",
        description: "Information about booking and our operating hours",
        sort_order: 1,
        faqs: [
            {
                id: "1",
                question: "Do I need a reservation?",
                answer:
                    "While walk-ins are welcome, we highly recommend making a reservation, especially for dinner service and weekends. You can book online or call us directly.",
                is_featured: true,
                view_count: 156,
            },
            {
                id: "2",
                question: "What are your opening hours?",
                answer:
                    "We are open Monday-Wednesday 11 AM-10 PM, Thursday-Friday 11 AM-11 PM, Saturday 10 AM-11 PM, and Sunday 10 AM-9 PM.",
                is_featured: true,
                view_count: 134,
            },
            {
                id: "3",
                question: "Can I modify or cancel my reservation?",
                answer:
                    "Yes, you can modify or cancel your reservation up to 2 hours before your scheduled time. Please call us or use our online reservation system.",
                is_featured: false,
                view_count: 89,
            },
        ],
    },
    {
        id: "2",
        name: "Menu & Dietary",
        description: "Questions about our food and dietary accommodations",
        sort_order: 2,
        faqs: [
            {
                id: "4",
                question: "Do you have vegetarian and vegan options?",
                answer:
                    "Yes! We offer several vegetarian dishes and can modify many of our pasta dishes to be vegan. Please inform your server about any dietary restrictions.",
                is_featured: true,
                view_count: 198,
            },
            {
                id: "5",
                question: "Are your ingredients fresh and locally sourced?",
                answer:
                    "We pride ourselves on using the freshest ingredients. Many of our vegetables and herbs are sourced from local farms, and we import specialty items directly from Italy.",
                is_featured: false,
                view_count: 76,
            },
            {
                id: "6",
                question: "Do you accommodate food allergies?",
                answer:
                    "Absolutely. Please inform your server about any allergies or dietary restrictions. Our kitchen staff is trained to handle allergy concerns safely.",
                is_featured: true,
                view_count: 145,
            },
        ],
    },
    {
        id: "3",
        name: "Events & Catering",
        description: "Information about private events and catering services",
        sort_order: 3,
        faqs: [
            {
                id: "7",
                question: "Do you host private events?",
                answer:
                    "Yes, we have a private dining room that can accommodate up to 40 guests. We also offer full restaurant buyouts for larger events.",
                is_featured: false,
                view_count: 67,
            },
            {
                id: "8",
                question: "Do you offer catering services?",
                answer:
                    "We provide full-service catering for events of all sizes. Our catering menu includes many of our popular dishes adapted for off-site service.",
                is_featured: false,
                view_count: 54,
            },
        ],
    },
    {
        id: "4",
        name: "Payment & Policies",
        description: "Information about payment methods and restaurant policies",
        sort_order: 4,
        faqs: [
            {
                id: "9",
                question: "What payment methods do you accept?",
                answer:
                    "We accept all major credit cards, debit cards, and cash. We also accept contactless payments including Apple Pay and Google Pay.",
                is_featured: false,
                view_count: 43,
            },
            {
                id: "10",
                question: "What is your cancellation policy?",
                answer:
                    "We require 24-hour notice for cancellations of parties of 6 or more. For smaller parties, we ask for at least 2 hours notice.",
                is_featured: false,
                view_count: 38,
            },
        ],
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
                restaurant={restaurant}
                isOpen={showWelcomePopup}
                onClose={() => setShowWelcomePopup(false)}
                upcomingEvents={events}
            />
        </div>
    )
}

interface GoogleRatingProps {
    placeId: string | null
    className?: string
}

export function GoogleRating({ placeId, className }: GoogleRatingProps) {
    const [rating] = useState<number>(4.8)
    const [reviewCount] = useState<number>(247)

    if (!placeId || !rating) {
        return null
    }

    return (
        <div className={`flex items-center gap-1 text-sm ${className}`}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
            <span className="opacity-75">
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
        </div>
    )
}

interface OpeningHoursStatusProps {
    openingHours: OpeningHours[]
    className?: string
    accentColor?: string
}

interface ParsedHours {
    open: Date
    close: Date
}

export function OpeningHoursStatus({ openingHours, className = "", accentColor = "#0f766e" }: OpeningHoursStatusProps) {
    const [status, setStatus] = useState<"open" | "closed" | "closing-soon" | "opening-soon">("open")
    const [nextChange, setNextChange] = useState<string>("Until 10:00 PM")

    useEffect(() => {
        function parseTimeString(timeStr: string, baseDate: Date): Date {
            const [time, period] = timeStr.trim().split(" ")
            const [hours, minutes] = time.split(":")
            let hour = Number.parseInt(hours)

            if (period?.toLowerCase() === "pm" && hour !== 12) {
                hour += 12
            } else if (period?.toLowerCase() === "am" && hour === 12) {
                hour = 0
            }

            const date = new Date(baseDate)
            date.setHours(hour)
            date.setMinutes(Number.parseInt(minutes) || 0)
            date.setSeconds(0)
            date.setMilliseconds(0)

            return date
        }

        function parseHours(hoursStr: string, baseDate: Date): ParsedHours | null {
            if (!hoursStr || hoursStr.toLowerCase() === "closed") return null

            const [openStr, closeStr] = hoursStr.split("-")
            if (!openStr || !closeStr) return null

            return {
                open: parseTimeString(openStr, baseDate),
                close: parseTimeString(closeStr, baseDate),
            }
        }

        function updateStatus() {
            const now = new Date()
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            const today = days[now.getDay()]

            const todaySchedule = openingHours.find((h) => h.day === today)
            const todayHours = todaySchedule ? parseHours(todaySchedule.hours, now) : null

            if (todayHours) {
                if (now >= todayHours.open && now < todayHours.close) {
                    const minutesToClose = Math.round((todayHours.close.getTime() - now.getTime()) / 1000 / 60)
                    setStatus(minutesToClose <= 60 ? "closing-soon" : "open")
                    setNextChange(`Until ${todayHours.close.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)
                } else if (now < todayHours.open) {
                    const minutesToOpen = Math.round((todayHours.open.getTime() - now.getTime()) / 1000 / 60)
                    setStatus(minutesToOpen <= 60 ? "opening-soon" : "closed")
                    setNextChange(`Opens ${todayHours.open.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`)
                } else {
                    setStatus("closed")
                    setNextChange("Opens tomorrow")
                }
            } else {
                setStatus("closed")
                setNextChange("Closed today")
            }
        }

        updateStatus()
        const interval = setInterval(updateStatus, 60000)
        return () => clearInterval(interval)
    }, [openingHours])

    const getStatusColor = () => {
        switch (status) {
            case "open":
                return accentColor
            case "closing-soon":
                return "#f97316"
            case "opening-soon":
                return "#10b981"
            default:
                return "#ef4444"
        }
    }

    const getStatusBgColor = () => {
        switch (status) {
            case "open":
                return `${accentColor}20`
            case "closing-soon":
                return "#f9731620"
            case "opening-soon":
                return "#10b98120"
            default:
                return "#ef444420"
        }
    }

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${className}`}
            style={{ backgroundColor: getStatusBgColor() }}
        >
            <Clock className="h-4 w-4" style={{ color: getStatusColor() }} />
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
                    {status === "open" && "Open"}
                    {status === "closed" && "Closed"}
                    {status === "closing-soon" && "Closing Soon"}
                    {status === "opening-soon" && "Opening Soon"}
                </span>
                {nextChange && <span className="text-sm opacity-90">• {nextChange}</span>}
            </div>
        </div>
    )
}

interface WelcomePopupProps {
    restaurant: Restaurant
    isOpen: boolean
    onClose: () => void
    upcomingEvents?: Event[]
}

export function WelcomePopup({ restaurant, isOpen, onClose, upcomingEvents = [] }: WelcomePopupProps) {
    const [currentEventIndex, setCurrentEventIndex] = useState(0)

    // Auto-rotate through events
    useEffect(() => {
        if (upcomingEvents.length <= 1) return

        const rotationSpeed = (restaurant.event_rotation_speed || 5) * 1000
        const interval = setInterval(() => {
            setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length)
        }, rotationSpeed)

        return () => clearInterval(interval)
    }, [upcomingEvents.length, restaurant.event_rotation_speed])

    const handleDontShowAgain = () => {
        localStorage.setItem(`welcome-popup-${restaurant.slug}`, "dismissed")
        onClose()
    }

    const getBackgroundStyle = () => {
        if (restaurant.bg_type === "image" && restaurant.bg_image_url) {
            return {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${restaurant.bg_image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }
        }

        if (restaurant.bg_type === "gradient" && restaurant.bg_gradient_start && restaurant.bg_gradient_end) {
            return {
                backgroundImage: `linear-gradient(${restaurant.gradient_direction === "top"
                    ? "to top"
                    : restaurant.gradient_direction === "bottom"
                        ? "to bottom"
                        : restaurant.gradient_direction === "left"
                            ? "to left"
                            : restaurant.gradient_direction === "right"
                                ? "to right"
                                : restaurant.gradient_direction === "top-right"
                                    ? "to top right"
                                    : restaurant.gradient_direction === "top-left"
                                        ? "to top left"
                                        : restaurant.gradient_direction === "bottom-right"
                                            ? "to bottom right"
                                            : restaurant.gradient_direction === "bottom-left"
                                                ? "to bottom left"
                                                : "to bottom right"
                    }, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`,
            }
        }

        return { backgroundColor: restaurant.bg_color || "#ffffff" }
    }

    const textColor =
        restaurant.bg_type === "image" ? "#ffffff" : restaurant.bg_color === "#ffffff" ? "#000000" : "#ffffff"

    const currentEvent = upcomingEvents[currentEventIndex]
    const hasEvents = upcomingEvents.length > 0 && restaurant.event_announcements_enabled !== false

    const formatEventDate = (dateString: string) => {
        const eventDate = new Date(dateString)
        const now = new Date()
        const diffTime = eventDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return "Today"
        } else if (diffDays === 1) {
            return "Tomorrow"
        } else if (diffDays <= 7) {
            return `In ${diffDays} days`
        } else {
            return eventDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })
        }
    }

    const showButton = restaurant.welcome_popup_show_button !== false && !hasEvents

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
                        style={getBackgroundStyle()}
                        onClick={(e: any) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-black/30"
                        >
                            <X className="h-5 w-5 text-white" />
                        </button>

                        {/* Content */}
                        <div className="relative p-8 text-center">
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                                className="mb-6"
                            >
                                {restaurant.logo_url ? (
                                    <img
                                        src={restaurant.logo_url || "/placeholder.svg"}
                                        alt={restaurant.name}
                                        className="mx-auto h-20 w-20 rounded-full object-cover shadow-lg ring-4 ring-white/20"
                                    />
                                ) : (
                                    <div
                                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-lg ring-4 ring-white/20"
                                        style={{ backgroundColor: restaurant.accent_color }}
                                    >
                                        <span className="text-3xl font-bold text-white">{restaurant.name.charAt(0)}</span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Welcome Message */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mb-6"
                            >
                                <h2 className="mb-2 text-2xl font-bold" style={{ color: textColor }}>
                                    Welcome to {restaurant.name}!
                                </h2>

                                {/* Event Announcement or Welcome Message */}
                                {hasEvents && currentEvent ? (
                                    <div className="space-y-3">
                                        <div
                                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
                                            style={{
                                                backgroundColor: `${restaurant.accent_color}20`,
                                                color: restaurant.accent_color,
                                            }}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatEventDate(currentEvent.date)}</span>
                                        </div>

                                        <h3 className="text-lg font-semibold" style={{ color: textColor }}>
                                            {currentEvent.title}
                                        </h3>

                                        {currentEvent.description && (
                                            <p className="text-sm leading-relaxed opacity-90" style={{ color: textColor }}>
                                                {currentEvent.description}
                                            </p>
                                        )}

                                        {/* Event indicators if multiple events */}
                                        {upcomingEvents.length > 1 && (
                                            <div className="mt-3 flex justify-center gap-2">
                                                {upcomingEvents.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentEventIndex(index)}
                                                        className={`w-2 h-2 rounded-full transition-all ${index === currentEventIndex ? "bg-white scale-125" : "bg-white/50"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed opacity-90" style={{ color: textColor }}>
                                        {restaurant.welcome_popup_message ||
                                            restaurant.bio ||
                                            "Welcome! We're excited to have you visit us."}
                                    </p>
                                )}
                            </motion.div>

                            {/* Restaurant Info */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mb-8 space-y-3"
                            >
                                {restaurant.average_rating && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium" style={{ color: textColor }}>
                                            {restaurant.average_rating.toFixed(1)} ({restaurant.review_count} reviews)
                                        </span>
                                    </div>
                                )}

                                {restaurant.address && (
                                    <div className="flex items-center justify-center gap-2">
                                        <MapPin className="h-4 w-4" style={{ color: restaurant.accent_color }} />
                                        <span className="text-sm" style={{ color: textColor }}>
                                            {restaurant.address.split(",")[0]}
                                        </span>
                                    </div>
                                )}

                                {restaurant.opening_hours && restaurant.opening_hours.length > 0 && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock className="h-4 w-4" style={{ color: restaurant.accent_color }} />
                                        <span className="text-sm" style={{ color: textColor }}>
                                            Open Today
                                        </span>
                                    </div>
                                )}

                                {restaurant.phone && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Phone className="h-4 w-4" style={{ color: restaurant.accent_color }} />
                                        <span className="text-sm" style={{ color: textColor }}>
                                            {restaurant.phone}
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-3"
                            >
                                {/* Event Ticket Button */}
                                {hasEvents && currentEvent?.ticket_url && (
                                    <a
                                        href={currentEvent.ticket_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium text-white transition-all hover:scale-105"
                                        style={{ backgroundColor: restaurant.accent_color }}
                                    >
                                        <span>Get Event Tickets</span>
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}

                                {/* Main Action Button - Only show if enabled AND no events are displayed */}
                                {showButton && (
                                    <Button
                                        onClick={onClose}
                                        className="w-full rounded-xl py-3 font-medium text-white transition-all hover:scale-105"
                                        style={{ backgroundColor: restaurant.accent_color }}
                                    >
                                        Explore
                                    </Button>
                                )}

                                <button
                                    onClick={handleDontShowAgain}
                                    className="text-sm opacity-75 transition-opacity hover:opacity-100"
                                    style={{ color: textColor }}
                                >
                                    Don&apos;t show this again
                                </button>
                            </motion.div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
                            <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-white/20"></div>
                            <div className="absolute right-12 top-8 h-1 w-1 rounded-full bg-white/30"></div>
                            <div className="absolute bottom-12 left-8 h-1.5 w-1.5 rounded-full bg-white/25"></div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

interface FAQSectionProps {
    restaurantId: string
    accentColor?: string
    className?: string
}

export function FAQSection({ restaurantId, accentColor = "#0f766e", className = "" }: FAQSectionProps) {
    const [categories, setCategories] = useState<FAQCategory[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadFAQs() {
            try {
                // Simulate loading delay
                await new Promise((resolve) => setTimeout(resolve, 500))

                // Load dummy FAQ data
                setCategories(DUMMY_FAQ_CATEGORIES)
            } catch (error) {
                console.error("Error loading FAQs:", error)
            } finally {
                setLoading(false)
            }
        }

        loadFAQs()
    }, [restaurantId])

    const handleFAQClick = async (faqId: string) => {
        // Simulate tracking FAQ view
        console.log(`FAQ viewed: ${faqId}`)
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
    }

    // Filter FAQs based on search term
    const filteredCategories = categories
        .map((category) => ({
            ...category,
            faqs:
                category.faqs?.filter(
                    (faq) =>
                        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
                ) || [],
        }))
        .filter((category) => category.faqs.length > 0)

    // Get featured FAQs across all categories
    const featuredFAQs = categories
        .flatMap((cat) => cat.faqs?.filter((faq) => faq.is_featured) || [])
        .sort((a, b) => b.view_count - a.view_count)

    if (loading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="animate-pulse">
                    <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 rounded bg-gray-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (categories.length === 0) {
        return null
    }

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="text-center">
                <h2 className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold">
                    <HelpCircle className="h-6 w-6" style={{ color: accentColor }} />
                    Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">Find quick answers to common questions</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Featured FAQs */}
            {featuredFAQs.length > 0 && !searchTerm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Popular Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {featuredFAQs.slice(0, 3).map((faq) => (
                            <motion.div key={faq.id} className="overflow-hidden rounded-lg border">
                                <button
                                    onClick={() => handleFAQClick(faq.id)}
                                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                                >
                                    <span className="font-medium">{faq.question}</span>
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`}
                                        style={{ color: accentColor }}
                                    />
                                </button>
                                <AnimatePresence>
                                    {expandedFAQ === faq.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 pt-0 text-muted-foreground">{faq.answer}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* FAQ Categories */}
            <div className="space-y-6">
                {filteredCategories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {category.faqs?.map((faq: any) => (
                                <motion.div key={faq.id} className="overflow-hidden rounded-lg border">
                                    <button
                                        onClick={() => handleFAQClick(faq.id)}
                                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{faq.question}</span>
                                            {faq.is_featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${expandedFAQ === faq.id ? "rotate-180" : ""}`}
                                            style={{ color: accentColor }}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {expandedFAQ === faq.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 leading-relaxed text-muted-foreground">{faq.answer}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {searchTerm && filteredCategories.length === 0 && (
                <div className="py-8 text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms or browse our categories above</p>
                </div>
            )}
        </div>
    )
}
