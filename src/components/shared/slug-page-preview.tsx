"use client";
import { GoogleRating } from '@/app/[locale]/[slug]/_components/google-rating';
import { OpeningHoursStatus } from '@/app/[locale]/[slug]/_components/opening-hours-status';
import { Link } from '@/i18n/navigation';
import { useSession } from '@/lib/auth/auth-client';
import { useEvents } from '@/lib/event-queries';
import { useFaqCategories } from '@/lib/faq-queries';
import { getLucideIconBySlug } from '@/lib/get-icons';
import { useLinks } from '@/lib/link-queries';
import { container, itemSlugPage } from '@/lib/reuseable-data';
import { useGoogleReviews } from '@/lib/review-api';
import { useMenuCategories } from '@/lib/tanstack/menu-queries';
import { AppearanceFormData } from '@/lib/types';
import { cn, getBackgroundStyle } from '@/lib/utils';
import { useRestaurantStore } from '@/stores/restaurant-store';
import { OpeningHoursData } from '@/types';
import {
    Battery,
    ExternalLink,
    MoreVertical,
    Share2,
    Signal,
    UtensilsCrossed,
    Wifi
} from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BsPatchCheckFill } from 'react-icons/bs';
import SocialIcons from '../social-icons';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type SlugPagePreviewProps = {
    className?: string;
    formData: AppearanceFormData;
}

