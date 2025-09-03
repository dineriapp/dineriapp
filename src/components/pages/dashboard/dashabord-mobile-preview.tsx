"use client"
import { GoogleRating } from '@/app/[slug]/_components/google-rating'
import { OpeningHoursStatus } from '@/app/[slug]/_components/opening-hours-status'
import SocialIcons from '@/components/social-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getLucideIconBySlug } from '@/lib/get-icons'
import { useLinks } from '@/lib/link-queries'
import { container } from '@/lib/reuseable-data'
import { useGoogleReviews } from '@/lib/review-api'
import { getBackgroundStyle } from '@/lib/utils'
import { OpeningHoursData } from '@/types'
import { Restaurant } from '@prisma/client'
import { Battery, ExternalLink, MoreVertical, Signal, Wifi } from 'lucide-react'
import { motion } from "motion/react"
import Link from 'next/link'
import { useState } from 'react'

const DashabordMobilePreview = ({ selectedRestaurant }: { selectedRestaurant: Restaurant }) => {
    const [currentTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    const openingHours = selectedRestaurant?.opening_hours ? (selectedRestaurant?.opening_hours as OpeningHoursData) : null
    const { data: reviewData, isLoading: reviewLoading } = useGoogleReviews(selectedRestaurant?.google_place_id);
    const { data: links = [], isLoading: linksLoading, } = useLinks(selectedRestaurant?.id)

    return (
        <Card className="overflow-hidden border-slate-200">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-slate-900">Preview</CardTitle>
                        <CardDescription className="text-slate-500">
                            See how your page looks on mobile devices
                        </CardDescription>
                    </div>
                    <Link href={`/${selectedRestaurant?.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="text-slate-700 border-slate-200">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="mx-auto max-w-[350px] lg:max-w-[400px] p-6">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-teal-500/20 to-blue-500/20 blur-xl opacity-30 scale-105 translate-y-2"></div>

                        <div className="relative rounded-[2rem] bg-black overflow-hidden shadow-[0_0_0_12px_rgba(0,0,0,0.8)]">
                            <div className="absolute -right-[2px] top-16 w-[3px] h-12 bg-gray-800 rounded-l-lg"></div>
                            <div className="absolute -left-[2px] top-20 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>
                            <div className="absolute -left-[2px] top-28 w-[3px] h-6 bg-gray-800 rounded-r-lg"></div>

                            <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                                <div className="w-[84px] h-[32px] bg-black rounded-b-[18px] flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] ring-[3px] ring-[#121212] absolute left-4"></div>
                                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a] absolute right-4"></div>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center justify-between text-white px-4 pt-2 text-[12px] font-medium">
                                <span>{currentTime}</span>
                                <div className="flex items-center gap-1">
                                    <Signal className="h-3 w-3" />
                                    <Wifi className="h-3 w-3" />
                                    <Battery className="h-3 w-3" />
                                </div>
                            </div>

                            <div className="mt-1">
                                <div className="min-h-[600px] lg:min-h-[650px] no-scroll overflow-y-auto max-h-[610px]" style={getBackgroundStyle({
                                    props: {
                                        bg_color: selectedRestaurant?.bg_color || "",
                                        bg_gradient_end: selectedRestaurant.bg_gradient_end || "",
                                        bg_gradient_start: selectedRestaurant?.bg_gradient_start || "",
                                        bg_image_url: selectedRestaurant?.bg_image_url || "",
                                        bg_type: selectedRestaurant?.bg_type,
                                        gradient_direction: selectedRestaurant?.gradient_direction
                                    }
                                })}>
                                    <div className="p-4 flex flex-col items-center">
                                        {selectedRestaurant?.logo_url ? (
                                            <motion.img
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                src={selectedRestaurant.logo_url}
                                                alt={selectedRestaurant.name}
                                                className="mb-5 h-24 w-24 rounded-full object-cover"
                                                loading="eager" />
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                className="mb-5 flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ring-white/20 fallback-initial"
                                                style={{ backgroundColor: selectedRestaurant?.accent_color || "blue" }}
                                            >
                                                <span className="text-xl font-bold text-white">{selectedRestaurant?.name.charAt(0)}</span>
                                            </motion.div>
                                        )}

                                        <motion.h2
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="mb-3 text-2xl font-bold"
                                            style={{
                                                color: selectedRestaurant?.headings_text_color || "#000000",
                                                fontFamily: selectedRestaurant?.font_family || "Inter",
                                            }}
                                        >
                                            {selectedRestaurant?.name}
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
                                                    color={selectedRestaurant?.headings_text_color || "#000000"}
                                                    className="text-white cursor-pointer text-center"
                                                    accentColor={selectedRestaurant?.accent_color || "#10b981"}
                                                />
                                            </motion.div>
                                        )}

                                        {
                                            selectedRestaurant?.google_place_id &&
                                                reviewLoading
                                                ?
                                                <Skeleton className="w-[80px] h-[36px] animate-pulse" />
                                                :
                                                reviewData?.rating
                                                    ?
                                                    <motion.div
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.25 }}
                                                        className="mb-4"
                                                    >
                                                        <GoogleRating info={{
                                                            rating: reviewData?.rating,
                                                            user_ratings_total: reviewData?.user_ratings_total
                                                        }}
                                                            color={selectedRestaurant?.headings_text_color || "#000000"}
                                                        />
                                                    </motion.div>
                                                    :
                                                    ""
                                        }

                                        {selectedRestaurant?.bio && (
                                            <motion.p
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="mx-auto mb-4 text-center max-w-md text-sm"
                                                style={{
                                                    color: selectedRestaurant?.headings_text_color || "#000000",
                                                    opacity: 0.9,
                                                    fontFamily: selectedRestaurant?.font_family || "Inter",
                                                }}
                                            >
                                                {selectedRestaurant?.bio}
                                            </motion.p>
                                        )}

                                        {(selectedRestaurant?.instagram ||
                                            selectedRestaurant?.facebook ||
                                            selectedRestaurant?.email ||
                                            selectedRestaurant?.address ||
                                            selectedRestaurant?.whatsapp)
                                            &&
                                            <SocialIcons
                                                restaurant={
                                                    {
                                                        address: selectedRestaurant?.address,
                                                        email: selectedRestaurant.email,
                                                        facebook: selectedRestaurant.facebook,
                                                        instagram: selectedRestaurant.facebook,
                                                        whatsapp: selectedRestaurant.whatsapp,
                                                    }
                                                }
                                                className="mb-4"
                                                theme={{
                                                    socialIconColor: selectedRestaurant.social_icon_color,
                                                    socialIconBgShow: selectedRestaurant.social_icon_bg_show,
                                                    socialIconBgColor: selectedRestaurant.social_icon_bg_color,
                                                    social_icon_gap: selectedRestaurant.social_icon_gap
                                                }}
                                            />
                                        }
                                    </div>

                                    <motion.div variants={container} initial="hidden" animate="show" className="flex-grow px-4 mb-4 flex flex-col"
                                        style={{ rowGap: `${selectedRestaurant.buttons_gap_in_px}px` }}
                                    >
                                        {
                                            linksLoading ?
                                                <p className="w-full text-center text-sm">
                                                    Loading..
                                                </p>
                                                :
                                                <>
                                                    {
                                                        links?.length > 0 ?
                                                            <>
                                                                {links?.map((link) => (
                                                                    <div
                                                                        key={link.id}
                                                                        rel="noopener noreferrer"
                                                                        className={`group flex items-center justify-center  text-center  w-full h-[52px] transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${selectedRestaurant?.button_icons_show ? "px-14" : "px-4"} ${selectedRestaurant.button_style === "pill"
                                                                            ? "rounded-full"
                                                                            : selectedRestaurant.button_style === "square"
                                                                                ? "rounded-md"
                                                                                : "rounded-xl"
                                                                            }`}
                                                                        style={{
                                                                            backgroundColor:
                                                                                selectedRestaurant?.button_variant === "solid"
                                                                                    ? selectedRestaurant?.accent_color || "#10b981"
                                                                                    : "transparent",
                                                                            backdropFilter: "blur(8px)",
                                                                            border: `2px solid ${selectedRestaurant?.accent_color || "#10b981"}`,
                                                                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                                                                            color: selectedRestaurant?.button_variant === "solid" ? selectedRestaurant?.button_text_icons_color || "#000000" : selectedRestaurant?.accent_color || "#10b981",
                                                                            fontFamily: selectedRestaurant?.font_family || "Inter",
                                                                            letterSpacing: "0.01em",
                                                                        }}
                                                                    >

                                                                        {
                                                                            selectedRestaurant?.button_icons_show
                                                                            &&
                                                                            <div className="flex aspect-square absolute left-[7px] shrink-0 size-[38px] items-center justify-center rounded-full "
                                                                                style={{
                                                                                    backgroundColor: selectedRestaurant.button_text_icons_color || "transparent"
                                                                                }}
                                                                            >
                                                                                {getLucideIconBySlug(link.icon_slug, { className: "w-4 h-4", style: { color: selectedRestaurant.accent_color || "transparent" } })}
                                                                            </div>
                                                                        }
                                                                        <span
                                                                            className={`relative w-full text-[15px] ${selectedRestaurant.button_variant === "outline" ? "group-hover:text-white" : ""
                                                                                } transition-colors duration-300 font-medium`}
                                                                            style={{
                                                                                color:
                                                                                    selectedRestaurant.button_variant === "outline" ? selectedRestaurant.accent_color || "#10b981" : selectedRestaurant.button_text_icons_color || undefined,
                                                                            }}
                                                                        >
                                                                            {link.title}
                                                                        </span>
                                                                        {
                                                                            selectedRestaurant?.button_icons_show
                                                                            &&
                                                                            <div className="absolute  right-[5px] flex items-center justify-center size-[25px] rounded-full hover:bg-gray-100/10">
                                                                                <MoreVertical className="size-4" />
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                ))}
                                                            </>
                                                            :
                                                            <p className="w-full text-center text-sm">
                                                                No links yet add some to see preview.
                                                            </p>
                                                    }
                                                </>
                                        }

                                    </motion.div>
                                </div>

                                <div className="absolute bottom-1 inset-x-0 flex justify-center pb-1">
                                    <div className="w-[100px] h-1 bg-white/30 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default DashabordMobilePreview
