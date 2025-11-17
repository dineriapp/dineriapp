"use client";

import LoadingUI from "@/components/loading-ui";
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal";
import UnsavedChangesUi from "@/components/unsaved-changes-ui";
import { useReservationSettings, useSaveReservationSettings } from "@/lib/reservation-settings-queries";
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DepositSystem from "./settings/deposit-system";
import { NotificationSettingsComponent } from "./settings/notification-settings";
import RestaurantSettingsManager from "./settings/restaurent-settings";
import TimeSlotOverrides from "./settings/time-slot-overrides";
import { SettingsState } from "./settings/types";
import ReservationControlSettings from "./settings/reservation-control";

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
        notifications_enabled: false,
        email_confirmation_enabled: true,
        email_24h_reminder_enabled: true,
        email_cancellation_enabled: true,
        sms_2h_reminder_enabled: false,
        reminder_time_24h: "10:00:00",
        email_from_name: "",
        email_reply_to: "",
        email_confirmation_subject: "Your reservation at {{restaurant_name}}",
        email_confirmation_body: `Hi {{guest_name}},\n\nThis confirms your reservation for {{party_size}} on {{date}} at {{time}}.\n\nWe look forward to seeing you!\n\nNeed to cancel? Visit your confirmation link.\n\n{{restaurant_name}}\n{{restaurant_contact}}`,
        email_reminder_subject: "Reminder: Your reservation tomorrow at {{restaurant_name}}",
        email_reminder_body: `Hi {{guest_name}},\n\nThis is a friendly reminder about your reservation tomorrow:\n\nParty size: {{party_size}}\nDate: {{date}}\nTime: {{time}}\n\nWe look forward to seeing you!\n\n{{restaurant_name}}\n{{restaurant_contact}}`,
        sms_reminder_template:
            "Reminder: Your reservation at {{restaurant_name}} today at {{time}} for {{party_size}}. Reply CANCEL to cancel.",
        resend_api_key: "",
        test_mode: true,
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
            toast.success("Settings saved successfully!", {
                description: "Your reservation settings have been updated.",
                duration: 3000,
            });

            updateSelectedRestaurant({ ...restaurant, reservation_settings: { settings } });

            setHasChanges(false);
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save settings", {
                description: "Please try again.",
                duration: 4000,
            });
        }
    };

    // 🔸 Sync state with fetched settings
    useEffect(() => {
        if (initialSettings) {
            // if it's empty object {}, fallback to your default_data
            if (Object.keys(initialSettings).length === 0) {
                setSettings(default_data);
            } else {
                setSettings(initialSettings);
            }
        }
    }, [initialSettings]);


    if (isLoadingInitialData || !settings || !restaurant) {
        return <LoadingUI text="Loading settings...." />;
    }

    return (
        <div className="space-y-4 min-h-screen">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Reservation Settings</h2>
                <p className="text-slate-600 mt-1">
                    Control and configure key features of your restaurant system
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
