import { AlertTriangle, Ban } from "lucide-react";
import { useTranslations } from "next-intl";
import { SettingsState } from "../settings/types";

export default function ReservationStatusBanner({
    settings,
}: {
    settings: SettingsState;
}) {
    const t = useTranslations("reservationStatusBanner");
    const { restaurantSettings } = settings || {};

    if (!restaurantSettings) return null;

    const {
        pause_new_reservations,
        emergency_closure,
        custom_message_for_customers,
    } = restaurantSettings;

    if (
        !pause_new_reservations &&
        !emergency_closure &&
        !custom_message_for_customers
    ) {
        return null;
    }

    // ================= EMERGENCY =================
    if (emergency_closure) {
        return (
            <div className="min-h-[80dvh] flex items-center justify-center px-4">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-md border border-red-200 p-12 text-center relative">

                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <div className="h-16 w-16 flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                            <Ban className="h-7 w-7" />
                        </div>
                    </div>

                    <div className="mt-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {t("emergencyClosure.title")}
                        </h1>

                        <p className="text-gray-600 text-sm leading-relaxed">
                            {custom_message_for_customers ||
                                t("emergencyClosure.description")}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ================= PAUSED =================
    if (pause_new_reservations) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-yellow-200 p-10 text-center relative">

                    <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                        <div className="h-14 w-14 flex items-center justify-center rounded-full bg-yellow-500 text-white shadow-md">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                            {t("reservationsPaused.title")}
                        </h2>

                        <p className="text-sm text-gray-600 leading-relaxed">
                            {custom_message_for_customers ||
                                t("reservationsPaused.description")}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}