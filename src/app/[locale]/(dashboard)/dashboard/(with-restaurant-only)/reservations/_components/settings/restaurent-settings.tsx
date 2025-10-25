"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RestaurantSettings } from "./types";

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

    return (
        <div className="space-y-3">
            {/* Booking Interval */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Settings</CardTitle>
                    <CardDescription>Set your booking intervals and default durations</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Booking Interval (minutes)</Label>
                        <Input
                            type="number"
                            value={settings.booking_interval_minutes}
                            onChange={(e) =>
                                updateSettingsSection("restaurantSettings", {
                                    ...settings,
                                    booking_interval_minutes: parseInt(e.target.value) || 30
                                })
                            }
                        />
                        <p className="text-xs text-slate-500">Time between booking slots</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Default Reservation Duration (minutes)</Label>
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
                        <p className="text-xs text-slate-500">Default table reservation duration</p>
                    </div>
                </CardContent>
            </Card>

            {/* Reservation Duration */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Reservation Duration</CardTitle>
                        <CardDescription>Configure how to calculate reservation duration</CardDescription>
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
                            <Label>Standard Duration (minutes)</Label>
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
                            <p className="text-xs text-slate-500">Same duration for all party sizes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Small Parties (1–2)</Label>
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
                                <Label>Medium Parties (3–4)</Label>
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
                                <Label>Large Parties (5+)</Label>
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Table Combinations</CardTitle>
                        <CardDescription>Allow joining multiple tables for larger parties</CardDescription>
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
            </Card>

            {/* Overbooking */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Overbooking</CardTitle>
                        <CardDescription>Accept more reservations than capacity</CardDescription>
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
                            <Label>Overbooking Percentage</Label>
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
                            <p className="text-xs text-slate-500">Percentage over capacity to accept</p>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Turn Time Buffer */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Turn Time Buffer</CardTitle>
                        <CardDescription>Time between reservations for cleaning/setup</CardDescription>
                    </div>
                    <Switch
                        checked={settings.enable_turn_time_buffer}
                        onCheckedChange={(val) =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                enable_turn_time_buffer: val
                            })
                        }
                    />
                </CardHeader>
                {settings.enable_turn_time_buffer && (
                    <CardContent>
                        <div className="space-y-2">
                            <Label>Buffer Time (minutes)</Label>
                            <Input
                                type="number"
                                value={settings.turn_time_buffer_minutes}
                                onChange={(e) =>
                                    updateSettingsSection("restaurantSettings", {
                                        ...settings,
                                        turn_time_buffer_minutes: parseInt(e.target.value) || 15
                                    })
                                }
                            />

                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Variable Duration */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Variable Reservation Duration</CardTitle>
                        <CardDescription>Adjust duration based on party size</CardDescription>
                    </div>
                    <Switch
                        checked={settings.enable_variable_duration}
                        onCheckedChange={(val) =>
                            updateSettingsSection("restaurantSettings", {
                                ...settings,
                                enable_variable_duration: val
                            })
                        }
                    />
                </CardHeader>
                {settings.enable_variable_duration && (
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Per Guest (minutes)</Label>
                            <Input
                                type="number"
                                value={settings.duration_per_guest_minutes}
                                onChange={(e) =>
                                    updateSettingsSection("restaurantSettings", {
                                        ...settings,
                                        duration_per_guest_minutes: parseInt(e.target.value) || 30
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Min Duration</Label>
                            <Input
                                type="number"
                                value={settings.min_reservation_duration_minutes}
                                onChange={(e) =>
                                    updateSettingsSection("restaurantSettings", {
                                        ...settings,
                                        min_reservation_duration_minutes: parseInt(e.target.value) || 60
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Duration</Label>
                            <Input
                                type="number"
                                value={settings.max_reservation_duration_minutes}
                                onChange={(e) =>
                                    updateSettingsSection("restaurantSettings", {
                                        ...settings,
                                        max_reservation_duration_minutes: parseInt(e.target.value) || 180
                                    })
                                }
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

        </div>
    );
}