const SlugPagePreview = ({ className, formData }: SlugPagePreviewProps) => {
    const t2 = useTranslations("dashboard.dashboardMobilePreview");

    const [currentTime] = useState(() =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    );

    const { selectedRestaurant } = useRestaurantStore();
    const { data: session } = useSession();
    const openingHours = selectedRestaurant?.opening_hours
        ? (selectedRestaurant?.opening_hours as OpeningHoursData)
        : null;

    const { data: reviewData, isLoading: reviewLoading } = useGoogleReviews(
        selectedRestaurant?.google_place_id,
    );

    const { data: links = [], isLoading: linksLoading } = useLinks(
        selectedRestaurant?.id,
    );

    const { data: events, isLoading: eventsLoading } = useEvents(selectedRestaurant?.id);

    const { data: categories, isLoading: menuCategoriesLoading } = useMenuCategories(selectedRestaurant?.id);

    const { data: faqcategories, isLoading: faqCategoriesLoading } = useFaqCategories(selectedRestaurant?.id);

    const headingsColor = selectedRestaurant?.headings_text_color || "#ffffff";

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.style.display = "none";
        const fallback =
            e.currentTarget.parentElement?.querySelector(".fallback-initial");
        if (fallback) {
            fallback.classList.remove("hidden");
        }
    };

    const hasMenuItems = categories?.some(
        (category) => category.items && category.items.length > 0,
    );

    const hasFaqsItems = faqcategories?.some(
        (category) => category.faqs && category.faqs.length > 0,
    );

    const bookingDisabled =
        selectedRestaurant?.reservation_settings?.settings?.restaurantSettings
            ?.pause_new_reservations === true ||
        selectedRestaurant?.reservation_settings?.settings?.restaurantSettings
            ?.emergency_closure === true ||
        !selectedRestaurant?.reservation_settings?.settings;

    const hasReservation =
        !bookingDisabled && session?.user?.subscription_plan !== "basic";

    const hasCustomLinks = links && links.length > 0;

    const hasMenu =
        categories && categories.length > 0 && hasMenuItems;

    const hasEvents = events && events.length > 0;


    const hasFaq = faqcategories && faqcategories?.length > 0 && hasFaqsItems;

    const hasFoodSection =
        hasReservation || hasCustomLinks || hasMenu || hasEvents;

    const hasAboutSection = hasFaq || hasCustomLinks || hasEvents;

    const isCompletelyEmpty = !hasFoodSection && !hasAboutSection;

    const isPreviewLoading =
        !selectedRestaurant ||
        reviewLoading ||
        linksLoading ||
        eventsLoading ||
        menuCategoriesLoading ||
        faqCategoriesLoading;

    const accent = formData?.accent_color || "#10b981";
    const textColor = formData?.headings_text_color || "#ffffff";
    const buttonTextColor =
        formData?.button_text_icons_color || "#ffffff";

    return (
        <div className={cn(className)}>
            <Card className="overflow-hidden pt-0 border-slate-200 box-shad-every-2">
                <CardHeader className="bg-gray-100/50 pb-4 pt-6 font-poppins">
                    <div className="flex items-center justify-between font-poppins">
                        <div>
                            <CardTitle className="text-slate-900">
                                {t2("card.title")}
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                {t2("card.description")}
                            </CardDescription>
                        </div>
                        <Link href={`/${selectedRestaurant?.slug}`} target="_blank">
                            <Button variant="outline" size="sm" className="text-white h-[38px] !px-5 hover:text-white cursor-pointer font-poppins rounded-full bg-[#009A5E] hover:bg-[#009A5E]/80">
                                <ExternalLink className="h-4 w-4" />
                                {t2("card.visitButton")}
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* <div className="mx-auto max-w-[350px] lg:max-w-[390px] p-6"> */}
                    <div className="mx-auto max-w-[410px] p-4">
                        <div className="relative">
                            <div className="relative rounded-[2rem] bg-black overflow-hidden ring-[10px] ring-[#0f0f0f] shadow-2xl">
                                <div className="absolute -right-[2px] top-16 w-[3px] h-12 bg-gray-800 rounded-l-lg"></div>
                                <div className="absolute -left-[2px] top-20 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>
                                <div className="absolute -left-[2px] top-28 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>
                                <div className="relative z-10 flex items-center justify-between text-white px-4 pt-2 text-[12px] font-medium">
                                    <span>{currentTime}</span>
                                    <div className="flex items-center gap-1">
                                        <Signal className="h-3 w-3" />
                                        <Wifi className="h-3 w-3" />
                                        <Battery className="h-3 w-3" />
                                    </div>
                                </div>
                                {/* start of ui */}
                                <div className='h-full w-full overflow-hidden'>
                                    <div
                                        className="min-h-[600px] relative mt-1.5 lg:min-h-[650px] no-scroll overflow-y-auto bg-red-500 max-h-[640px]"
                                        style={{
                                            ...getBackgroundStyle({
                                                bg_color: formData?.bg_color || "",
                                                bg_gradient_end: formData.bg_gradient_end || "",
                                                bg_gradient_start:
                                                    formData?.bg_gradient_start || "",
                                                bg_image_url: formData?.bg_image_url || "",
                                                bg_type: formData?.bg_type,
                                                gradient_direction: formData?.gradient_direction,
                                            }),
                                            fontFamily: formData.font_family || "var(--font-space-grotesk)",
                                        }}
                                    >
                                        {
                                            isPreviewLoading ?
                                                <div className="flex flex-col items-center justify-center min-h-[600px] px-6 text-center relative overflow-hidden">

                                                    {/* Background Glow */}
                                                    <div
                                                        className="absolute w-60 h-60 rounded-full blur-3xl opacity-30"
                                                        style={{ backgroundColor: accent }}
                                                    />

                                                    {/* Animated Logo Circle */}
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 0.4 }}
                                                        className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                                                        style={{
                                                            backgroundColor: accent,
                                                        }}
                                                    >
                                                        <UtensilsCrossed
                                                            className="w-8 h-8"
                                                            style={{ color: buttonTextColor }}
                                                        />
                                                    </motion.div>

                                                    {/* Loading Text */}
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="mt-6 text-lg font-semibold"
                                                        style={{ color: textColor }}
                                                    >
                                                        {t2("states.loadingPreview")}
                                                    </motion.p>

                                                    {/* Animated Dots */}
                                                    <div className="flex gap-2 mt-4 relative z-10">
                                                        <span
                                                            className="w-2 h-2 rounded-full animate-bounce"
                                                            style={{ backgroundColor: accent }}
                                                        />
                                                        <span
                                                            className="w-2 h-2 rounded-full animate-bounce delay-150"
                                                            style={{ backgroundColor: accent }}
                                                        />
                                                        <span
                                                            className="w-2 h-2 rounded-full animate-bounce delay-300"
                                                            style={{ backgroundColor: accent }}
                                                        />
                                                    </div>

                                                    {/* Subtle Skeleton Buttons */}
                                                    <div className="mt-12 w-full space-y-4">
                                                        {[1, 2, 3].map((item) => (
                                                            <div
                                                                key={item}
                                                                className="h-14 w-full rounded-xl animate-pulse"
                                                                style={{
                                                                    backgroundColor: accent,
                                                                    opacity: 0.15,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                :
                                                <div className="relative w-full items-center justify-center flex flex-grow flex-col px-4 pb-8 pt-5">
                                                    <div className="w-full flex justify-end">
                                                        <button
                                                            title="Share this page"
                                                            className="flex items-center gap-2 cursor-pointer font-inherit! px-4 py-2 rounded-full transition-all hover:scale-105 "
                                                            style={{
                                                                backgroundColor:
                                                                    formData.button_variant === "solid"
                                                                        ? formData.accent_color || "#10b981"
                                                                        : "transparent",
                                                                color:
                                                                    formData.button_variant === "solid"
                                                                        ? buttonTextColor
                                                                        : formData.accent_color || "#10b981",
                                                            }}
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                {t2("actions.share")}
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <div className='w-full flex flex-grow flex-col pt-11'>
                                                        {/* top info  */}
                                                        <div className='w-full flex flex-col items-center justify-center'>
                                                            {selectedRestaurant?.logo_url ? (
                                                                <motion.img
                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                                    src={selectedRestaurant?.logo_url}
                                                                    alt={selectedRestaurant?.name}
                                                                    onError={handleImageError}
                                                                    className="h-32 w-32 rounded-full object-cover"
                                                                    loading="eager"
                                                                    style={{
                                                                        boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <motion.div
                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                                    className="flex h-32 w-32 items-center justify-center rounded-full shadow-lg ring-4 ring-white/20 fallback-initial"
                                                                    style={{
                                                                        backgroundColor: selectedRestaurant?.accent_color || "#10b981",
                                                                    }}
                                                                >
                                                                    <span className="text-5xl font-bold text-white">
                                                                        {selectedRestaurant?.name.charAt(0)}
                                                                    </span>
                                                                </motion.div>
                                                            )}
                                                            <div className="flex items-center mt-4 justify-center gap-1">
                                                                <motion.h2
                                                                    initial={{ y: 20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                    className="text-[28px] font-bold"
                                                                    style={{
                                                                        color: headingsColor,
                                                                    }}
                                                                >
                                                                    {selectedRestaurant?.name}
                                                                </motion.h2>
                                                                <BsPatchCheckFill size={22} className="text-blue-500" />
                                                            </div>
                                                            {selectedRestaurant?.bio && (
                                                                <motion.p
                                                                    initial={{ y: 20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.3 }}
                                                                    className="mx-auto text-center text-[17px] mt-3"
                                                                    style={{
                                                                        color: headingsColor,
                                                                        opacity: 0.9,
                                                                    }}
                                                                >
                                                                    {selectedRestaurant?.bio}
                                                                </motion.p>
                                                            )}
                                                            <div className="flex items-center justify-center flex-col mt-4 gap-2">
                                                                {/* Opening Hours */}
                                                                {openingHours && selectedRestaurant?.timezone && (
                                                                    <motion.div
                                                                        initial={{ y: 20, opacity: 0 }}
                                                                        animate={{ y: 0, opacity: 1 }}
                                                                        transition={{ delay: 0.25 }}
                                                                        className=""
                                                                    >
                                                                        <OpeningHoursStatus
                                                                            openingHours={openingHours}
                                                                            restaurentTimeZone={selectedRestaurant?.timezone || ""}
                                                                            color={selectedRestaurant?.headings_text_color || "#000000"}
                                                                            className="text-white cursor-pointer text-center"
                                                                            accentColor={selectedRestaurant?.headings_text_color || "#10b981"}
                                                                            onClick={() => { }}
                                                                        />
                                                                    </motion.div>
                                                                )}
                                                                {/* reviews  */}
                                                                {selectedRestaurant?.google_place_id && !reviewLoading && reviewData?.rating &&
                                                                    (
                                                                        <motion.a
                                                                            initial={{ y: 20, opacity: 0 }}
                                                                            animate={{ y: 0, opacity: 1 }}
                                                                            transition={{ delay: 0.25 }}
                                                                            target="_blank"
                                                                            href={`https://search.google.com/local/reviews?placeid=${selectedRestaurant?.google_place_id}`}
                                                                            className=""
                                                                        >
                                                                            <GoogleRating
                                                                                info={{
                                                                                    rating: reviewData?.rating,
                                                                                    user_ratings_total:
                                                                                        reviewData?.user_ratings_total,
                                                                                }}
                                                                                color={
                                                                                    formData?.headings_text_color || "#000000"
                                                                                }
                                                                                className="text-white"
                                                                            />
                                                                        </motion.a>
                                                                    )}
                                                            </div>
                                                            {(selectedRestaurant?.instagram ||
                                                                selectedRestaurant?.facebook ||
                                                                selectedRestaurant?.email ||
                                                                selectedRestaurant?.address ||
                                                                selectedRestaurant?.whatsapp) &&
                                                                selectedRestaurant?.social_icons_position === "top" && (
                                                                    <SocialIcons
                                                                        containerClassName="p-4!"
                                                                        restaurant={{
                                                                            address: selectedRestaurant?.address,
                                                                            email: selectedRestaurant?.email,
                                                                            facebook: selectedRestaurant?.facebook,
                                                                            instagram: selectedRestaurant?.instagram,
                                                                            whatsapp: selectedRestaurant?.whatsapp,
                                                                            tiktok: selectedRestaurant?.tiktok,
                                                                            phone: selectedRestaurant?.phone,
                                                                        }}
                                                                        className="mt-6"
                                                                        theme={{
                                                                            socialIconColor: formData?.social_icon_color,
                                                                            socialIconBgShow: formData?.social_icon_bg_show,
                                                                            socialIconBgColor: formData?.social_icon_bg_color,
                                                                            social_icon_gap: formData?.social_icon_gap,
                                                                        }}
                                                                    />
                                                                )}
                                                        </div>
                                                        {/* buttons */}
                                                        <motion.div
                                                            variants={container}
                                                            initial="hidden"
                                                            animate="show"
                                                            className="flex-grow mt-8 flex flex-col"
                                                            style={{ rowGap: `${formData.buttons_gap_in_px}px` }}
                                                        >
                                                            {isCompletelyEmpty && (
                                                                <motion.div
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    className="py-8 text-center"
                                                                    style={{ color: headingsColor, opacity: 0.7 }}
                                                                >
                                                                    {t2("states.empty")}
                                                                </motion.div>
                                                            )}

                                                            {hasFoodSection && formData.use_headings_in_buttons && (
                                                                <motion.h2
                                                                    initial={{ y: 20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                    className="text-[20px] font-bold text-center uppercase"
                                                                    style={{
                                                                        color: headingsColor,
                                                                        opacity: 0.9,
                                                                    }}
                                                                >
                                                                    {formData.food_heading}
                                                                </motion.h2>
                                                            )}

                                                            {hasReservation && (
                                                                <motion.a
                                                                    variants={itemSlugPage}
                                                                    href={`/${selectedRestaurant?.slug}/reservation`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`group flex items-center justify-center  text-center  w-full py-4  transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${formData?.button_icons_show ? "px-14" : "px-4"} ${formData.button_style === "pill"
                                                                        ? "rounded-full"
                                                                        : formData.button_style === "square"
                                                                            ? "rounded-md"
                                                                            : "rounded-xl"
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            formData.button_variant === "solid"
                                                                                ? formData.accent_color || "#10b981"
                                                                                : "transparent",
                                                                        backdropFilter: "blur(8px)",
                                                                        border: `2px solid ${formData.accent_color || "#10b981"}`,
                                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                        color:
                                                                            formData?.button_variant === "solid"
                                                                                ? buttonTextColor
                                                                                : formData?.accent_color || "#10b981",
                                                                        letterSpacing: "0.01em",
                                                                    }}
                                                                >
                                                                    {formData?.button_icons_show && (
                                                                        <div
                                                                            className="flex aspect-square absolute left-[7px] shrink-0 size-[54px]! items-center justify-center rounded-full "
                                                                            style={{
                                                                                backgroundColor:
                                                                                    formData?.button_text_icons_color || "transparent",
                                                                            }}
                                                                        >
                                                                            <UtensilsCrossed
                                                                                style={{
                                                                                    color: formData?.accent_color || "transparent",
                                                                                }}
                                                                                className="w-5 h-5 "
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span
                                                                        className={`relative w-full text-[26px] ${formData?.button_variant === "outline"
                                                                            ? "group-hover:text-white"
                                                                            : ""
                                                                            } transition-colors duration-300 font-semibold break-all`}
                                                                        style={{
                                                                            color:
                                                                                formData?.button_variant === "outline"
                                                                                    ? formData?.accent_color || "#10b981"
                                                                                    : buttonTextColor,
                                                                        }}
                                                                    >
                                                                        {t2("buttons.reserveTable")}
                                                                    </span>
                                                                    {formData?.button_icons_show && (
                                                                        <div className="absolute  right-[5px] flex items-center justify-center size-[35px] rounded-full hover:bg-gray-100/10">
                                                                            <MoreVertical className="size-4" />
                                                                        </div>
                                                                    )}
                                                                </motion.a>
                                                            )}

                                                            {hasMenu && (
                                                                <motion.button
                                                                    variants={itemSlugPage}
                                                                    className={`group flex items-center justify-center  text-center ${formData?.button_icons_show ? "px-14" : "px-4"} w-full py-4  transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${formData.button_style === "pill"
                                                                        ? "rounded-full"
                                                                        : formData.button_style === "square"
                                                                            ? "rounded-md"
                                                                            : "rounded-xl"
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            formData.button_variant === "solid"
                                                                                ? formData.accent_color || "#10b981"
                                                                                : "transparent",
                                                                        color:
                                                                            formData.button_variant === "solid"
                                                                                ? buttonTextColor
                                                                                : formData.accent_color || "#10b981",
                                                                        backdropFilter: "blur(8px)",
                                                                        border: `2px solid ${formData.accent_color || "#10b981"}`,
                                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                        letterSpacing: "0.01em",
                                                                    }}
                                                                >
                                                                    {formData?.button_icons_show && (
                                                                        <div
                                                                            className="flex aspect-square absolute left-[7px] shrink-0 size-[54px]! items-center justify-center rounded-full "
                                                                            style={{
                                                                                backgroundColor:
                                                                                    formData.button_text_icons_color || "transparent",
                                                                            }}
                                                                        >
                                                                            {getLucideIconBySlug("menu", {
                                                                                className: "w-5 h-5",
                                                                                style: {
                                                                                    color: formData.accent_color || "transparent",
                                                                                },
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                    <span
                                                                        className={`relative w-full text-[26px] ${formData.button_variant === "outline"
                                                                            ? "group-hover:text-white"
                                                                            : ""
                                                                            } transition-colors duration-300 font-semibold break-all`}
                                                                        style={{
                                                                            color:
                                                                                formData.button_variant === "outline"
                                                                                    ? formData.accent_color || "#10b981"
                                                                                    : buttonTextColor,
                                                                        }}
                                                                    >
                                                                        {t2("buttons.menu")}
                                                                    </span>
                                                                    {formData?.button_icons_show && (
                                                                        <div className="absolute  right-[5px] flex items-center justify-center size-[35px] rounded-full hover:bg-gray-100/10">
                                                                            <MoreVertical className="size-4" />
                                                                        </div>
                                                                    )}
                                                                </motion.button>
                                                            )}

                                                            {hasAboutSection && formData.use_headings_in_buttons && (
                                                                <motion.h2
                                                                    initial={{ y: 20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.2 }}
                                                                    className="text-[20px] font-bold text-center uppercase"
                                                                    style={{
                                                                        color: headingsColor,
                                                                        opacity: 0.9,
                                                                    }}
                                                                >
                                                                    {formData.about_heading}
                                                                </motion.h2>
                                                            )}

                                                            {links?.map((link) => (
                                                                <motion.a
                                                                    key={link.id}
                                                                    variants={itemSlugPage}
                                                                    href={link.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`group flex items-center justify-center  text-center  w-full py-4 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${formData?.button_icons_show ? "px-14" : "px-4"} ${formData.button_style === "pill"
                                                                        ? "rounded-full"
                                                                        : formData.button_style === "square"
                                                                            ? "rounded-md"
                                                                            : "rounded-xl"
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            formData.button_variant === "solid"
                                                                                ? formData.accent_color || "#10b981"
                                                                                : "transparent",
                                                                        backdropFilter: "blur(8px)",
                                                                        border: `2px solid ${formData.accent_color || "#10b981"}`,
                                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                        color:
                                                                            formData.button_variant === "solid"
                                                                                ? buttonTextColor
                                                                                : formData.accent_color || "#10b981",
                                                                        letterSpacing: "0.01em",
                                                                    }}
                                                                >
                                                                    {formData?.button_icons_show && (
                                                                        <div
                                                                            className="flex aspect-square absolute left-[7px]  shrink-0 size-[54px]! items-center justify-center rounded-full "
                                                                            style={{
                                                                                backgroundColor:
                                                                                    formData.button_text_icons_color || "transparent",
                                                                            }}
                                                                        >
                                                                            {getLucideIconBySlug(link.icon_slug, {
                                                                                className: "w-5 h-5",
                                                                                style: {
                                                                                    color: formData.accent_color || "transparent",
                                                                                },
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                    <span
                                                                        className={`relative w-full text-[26px] ${formData.button_variant === "outline"
                                                                            ? "group-hover:text-white"
                                                                            : ""
                                                                            } transition-colors duration-300 font-semibold break-all`}
                                                                        style={{
                                                                            color:
                                                                                formData.button_variant === "outline"
                                                                                    ? formData.accent_color || "#10b981"
                                                                                    : buttonTextColor,
                                                                        }}
                                                                    >
                                                                        {link.title}
                                                                    </span>
                                                                    {formData?.button_icons_show && (
                                                                        <div className="absolute  right-[5px] flex items-center justify-center size-[35px] rounded-full hover:bg-gray-100/10">
                                                                            <MoreVertical className="size-4" />
                                                                        </div>
                                                                    )}
                                                                </motion.a>
                                                            ))}
                                                            {hasFaq && (
                                                                <motion.button
                                                                    variants={itemSlugPage}
                                                                    className={`group flex items-center justify-center  text-center ${formData?.button_icons_show ? "px-14 " : "px-4"} w-full py-4  transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${formData.button_style === "pill"
                                                                        ? "rounded-full"
                                                                        : formData.button_style === "square"
                                                                            ? "rounded-md"
                                                                            : "rounded-xl"
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            formData.button_variant === "solid"
                                                                                ? formData.accent_color || "#10b981"
                                                                                : "transparent",
                                                                        backdropFilter: "blur(8px)",
                                                                        border: `2px solid ${formData.accent_color || "#10b981"}`,
                                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                        color:
                                                                            formData.button_variant === "solid"
                                                                                ? buttonTextColor
                                                                                : formData.accent_color || "#10b981",
                                                                        letterSpacing: "0.01em",
                                                                    }}
                                                                >
                                                                    {formData?.button_icons_show && (
                                                                        <div
                                                                            className="flex aspect-square absolute left-[7px] shrink-0 size-[54px] items-center justify-center rounded-full "
                                                                            style={{
                                                                                backgroundColor:
                                                                                    formData.button_text_icons_color || "transparent",
                                                                            }}
                                                                        >
                                                                            {getLucideIconBySlug("faq", {
                                                                                className: "w-5 h-5",
                                                                                style: {
                                                                                    color: formData.accent_color || "transparent",
                                                                                },
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                    <span
                                                                        className={`relative w-full text-[26px] ${formData.button_variant === "outline"
                                                                            ? "group-hover:text-white"
                                                                            : ""
                                                                            } transition-colors duration-300 font-semibold break-all`}
                                                                        style={{
                                                                            color:
                                                                                formData.button_variant === "outline"
                                                                                    ? formData.accent_color || "#10b981"
                                                                                    : buttonTextColor,
                                                                        }}
                                                                    >
                                                                        {t2("buttons.faq")}
                                                                    </span>
                                                                    {formData?.button_icons_show && (
                                                                        <div className="absolute  right-[5px] flex items-center justify-center size-[35px] rounded-full hover:bg-gray-100/10">
                                                                            <MoreVertical className="size-4" />
                                                                        </div>
                                                                    )}
                                                                </motion.button>
                                                            )}
                                                            {hasEvents && (
                                                                <motion.button
                                                                    variants={itemSlugPage}
                                                                    className={`group flex items-center justify-center  text-center ${formData?.button_icons_show ? "px-14" : "px-4"} w-full py-4 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${formData.button_style === "pill"
                                                                        ? "rounded-full"
                                                                        : formData.button_style === "square"
                                                                            ? "rounded-md"
                                                                            : "rounded-xl"
                                                                        }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            formData.button_variant === "solid"
                                                                                ? formData.accent_color || "#10b981"
                                                                                : "transparent",
                                                                        backdropFilter: "blur(8px)",
                                                                        border: `2px solid ${formData.accent_color || "#10b981"}`,
                                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                        color:
                                                                            formData.button_variant === "solid"
                                                                                ? buttonTextColor
                                                                                : formData.accent_color || "#10b981",
                                                                        letterSpacing: "0.01em",
                                                                    }}
                                                                >
                                                                    {formData?.button_icons_show && (
                                                                        <div
                                                                            className="flex aspect-square absolute left-[7px] shrink-0 size-[54px]! items-center justify-center rounded-full "
                                                                            style={{
                                                                                backgroundColor:
                                                                                    formData.button_text_icons_color || "transparent",
                                                                            }}
                                                                        >
                                                                            {getLucideIconBySlug("events", {
                                                                                className: "w-5 h-5",
                                                                                style: {
                                                                                    color: formData.accent_color || "transparent",
                                                                                },
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                    <span
                                                                        className={`relative w-full text-[26px] ${formData.button_variant === "outline"
                                                                            ? "group-hover:text-white"
                                                                            : ""
                                                                            } transition-colors duration-300 font-semibold break-all`}
                                                                        style={{
                                                                            color:
                                                                                formData.button_variant === "outline"
                                                                                    ? formData.accent_color || "#10b981"
                                                                                    : buttonTextColor,
                                                                        }}
                                                                    >
                                                                        {t2("buttons.events")}
                                                                    </span>
                                                                    {formData?.button_icons_show && (
                                                                        <div className="absolute  right-[5px] flex items-center justify-center size-[35px] rounded-full hover:bg-gray-100/10">
                                                                            <MoreVertical className="size-4" />
                                                                        </div>
                                                                    )}
                                                                </motion.button>
                                                            )}

                                                            {(selectedRestaurant?.instagram ||
                                                                selectedRestaurant?.facebook ||
                                                                selectedRestaurant?.email ||
                                                                selectedRestaurant?.address ||
                                                                selectedRestaurant?.phone ||
                                                                selectedRestaurant?.tiktok ||
                                                                selectedRestaurant?.whatsapp) &&
                                                                selectedRestaurant?.social_icons_position === "bottom" && (
                                                                    <SocialIcons
                                                                        restaurant={{
                                                                            address: selectedRestaurant?.address,
                                                                            email: selectedRestaurant?.email,
                                                                            facebook: selectedRestaurant?.facebook,
                                                                            instagram: selectedRestaurant?.instagram,
                                                                            whatsapp: selectedRestaurant?.whatsapp,
                                                                            tiktok: selectedRestaurant?.tiktok,
                                                                            phone: selectedRestaurant?.phone,
                                                                        }}
                                                                        className="mb-6"
                                                                        theme={{
                                                                            socialIconColor: formData.social_icon_color,
                                                                            socialIconBgShow: formData.social_icon_bg_show,
                                                                            socialIconBgColor: formData.social_icon_bg_color,
                                                                            social_icon_gap: formData.social_icon_gap,
                                                                        }}
                                                                    />
                                                                )}
                                                        </motion.div>
                                                        <div className="mt-13 pb-6">
                                                            {
                                                                session?.user?.subscription_plan === "basic" &&
                                                                <motion.footer
                                                                    initial={{ opacity: 0 }}
                                                                    animate={{ opacity: 1 }}
                                                                    transition={{ delay: 0.7 }}
                                                                    className=" text-center flex flex-col items-center justify-center gap-3"
                                                                >
                                                                    <div
                                                                        className="flex items-center justify-center gap-4 text-xs opacity-60"
                                                                        style={{ color: headingsColor, opacity: 1 }}
                                                                    >
                                                                        <Link
                                                                            href="/terms"
                                                                            className="hover:opacity-100 transition-opacity"
                                                                        >
                                                                            {t2("footer.terms")}
                                                                        </Link>
                                                                        <span>•</span>
                                                                        <Link
                                                                            href="/privacy-policy"
                                                                            className="hover:opacity-100 transition-opacity"
                                                                        >
                                                                            {t2("footer.privacy")}
                                                                        </Link>
                                                                        <span>•</span>
                                                                        <Link
                                                                            href="/cookies"
                                                                            className="hover:opacity-100 transition-opacity"
                                                                        >
                                                                            {t2("footer.cookies")}
                                                                        </Link>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p
                                                                            className="text-xs"
                                                                            style={{ color: headingsColor, opacity: 1 }}
                                                                        >
                                                                            {" "}
                                                                            {t2("footer.poweredBy")}{" "}
                                                                            <Link
                                                                                href="/"
                                                                                className="hover:underline"
                                                                                style={{ color: formData.accent_color || "#10b981" }}
                                                                            >
                                                                                Dineri.app
                                                                            </Link>
                                                                        </p>
                                                                    </div>
                                                                </motion.footer>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                        }

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SlugPagePreview
