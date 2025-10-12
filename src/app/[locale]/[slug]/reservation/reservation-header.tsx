"use client";

import { Button } from "@/components/ui/button";
import type { Restaurant } from "@prisma/client";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ReservationHeaderProps {
    restaurant: Restaurant;
    stylesData: {
        headerBg: string;
        headerText: string;
        headerCartButtonBG: string;
        headerCartButtonBorder: string;
    };
}

export function ReservationHeader({
    restaurant,
    stylesData,
}: ReservationHeaderProps) {
    return (
        <>

            <div
                style={{
                    backgroundColor: stylesData.headerBg,
                }}
                className=" sticky top-0 z-40 shadow-sm"
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - Restaurant info */}
                        <div className="flex items-center space-x-4">
                            <Link href={`/${restaurant.slug}`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 cursor-pointer hover:bg-transparent"
                                >
                                    <ArrowLeft
                                        style={{
                                            color: stylesData.headerText,
                                        }}
                                        className="h-4 w-4"
                                    />
                                </Button>
                            </Link>

                            <div className="flex items-center space-x-3">
                                {restaurant.logo_url && (
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                        <Image
                                            src={restaurant.logo_url || "/placeholder.svg"}
                                            alt={restaurant.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <h1
                                        style={{
                                            color: stylesData.headerText,
                                        }}
                                        className="text-lg !leading-[1] font-bold text-gray-900 line-clamp-1"
                                    >
                                        {restaurant.name}
                                    </h1>
                                    <p
                                        style={{
                                            color: stylesData.headerText,
                                        }}
                                        className="text-sm opacity-80 !leading-[1]"
                                    >
                                        Reservations
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right side - My Reservations */}
                        <Button
                            style={{
                                backgroundColor: stylesData.headerCartButtonBG,
                                color: stylesData.headerText,
                                borderColor: stylesData.headerCartButtonBorder || "white",
                            }}
                            variant="outline"
                            className="relative cursor-pointer"
                            size="sm"
                        >
                            <CalendarDays className="h-4 w-4" />
                            My Reservations
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
