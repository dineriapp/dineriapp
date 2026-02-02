import { AlertTriangle, Ban, Info } from "lucide-react";
import { SettingsState } from "../settings/types";
import { useTranslations } from "next-intl";

export default function ReservationStatusBanner({ settings }: { settings: SettingsState }) {
    const t = useTranslations("reservationStatusBanner")
    const { restaurantSettings } = settings || {};

    if (!restaurantSettings) return null;

    const {
        pause_new_reservations,
        emergency_closure,
        custom_message_for_customers
    } = restaurantSettings;

    if (!pause_new_reservations && !emergency_closure && !custom_message_for_customers) {
        return null;
    }

    return (
        <div className="w-full max-w-xl mx-auto mt-6 px-4">
            <div className="space-y-4">

                {emergency_closure && (
                    <div className="flex items-start gap-3 border border-red-300 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                        <Ban className="h-5 w-5 mt-0.5" />
                        <div>
                            <p className="font-semibold text-lg">
                                {t("emergencyClosure.title")}
                            </p>
                            <p className="text-sm">
                                {t("emergencyClosure.description")}
                            </p>
                        </div>
                    </div>
                )}

                {!emergency_closure && pause_new_reservations && (
                    <div className="flex items-start gap-3 border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg">
                        <AlertTriangle className="h-5 w-5 mt-0.5" />
                        <div>
                            <p className="font-semibold text-lg">
                                {t("reservationsPaused.title")}
                            </p>
                            <p className="text-sm">
                                {t("reservationsPaused.description")}
                            </p>
                        </div>
                    </div>
                )}

                {custom_message_for_customers && (
                    <div className="flex items-start gap-3 border border-blue-300 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg">
                        <Info className="h-5 w-5 mt-0.5" />
                        <div>
                            <p className="font-semibold text-lg">
                                {t("notice.title")}
                            </p>
                            <p className="text-sm whitespace-pre-line">
                                {custom_message_for_customers}
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
