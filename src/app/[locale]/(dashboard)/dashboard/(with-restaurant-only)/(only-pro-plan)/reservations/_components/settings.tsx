"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        reservationsEnabled: true,
        tableManagementEnabled: true,
        areaManagementEnabled: true,
        emailReminders: false,
        notifications: true,
    })

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handleSave = () => {
        // In real app, send to API
        console.log("✅ Saved settings:", settings)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
                <p className="text-slate-600 mt-1">
                    Control and configure key features of your restaurant system
                </p>
            </div>

            {/* ⚡ Features */}
            <Card className="bg-white border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Features</CardTitle>
                    <CardDescription>
                        Enable or disable features according to your needs
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Reservations</p>
                            <p className="text-sm text-slate-500">
                                Allow customers to make table reservations
                            </p>
                        </div>
                        <Switch
                            checked={settings.reservationsEnabled}
                            onCheckedChange={() => handleToggle("reservationsEnabled")}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Table Management</p>
                            <p className="text-sm text-slate-500">
                                Manage tables and their status (Active/Inactive)
                            </p>
                        </div>
                        <Switch
                            checked={settings.tableManagementEnabled}
                            onCheckedChange={() => handleToggle("tableManagementEnabled")}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Area Management</p>
                            <p className="text-sm text-slate-500">
                                Organize tables into areas (Patio, Rooftop, etc.)
                            </p>
                        </div>
                        <Switch
                            checked={settings.areaManagementEnabled}
                            onCheckedChange={() => handleToggle("areaManagementEnabled")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ✉️ Notifications */}
            <Card className="bg-white border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                    <CardDescription>
                        Stay connected with your customers and staff
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Email Reminders</p>
                            <p className="text-sm text-slate-500">
                                Send reminder emails before reservations
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailReminders}
                            onCheckedChange={() => handleToggle("emailReminders")}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-800">Notifications</p>
                            <p className="text-sm text-slate-500">
                                Enable app and email notifications
                            </p>
                        </div>
                        <Switch
                            checked={settings.notifications}
                            onCheckedChange={() => handleToggle("notifications")}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    className="bg-green-600 text-white hover:bg-green-700"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
