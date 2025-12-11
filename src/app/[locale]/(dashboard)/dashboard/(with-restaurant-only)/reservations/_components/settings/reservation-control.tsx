"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RestaurantSettings } from "./types";
import { Pause, Power, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    settings: RestaurantSettings;
    updateSettingsSection: (
        section: "restaurantSettings",
        value: RestaurantSettings
    ) => void;
}

export default function ReservationControls({ settings, updateSettingsSection }: Props) {
    const t = useTranslations("SettingsPage.ReservationControls")

    return (
        <Card className="border border-slate-200 gap-0 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <Power className="h-5 w-5 text-slate-700" />
                    <div className="">
                        <CardTitle>
                            {t("title")}
                        </CardTitle>
                        <CardDescription>
                            {t("description")}
                        </CardDescription>
                    </div>
                </div>

            </CardHeader>

            <CardContent className="space-y-3">

                {/* Pause Reservations */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <Pause className="h-5 w-5 text-slate-600 mt-1" />
                        <div>
                            <h3 className="font-semibold text-slate-800">
                                {t("pauseReservations.title")}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {t("pauseReservations.subtitle")}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        className={`px-6 ${settings.pause_new_reservations ? "bg-blue-600 text-white hover:bg-blue-700" : ""}`}
                        onClick={() =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                pause_new_reservations: !settings.pause_new_reservations
                            })
                        }
                    >
                        {settings.pause_new_reservations ?
                            t("pauseReservations.buttonResume")
                            :
                            t("pauseReservations.buttonPause")
                        }
                    </Button>
                </div>

                {/* Emergency Closure */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center justify-between">
                    <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-1" />
                        <div>
                            <h3 className="font-semibold text-slate-800">
                                {t("emergencyClosure.title")}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {t("emergencyClosure.subtitle")}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant={settings.emergency_closure ? "secondary" : "destructive"}
                        className="px-6"
                        onClick={() =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                emergency_closure: !settings.emergency_closure
                            })
                        }
                    >
                        {settings.emergency_closure ?
                            t("emergencyClosure.buttonDeactivate")
                            :
                            t("emergencyClosure.buttonActivate")
                        }
                    </Button>
                </div>

                <hr className="my-4 border-slate-200" />

                {/* Custom message */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        {t("customMessage.label")}
                    </label>
                    <Textarea
                        className="min-h-[120px] text-sm"
                        placeholder={t("customMessage.placeholder")}
                        value={settings.custom_message_for_customers}
                        onChange={(e) =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                custom_message_for_customers: e.target.value
                            })
                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
}
