"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Check, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { NotificationSettings } from "./types";

interface NotificationSettingsProps {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

export function NotificationSettingsComponent({
    settings,
    updateSettingsSection
}: NotificationSettingsProps) {

    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"general" | "templates">("general");


    const handleTestNotification = () => {
        if (!settings.resend_api_key) {
            setMessage({ type: "error", text: "Please configure Resend API key first" });
            return;
        }
        setMessage({ type: "success", text: "Test notification feature coming soon" });
    };

    return (
        <Card className="gap-4">
            {/* Header */}
            <CardHeader className="">
                <div className="flex flex-row  items-center justify-between">
                    <div className="">
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Configure automated email notifications for reservations</CardDescription>
                    </div>
                    <div className="flex gap-3 items-center">
                        {
                            settings.notifications_enabled
                            &&
                            <>
                                <button
                                    onClick={handleTestNotification}
                                    disabled={!settings.resend_api_key}
                                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" /> Test
                                </button>
                            </>
                        }
                        <Switch
                            checked={settings.notifications_enabled}
                            onCheckedChange={(val) =>
                                updateSettingsSection("notification_settings", {
                                    ...settings,
                                    notifications_enabled: val
                                })
                            }
                        />
                    </div>
                </div>
                {/* Message */}
                {message && settings.notifications_enabled && (
                    <div
                        className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${message.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                            }`}
                    >
                        {message.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
                        {message.text}
                    </div>
                )}
            </CardHeader>
            {
                settings.notifications_enabled
                &&
                <>
                    {/* Tabs */}
                    <div className="border-y border-slate-200 flex gap-1">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`px-6 py-3 font-medium border-b-2 ${activeTab === "general"
                                ? "border-slate-900 text-slate-900"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            General Settings
                        </button>
                        <button
                            onClick={() => setActiveTab("templates")}
                            className={`px-6 py-3 font-medium border-b-2 ${activeTab === "templates"
                                ? "border-slate-900 text-slate-900"
                                : "border-transparent text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            Email Templates
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 !pb-0 space-y-6">
                        {activeTab === "general" && (
                            <>
                                {/* From & Reply */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">From Name</label>
                                        <input
                                            type="text"
                                            value={settings.email_from_name}
                                            onChange={(e) =>
                                                updateSettingsSection("notification_settings", {
                                                    ...settings,
                                                    email_from_name: e.target.value
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            placeholder="Your Restaurant Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Reply-To</label>
                                        <input
                                            type="email"
                                            value={settings.email_reply_to}
                                            onChange={(e) =>
                                                updateSettingsSection("notification_settings", {
                                                    ...settings,
                                                    email_reply_to: e.target.value
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            placeholder="reservations@yourrestaurant.com"
                                        />
                                    </div>
                                </div>

                                {/* API Key */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Resend API Key</label>
                                    <input
                                        type="password"
                                        value={settings.resend_api_key}
                                        onChange={(e) =>
                                            updateSettingsSection("notification_settings", {
                                                ...settings,
                                                resend_api_key: e.target.value
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        placeholder="re_xxxxxxxxxxxx"
                                    />
                                </div>

                                {/* Notification toggles */}
                                <div className="border-t border-slate-200 pt-6 space-y-3">
                                    <label className="flex items-center gap-3 p-4 border hover:bg-gray-100 border-slate-200 rounded-lg cursor-pointer">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSettingsSection("notification_settings", {
                                                    ...settings,
                                                    email_confirmation_enabled: !settings.email_confirmation_enabled
                                                })
                                            }
                                            className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.email_confirmation_enabled
                                                ? "bg-slate-900 border-slate-900 text-white"
                                                : "border-slate-300 text-transparent hover:text-slate-400"
                                                }`}
                                        >
                                            {
                                                settings.email_confirmation_enabled &&
                                                <Check className="w-4 h-4" />
                                            }
                                        </button>
                                        <div className="flex-1">
                                            <div className="font-medium">Booking Confirmation</div>
                                            <div className="text-sm text-slate-600">
                                                Send immediately when reservation is created
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border hover:bg-gray-100 border-slate-200 rounded-lg cursor-pointer">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSettingsSection("notification_settings", {
                                                    ...settings,
                                                    email_24h_reminder_enabled: !settings.email_24h_reminder_enabled
                                                })
                                            }
                                            className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.email_24h_reminder_enabled
                                                ? "bg-slate-900 border-slate-900 text-white"
                                                : "border-slate-300 text-transparent hover:text-slate-400"
                                                }`}
                                        >
                                            {
                                                settings.email_24h_reminder_enabled &&
                                                <Check className="w-4 h-4" />
                                            }
                                        </button>
                                        <div className="flex-1">
                                            <div className="font-medium">24-Hour Reminder</div>
                                            <div className="text-sm text-slate-600">
                                                Send the day before reservation at
                                                <input
                                                    type="time"
                                                    value={settings.reminder_time_24h}
                                                    onChange={(e) =>
                                                        updateSettingsSection("notification_settings", {
                                                            ...settings,
                                                            reminder_time_24h: e.target.value
                                                        })
                                                    }
                                                    className="border border-slate-300 rounded px-2 py-1 ml-4 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border hover:bg-gray-100 border-slate-200 rounded-lg cursor-pointer">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSettingsSection("notification_settings", {
                                                    ...settings,
                                                    email_cancellation_enabled: !settings.email_cancellation_enabled,
                                                })
                                            }
                                            className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.email_cancellation_enabled
                                                ? "bg-slate-900 border-slate-900 text-white"
                                                : "border-slate-300 text-transparent hover:text-slate-400"
                                                }`}
                                        >
                                            {
                                                settings.email_cancellation_enabled &&
                                                <Check className="w-4 h-4" />
                                            }
                                        </button>
                                        <div className="flex-1">
                                            <div className="font-medium">Cancellation Confirmation</div>
                                            <div className="text-sm text-slate-600">
                                                Send when reservation is cancelled
                                            </div>
                                        </div>
                                    </label>
                                    <div className="border-t border-slate-200 pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer p-4 border border-amber-200 bg-amber-50 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateSettingsSection("notification_settings", {
                                                        ...settings,
                                                        test_mode: !settings.test_mode,
                                                    })
                                                }
                                                className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.test_mode
                                                    ? "bg-slate-900 border-slate-900 text-white"
                                                    : "border-slate-300 text-transparent hover:text-slate-400"
                                                    }`}
                                            >
                                                {
                                                    settings.test_mode &&
                                                    <Check className="w-4 h-4" />
                                                }
                                            </button>
                                            <div className="flex-1">
                                                <div className="font-medium text-amber-900">Test Mode</div>
                                                <div className="text-sm text-amber-700">
                                                    All notifications will be sent to your restaurant email instead of guests
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "templates" && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Available variables:</strong> {`{{restaurant_name}}`}, {`{{guest_name}}`},{" "}
                                        {`{{party_size}}`}, {`{{date}}`}, {`{{time}}`}, {`{{restaurant_contact}}`}
                                    </p>
                                </div>

                                {/* Confirmation Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmation Subject</label>
                                    <input
                                        type="text"
                                        value={settings.email_confirmation_subject}
                                        onChange={(e) =>
                                            updateSettingsSection("notification_settings", {
                                                ...settings,
                                                email_confirmation_subject: e.target.value
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmation Body</label>
                                    <textarea
                                        rows={8}
                                        value={settings.email_confirmation_body}
                                        onChange={(e) =>
                                            updateSettingsSection("notification_settings", {
                                                ...settings,
                                                email_confirmation_body: e.target.value
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                                    />
                                </div>

                                {/* Reminder Email */}
                                <div className="pt-6 border-t border-slate-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Subject</label>
                                    <input
                                        type="text"
                                        value={settings.email_reminder_subject}

                                        onChange={(e) =>
                                            updateSettingsSection("notification_settings", {
                                                ...settings,
                                                email_reminder_subject: e.target.value
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Body</label>
                                    <textarea
                                        rows={8}
                                        value={settings.email_reminder_body}
                                        onChange={(e) =>
                                            updateSettingsSection("notification_settings", {
                                                ...settings,
                                                email_reminder_body: e.target.value
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </>
            }
        </Card>
    );
}
