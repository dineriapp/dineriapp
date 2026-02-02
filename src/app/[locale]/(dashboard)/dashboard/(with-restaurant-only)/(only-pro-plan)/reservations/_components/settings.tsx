"use client";

import LoadingUI from "@/components/loading-ui";
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal";
import UnsavedChangesUi from "@/components/unsaved-changes-ui";
import { useReservationSettings, useSaveReservationSettings } from "@/lib/reservation-settings-queries";
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DepositSystem from "./settings/deposit-system";
import { NotificationSettingsComponent } from "./settings/notification-settings";
import ReservationControlSettings from "./settings/reservation-control";
import RestaurantSettingsManager from "./settings/restaurent-settings";
import TimeSlotOverrides from "./settings/time-slot-overrides";
import { SettingsState } from "./settings/types";

const deepMerge = <T extends Record<string, any>>(base: T, incoming: Partial<T>): T => {
    const out: any = { ...base };
    for (const key of Object.keys(incoming || {})) {
        const v = (incoming as any)[key];
        if (v && typeof v === "object" && !Array.isArray(v)) {
            out[key] = deepMerge(base[key] ?? {}, v);
        } else if (v !== undefined) {
            out[key] = v;
        }
    }
    return out;
};


const default_data: SettingsState = {
    overrides_settings: {
        overrides_enabled: false,
        overrides: [],
    },
    restaurantSettings: {
        use_tiered_duration: false,
        default_reservation_duration_minutes: 120,
        small_party_duration: 90,
        medium_party_duration: 120,
        large_party_duration: 150,
        enable_table_combinations: false,
        enable_overbooking: false,
        overbooking_percentage: 0,
        pause_new_reservations: false,
        emergency_closure: false,
        custom_message_for_customers: "",
    },
    notification_settings: {
        // configration 
        notifications_enabled: false,
        email_from_name: "",
        email_reply_to: "",
        sendgrid_api_key: "",
        email_test_to: "",
        test_mode_passed: false,

        // templates
        email_confirmation_subject: "Your reservation at {{restaurant_name}}",
        email_confirmation_body: `Hi {{guest_name}},\n\nThis confirms your reservation for {{party_size}} on {{date}} at {{time}}.\n\nWe look forward to seeing you!\n\nNeed to cancel? Visit your confirmation link.\n\n{{restaurant_name}}\n{{restaurant_contact}}`,
        email_reminder_subject: "Reminder: Your reservation tomorrow at {{restaurant_name}}",
        email_reminder_body: `Hi {{guest_name}},\n\nThis is a friendly reminder about your reservation tomorrow:\n\nParty size: {{party_size}}\nDate: {{date}}\nTime: {{time}}\n\nWe look forward to seeing you!\n\n{{restaurant_name}}\n{{restaurant_contact}}`,
        email_cancellation_subject: "Your reservation at {{restaurant_name}} has been cancelled",
        email_cancellation_body: `Hi {{guest_name}},\n\nWe’re sorry to inform you that your reservation at {{restaurant_name}} has been cancelled.\n\nIf you have any questions or need assistance, please contact us.\n\n{{restaurant_name}}\n{{restaurant_contact}}`,
        // when to send 
        email_confirmation_enabled: false,
        email_24h_reminder_enabled: false,
        email_cancellation_enabled: false,

        // management
        owner_notifications_enabled: false,
        owner_emails: [],
        owner_notify_new_bookings: false,
        owner_notify_cancellations: false,
        review_email: {
            enabled: false,
            email_subject: "Thank you for dining with us! Share your experience",
            email_body:
                "Dear {{customer_name}},\n\nThank you for choosing {{restaurant_name}} for your dining experience. We hope you enjoyed your visit!\n\nWe would greatly appreciate if you could take a moment to share your experience with others by leaving a review.\n\n{{review_links}}\n\nBest regards,\n{{restaurant_name}} Team",
            google_review_link: "",
            yelp_review_link: "",
            tripadvisor_review_link: "",
            other_review_links: [],
        },
    },
    deposit_settings: {
        depositSystemEnabled: false,
        depositType: "per-person",
        depositAmount: "10",
        depositCurrency: "EUR (€)",
        dynamicRules: [],
        cancellationPolicies: [],
    },
}

export default function SettingsPage() {
    const { selectedRestaurant: restaurant, updateSelectedRestaurant } = useRestaurantStore()
    const restaurantId = restaurant?.id
    const t = useTranslations("SettingsPage.main")

    const { data: initialSettings, isLoading: isLoadingInitialData } = useReservationSettings(restaurantId!);
    const saveMutation = useSaveReservationSettings(restaurantId!);

    const [settings, setSettings] = useState<SettingsState>(default_data);

    const [hasChanges, setHasChanges] = useState(false);

    // 🔸 Generic updater helper
    const updateSettingsSection = <K extends keyof SettingsState>(
        section: K,
        value: SettingsState[K]
    ) => {
        if (!settings) return;
        const updated = { ...settings, [section]: value };
        setSettings(updated);
        setHasChanges(JSON.stringify(updated) !== JSON.stringify(initialSettings));
    };

    const resetForm = () => {
        if (initialSettings) {
            setSettings(initialSettings);
            setHasChanges(false);
        }
    };

    const saveSettings = async () => {
        try {
            if (!restaurantId || !settings) return;
            await saveMutation.mutateAsync(settings);
            toast.success(t("toast.saveSuccessTitle"), {
                description: t("toast.saveSuccessDescription"),
                duration: 3000,
            });

            updateSelectedRestaurant({ ...restaurant, reservation_settings: { settings } });

            setHasChanges(false);
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error(t("toast.saveErrorTitle"), {
                description: t("toast.saveErrorDescription"),
                duration: 4000,
            });
        }
    };

    // 🔸 Sync state with fetched settings
    useEffect(() => {
        if (!initialSettings) return;

        if (Object.keys(initialSettings).length === 0) {
            setSettings(default_data);
            return;
        }

        // ✅ Merge defaults with incoming JSON
        const merged = deepMerge(default_data, initialSettings as any);
        setSettings(merged);
    }, [initialSettings]);


    if (isLoadingInitialData || !settings || !restaurant) {
        return <LoadingUI text={t("loadingText")} />;
    }

    return (
        <div className="space-y-4 min-h-screen">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {t("title")}
                </h2>
                <p className="text-slate-600 mt-1">
                    {t("subtitle")}
                </p>
            </div>
            <div className="space-y-3">
                {/* NEW SECTION */}
                <ReservationControlSettings
                    settings={settings.restaurantSettings}
                    updateSettingsSection={updateSettingsSection}
                />
                <DepositSystem
                    value={settings.deposit_settings}
                    onChange={(val) => updateSettingsSection("deposit_settings", val)}
                />
                <NotificationSettingsComponent
                    settings={settings.notification_settings}
                    updateSettingsSection={updateSettingsSection}
                />
                <TimeSlotOverrides
                    settings={settings.overrides_settings}
                    updateSettingsSection={updateSettingsSection}
                />
                <RestaurantSettingsManager
                    settings={settings.restaurantSettings}
                    updateSettingsSection={updateSettingsSection}
                />
            </div>
            {/* changes detection penal  */}
            <UnsavedChangesPanel
                hasChanges={hasChanges}
                saving={saveMutation.isPending}
                resetForm={resetForm}
                saveSettings={saveSettings}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />
        </div>
    );
}
