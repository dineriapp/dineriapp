"use client";
import { Button } from "@/components/ui/button";
import {
  OpeningHoursData,
  RestaurantWithRelations,
  ReviewsInfo,
} from "@/types";
import type { Event } from "@prisma/client";
import { MapPin, Phone, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { OpeningHoursStatus } from "../../_components/opening-hours-status";
import { useTranslations } from "next-intl";

interface WelcomePopupProps {
  restaurant: RestaurantWithRelations;
  isOpen: boolean;
  onClose: () => void;
  RatingInfo?: ReviewsInfo;
  upcomingEvents: Event[];
  welcomePopupShowInfo: {
    ratings: boolean;
    address: boolean;
    hours: boolean;
    phone: boolean;
  };
}

export function WelcomePopupMenu({
  restaurant,
  isOpen,
  onClose,
  RatingInfo,
  welcomePopupShowInfo,
}: WelcomePopupProps) {
  const t = useTranslations("slug_page.welcome_popup");

  const handleDontShowAgain = () => {
    localStorage.setItem(`menu-popup-${restaurant.slug}`, "dismissed");
    onClose();
  };

  const getBackgroundStyle = () => {
    if (restaurant.bg_type === "image" && restaurant.bg_image_url) {
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${restaurant.bg_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    if (
      restaurant.bg_type === "gradient" &&
      restaurant.bg_gradient_start &&
      restaurant.bg_gradient_end
    ) {
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
        backgroundImage: `linear-gradient(${directionMap[restaurant.gradient_direction] || "to bottom right"}, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`,
      };
    }

    return { backgroundColor: restaurant.bg_color || "#ffffff" };
  };

  const textColor = restaurant.headings_text_color || "#000000";

  const openingHours = restaurant.opening_hours
    ? (restaurant.opening_hours as OpeningHoursData)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50  flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
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
            <div className="relative p-8 text-center no-scroll max-h-[95dvh] overflow-y-auto">
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
                    style={{
                      backgroundColor: restaurant.accent_color || "#10b981",
                    }}
                  >
                    <span className="text-3xl font-bold text-white">
                      {restaurant.name.charAt(0)}
                    </span>
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
                <h2
                  className="mb-2 text-2xl font-bold"
                  style={{ color: textColor }}
                >
                  {t("welcome_message", { restaurantName: restaurant.name })}
                </h2>

                {/* Event Announcement or Welcome Message */}
                <p
                  className="text-sm leading-relaxed opacity-90"
                  style={{ color: textColor }}
                >
                  {restaurant.menu_popup_message ||
                    restaurant.bio ||
                    t("default_message")}
                </p>
              </motion.div>

              {/* Restaurant Info */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 space-y-3 mx-autoflex items-center justify-center flex-col"
              >
                {welcomePopupShowInfo.ratings &&
                  restaurant.google_place_id &&
                  restaurant?.user?.subscription_plan !== "basic" &&
                  RatingInfo && (
                    <div
                      className={`flex items-center justify-center gap-1 text-sm mx-auto w-full`}
                    >
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span
                        style={{
                          color: restaurant.headings_text_color || "#000000",
                        }}
                      >
                        {RatingInfo?.rating.toFixed(1)}
                      </span>
                      <span
                        style={{
                          color: restaurant.headings_text_color || "#000000",
                        }}
                        className="opacity-80"
                      >
                        {RatingInfo?.user_ratings_total <= 1
                          ? t("reviews_singular", {
                              count: RatingInfo?.user_ratings_total || 0,
                            })
                          : t("reviews_plural", {
                              count: RatingInfo?.user_ratings_total || 0,
                            })}
                        )
                      </span>
                    </div>
                  )}

                {welcomePopupShowInfo.address && restaurant.address && (
                  <div className="flex items-center justify-center gap-2">
                    <MapPin
                      className="h-4 w-4"
                      style={{ color: restaurant.accent_color || "#10b981" }}
                    />
                    <span className="text-sm" style={{ color: textColor }}>
                      {restaurant.address}
                    </span>
                  </div>
                )}

                {welcomePopupShowInfo.hours &&
                  openingHours &&
                  restaurant.timezone && (
                    <>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="mb-4"
                      >
                        <OpeningHoursStatus
                          openingHours={openingHours}
                          pop={true}
                          restaurentTimeZone={restaurant.timezone}
                          color={restaurant.headings_text_color || "#000000"}
                          className="text-white cursor-pointer text-center"
                          accentColor={restaurant.accent_color || "#10b981"}
                          onClick={() => {}}
                        />
                      </motion.div>
                    </>
                  )}

                {welcomePopupShowInfo.phone && restaurant.phone && (
                  <div className="flex items-center justify-center gap-2">
                    <Phone
                      className="h-4 w-4"
                      style={{ color: restaurant.accent_color || "#10b981" }}
                    />
                    <span className="text-sm" style={{ color: textColor }}>
                      {restaurant.phone}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}
              {restaurant.menu_popup_show_button && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  {/* Main Action Button - Only show if enabled AND no events are displayed */}
                  {restaurant.menu_popup_show_button && (
                    <Button
                      onClick={onClose}
                      className="w-full h-12 rounded-xl py-3 font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: restaurant.accent_color || "#10b981",
                        color: restaurant.button_text_icons_color || "white",
                      }}
                    >
                      {t("explore_button")}
                    </Button>
                  )}

                  <button
                    onClick={handleDontShowAgain}
                    className="text-sm opacity-75 transition-opacity hover:opacity-100"
                    style={{ color: textColor }}
                  >
                    {t("dont_show_again")}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
