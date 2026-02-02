"use client";

import { ReservationPolicy, Restaurant } from "@prisma/client";
import ReservationStatusBanner from "../../(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/reservations/reservation-status-banner";
import { SettingsState } from "../../(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types";
import BookingInterface from "./_components/booking-interface";
import { ReservationHeader } from "./reservation-header";

interface ReservationClientProps {
    restaurant: Restaurant & { reservation_settings: { settings: SettingsState }, Reservation_policy: ReservationPolicy | null };
}

const ReservationClientSide = ({ restaurant }: ReservationClientProps) => {
    const settings = restaurant?.reservation_settings?.settings;
    const rs = settings?.restaurantSettings;

    // 🔥 if ANY is true → block booking interface
    const bookingDisabled =
        rs?.pause_new_reservations === true ||
        rs?.emergency_closure === true;

    return (
        <div
            style={{ backgroundColor: restaurant.bgColor }}
            className="w-full min-h-screen"
        >
            <ReservationHeader
                restaurant={restaurant}
            />

            {/* 🔥 Status Banner (always show if paused/closed/message) */}
            {settings && bookingDisabled && (
                <div className="px-5 max-w-7xl mx-auto py-6">
                    <ReservationStatusBanner settings={settings} />
                </div>
            )}

            {/* 🔥 Only show booking interface when NOT paused/closed */}
            {!bookingDisabled && (
                <div className="w-full px-5">
                    <BookingInterface restaurant={restaurant} />
                </div>
            )}
        </div>
    );
};

export default ReservationClientSide;
