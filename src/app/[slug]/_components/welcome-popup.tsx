"use client"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink, MapPin, Phone, Star, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import type { Restaurant, Event } from "@prisma/client"

interface WelcomePopupProps {
    restaurant: Restaurant
    isOpen: boolean
    onClose: () => void
    upcomingEvents: Event[]
    welcomePopupShowInfo: {
        ratings: boolean
        address: boolean
        hours: boolean
        phone: boolean
    }
}

export function WelcomePopup({ restaurant, isOpen, onClose, upcomingEvents, welcomePopupShowInfo }: WelcomePopupProps) {
    const [currentEventIndex, setCurrentEventIndex] = useState(0)

    // Auto-rotate through events
    useEffect(() => {
        if (upcomingEvents.length <= 1 || !restaurant.event_announcements_enabled) return

        const rotationSpeed = (restaurant.event_rotation_speed || 5) * 1000
        const interval = setInterval(() => {
            setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length)
        }, rotationSpeed)

        return () => clearInterval(interval)
    }, [upcomingEvents.length, restaurant.event_rotation_speed, restaurant.event_announcements_enabled])

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
            const direction = restaurant.gradient_direction
                .replace("_", " ")
                .replace("top", "to top")
                .replace("bottom", "to bottom")
                .replace("left", "to left")
                .replace("right", "to right")

            return {
                backgroundImage: `linear-gradient(${direction}, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`,
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
                        onClick={(e) => e.stopPropagation()}
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
                                        style={{ backgroundColor: restaurant.accent_color || "#10b981" }}
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
                                                backgroundColor: `${restaurant.accent_color || "#10b981"}20`,
                                                color: restaurant.accent_color || "#10b981",
                                            }}
                                        >
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatEventDate(currentEvent.date.toISOString())}</span>
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
                                {welcomePopupShowInfo.ratings && restaurant.google_place_id && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium" style={{ color: textColor }}>
                                            4.8 (247 reviews)
                                        </span>
                                    </div>
                                )}

                                {welcomePopupShowInfo.address && restaurant.address && (
                                    <div className="flex items-center justify-center gap-2">
                                        <MapPin className="h-4 w-4" style={{ color: restaurant.accent_color || "#10b981" }} />
                                        <span className="text-sm" style={{ color: textColor }}>
                                            {restaurant.address.split(",")[0]}
                                        </span>
                                    </div>
                                )}

                                {welcomePopupShowInfo.hours && restaurant.opening_hours && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Clock className="h-4 w-4" style={{ color: restaurant.accent_color || "#10b981" }} />
                                        <span className="text-sm" style={{ color: textColor }}>
                                            Open Today
                                        </span>
                                    </div>
                                )}

                                {welcomePopupShowInfo.phone && restaurant.phone && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Phone className="h-4 w-4" style={{ color: restaurant.accent_color || "#10b981" }} />
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
                                        style={{ backgroundColor: restaurant.accent_color || "#10b981" }}
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
                                        style={{ backgroundColor: restaurant.accent_color || "#10b981" }}
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
