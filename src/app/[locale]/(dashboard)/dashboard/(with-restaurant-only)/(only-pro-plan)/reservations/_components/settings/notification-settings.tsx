"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { AlertCircle, Check, CheckCircle2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import MainSettings from "./notifications-setting/main-settings";
import { NotificationSettings } from "./types";

interface NotificationSettingsProps {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

export function NotificationSettingsComponent({ settings, updateSettingsSection }: NotificationSettingsProps) {
    const [showinfo, setShowInfo] = useState<boolean>(false);
    const { selectedRestaurant } = useRestaurantStore();
    const t = useTranslations("notificationSettings")
    const setSettings = (partial: Partial<NotificationSettings>) => {
        updateSettingsSection("notification_settings", { ...settings, ...partial });
    };


    const hasEmailConfigured =
        !!selectedRestaurant?.email_from_name &&
        !!selectedRestaurant?.email_from_address &&
        !!selectedRestaurant?.email_api_key_encrypted;

    const isIntegrationValid =
        hasEmailConfigured && settings.test_mode_passed;

    return (
        <Card className="gap-4 pb-0">
            {/* Header */}
            <CardHeader>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div>
                        <CardTitle>
                            {t("title")}
                        </CardTitle>
                        <CardDescription>
                            {t("description")}
                        </CardDescription>
                    </div>
                    <div className="flex items-start md:items-center md:flex-row flex-col gap-3">
                        {/* Test status badge */}
                        {settings.notifications_enabled && (
                            isIntegrationValid ? (
                                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {t("status.testingPassed")}
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm text-amber-800">
                                    <AlertCircle className="h-4 w-4" />
                                    {t("status.testingNotPassed")}
                                </div>
                            )
                        )}
                        {settings.notifications_enabled && isIntegrationValid && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="default" size="sm" className="h-8">
                                        {t("actions.changeIntegration")}
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("dialogs.changeIntegrationTitle")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("dialogs.changeIntegrationDescription")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            {t("actions.cancel")}
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                // reset test mode so user can re-verify
                                                setSettings({ test_mode_passed: false });
                                            }}
                                        >
                                            {t("actions.confirmChange")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}


                        {/* Enable switch */}
                        <Switch
                            checked={settings.notifications_enabled}
                            onCheckedChange={(val) => {
                                setSettings({ notifications_enabled: val })
                            }}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="py-0 px-0">
                {
                    showinfo && (
                        <div className="rounded-lg relative border border-green-200 bg-green-50 p-4 border-l-4 border-l-green-500 mx-5 mb-2">
                            <X
                                className="absolute cursor-pointer top-2 right-2 size-4"
                                onClick={() => setShowInfo(false)}
                            />
                            <div className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-700 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-900">
                                        {t("infoBanner.title")}
                                    </p>
                                    <p className="mt-1 text-sm text-green-800">
                                        {t("infoBanner.description")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }

                {settings.notifications_enabled && (
                    <>
                        {
                            isIntegrationValid
                                ?
                                <>
                                </>
                                :
                                <>
                                    :
                                    <>
                                        {!hasEmailConfigured ? (
                                            <div className="mx-5 mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-amber-900">
                                                            {t("integration.notConfiguredTitle")}
                                                        </p>
                                                        <p className="text-xs text-amber-800 mt-1">
                                                            {t("integration.notConfiguredDescription")}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            window.location.href = "/dashboard/settings/email";
                                                        }}
                                                    >
                                                        {t("integration.configureButton")}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mx-5 mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-emerald-900">
                                                        {t("integration.usingExistingTitle")}
                                                    </p>
                                                    <p className="text-xs text-emerald-800 mt-1">
                                                        {selectedRestaurant?.email_from_address}
                                                    </p>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSettings({ test_mode_passed: true });
                                                    }}
                                                >
                                                    {t("integration.useForReservationsButton")}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                </>
                        }
                    </>
                )
                }
                {/* Other Settings  */}
                {
                    settings.notifications_enabled && isIntegrationValid && (
                        <>
                            <MainSettings
                                settings={settings}
                                updateSettingsSection={updateSettingsSection}
                            />
                        </>
                    )
                }
            </CardContent>
        </Card >
    );
}
