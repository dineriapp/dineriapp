"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RestaurantSettings } from "./types";
import { useTranslations } from "next-intl";

interface RestaurantSettingsManagerProps {
    settings: RestaurantSettings;
    updateSettingsSection: (
        section: "restaurantSettings",
        value: RestaurantSettings
    ) => void;
}

export default function RestaurantSettingsManager({
    settings,
    updateSettingsSection
}: RestaurantSettingsManagerProps) {
    const t = useTranslations("SettingsPage.restaurantSettings")

    return (
        <div className="space-y-3">
            {/* Reservation Duration */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>
                            {t("reservationDurationTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("reservationDurationDescription")}
                        </CardDescription>
                    </div>
                    <Switch
                        checked={settings.use_tiered_duration}
                        onCheckedChange={(val) =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                use_tiered_duration: val
                            })
                        }
                    />
                </CardHeader>
                <CardContent>
                    {!settings.use_tiered_duration ? (
                        <div className="space-y-2">
                            <Label>
                                {t("standardDurationLabel")}
                            </Label>
                            <Input
                                type="number"
                                value={settings.default_reservation_duration_minutes}
                                onChange={(e) =>
                                    updateSettingsSection("restaurantSettings", {
                                        ...settings,
                                        default_reservation_duration_minutes: parseInt(e.target.value) || 120
                                    })
                                }
                            />
                            <p className="text-xs text-slate-500">
                                {t("standardDurationNote")}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>
                                    {t("smallPartyDurationLabel")}
                                </Label>
                                <Input
                                    type="number"
                                    value={settings.small_party_duration}
                                    onChange={(e) =>
                                        updateSettingsSection("restaurantSettings", {
                                            ...settings,
                                            small_party_duration: parseInt(e.target.value) || 90
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    {t("mediumPartyDurationLabel")}
                                </Label>
                                <Input
                                    type="number"
                                    value={settings.medium_party_duration}
                                    onChange={(e) =>
                                        updateSettingsSection("restaurantSettings", {
                                            ...settings,
                                            medium_party_duration: parseInt(e.target.value) || 120
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    {t("largePartyDurationLabel")}
                                </Label>
                                <Input
                                    type="number"
                                    value={settings.large_party_duration}
                                    onChange={(e) =>
                                        updateSettingsSection("restaurantSettings", {
                                            ...settings,
                                            large_party_duration: parseInt(e.target.value) || 150
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table Combinations */}
            {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>
                            {t("tableCombinationsTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("tableCombinationsDescription")}
                        </CardDescription>
                    </div>
                    <Switch
                        checked={settings.enable_table_combinations}
                        onCheckedChange={(val) =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                enable_table_combinations: val
                            })
                        }
                    />
                </CardHeader>
            </Card> */}

            {/* Overbooking */}
            {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>
                            {t("overbookingTitle")}
                        </CardTitle>
                        <CardDescription>
                            {t("overbookingDescription")}
                        </CardDescription>
                    </div>
                    <Switch
                        checked={settings.enable_overbooking}
                        onCheckedChange={(val) =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                enable_overbooking: val
                            })
                        }
                    />
                </CardHeader>
                {settings.enable_overbooking && (
                    <CardContent>
                        <div className="space-y-2">
                            <Label>
                                {t("overbookingPercentageLabel")}
                            </Label>
                            <Input
                                type="number"
                                value={settings.overbooking_percentage}
                                onChange={(e) =>
                                    updateSettingsSection("restaurantSettings", {
                                        ...settings,
                                        overbooking_percentage: parseInt(e.target.value) || 0
                                    })
                                }
                            />
                            <p className="text-xs text-slate-500">
                                {t("overbookingPercentageNote")}
                            </p>
                        </div>
                    </CardContent>
                )}
            </Card> */}
        </div>
    );
}
