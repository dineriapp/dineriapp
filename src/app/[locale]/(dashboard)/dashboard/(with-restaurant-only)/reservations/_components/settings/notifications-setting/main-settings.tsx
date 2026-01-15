"use client";
import { Switch } from '@/components/ui/switch';
import { Check, Plus, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NotificationSettings } from '../types';
import EmailTemplates from './email-templates';

interface Props {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

const ensureTime = (t: string) => (t?.length === 5 ? `${t}:00` : t);


const MainSettings = ({ settings, updateSettingsSection }: Props) => {
    const [activeTab, setActiveTab] = useState<"general" | "templates" | "management" | "reviews">("general");

    const setSettings = (partial: Partial<NotificationSettings>) => {
        updateSettingsSection("notification_settings", { ...settings, ...partial });
    };

    const ownerEmailInputs = useMemo(() => {
        const arr = (settings.owner_emails && settings.owner_emails.length > 0) ? settings.owner_emails : [""];
        return arr.slice(0, 5);
    }, [settings.owner_emails]);

    return (
        <div className='w-full pb-5'>
            {/* Tabs */}
            <div className="border-y border-slate-200 flex gap-1 flex-wrap">
                {(["general", "templates", "management", "reviews"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-medium border-b-2 ${activeTab === tab
                            ? "border-slate-900 text-slate-900"
                            : "border-transparent text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        {tab === "general" && "General Settings"}
                        {tab === "templates" && "Email Templates"}
                        {tab === "management" && "Management Notifications"}
                        {tab === "reviews" && "Review Requests"}
                    </button>
                ))}
            </div>
            {/* Content */}
            <div className="py-6 px-5 !pb-0 space-y-6">
                {/* ============== GENERAL ============== */}
                {activeTab === "general" && (
                    <>
                        {/* Notification toggles */}
                        <div className=" space-y-3">
                            {/* Booking confirmation */}
                            <label className="flex items-center gap-3 p-4 border hover:bg-gray-100 border-slate-200 rounded-lg cursor-pointer">
                                <button
                                    type="button"
                                    onClick={() => setSettings({ email_confirmation_enabled: !settings.email_confirmation_enabled })}
                                    className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.email_confirmation_enabled
                                        ? "bg-slate-900 border-slate-900 text-white"
                                        : "border-slate-300 text-transparent hover:text-slate-400"
                                        }`}
                                >
                                    {settings.email_confirmation_enabled && <Check className="w-4 h-4" />}
                                </button>
                                <div className="flex-1">
                                    <div className="font-medium">Booking Confirmation</div>
                                    <div className="text-sm text-slate-600">Send immediately when reservation is created</div>
                                </div>
                            </label>

                            {/* 24h reminder */}
                            <label className="flex items-center gap-3 p-4 border hover:bg-gray-100 border-slate-200 rounded-lg cursor-pointer">
                                <button
                                    type="button"
                                    onClick={() => setSettings({ email_24h_reminder_enabled: !settings.email_24h_reminder_enabled })}
                                    className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.email_24h_reminder_enabled
                                        ? "bg-slate-900 border-slate-900 text-white"
                                        : "border-slate-300 text-transparent hover:text-slate-400"
                                        }`}
                                >
                                    {settings.email_24h_reminder_enabled && <Check className="w-4 h-4" />}
                                </button>
                                <div className="flex-1">
                                    <div className="font-medium">24-Hour Reminder</div>
                                    <div className="text-sm text-slate-600">
                                        Send the day before reservation at
                                        <input
                                            type="time"
                                            value={ensureTime(settings.reminder_time_24h)}
                                            onChange={(e) => setSettings({ reminder_time_24h: ensureTime(e.target.value) })}
                                            className="border border-slate-300 rounded px-2 py-1 ml-4 text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                            </label>

                            {/* Cancellation */}
                            <label className="flex items-center gap-3 p-4 border hover:bg-gray-100 border-slate-200 rounded-lg cursor-pointer">
                                <button
                                    type="button"
                                    onClick={() => setSettings({ email_cancellation_enabled: !settings.email_cancellation_enabled })}
                                    className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.email_cancellation_enabled
                                        ? "bg-slate-900 border-slate-900 text-white"
                                        : "border-slate-300 text-transparent hover:text-slate-400"
                                        }`}
                                >
                                    {settings.email_cancellation_enabled && <Check className="w-4 h-4" />}
                                </button>
                                <div className="flex-1">
                                    <div className="font-medium">Cancellation Confirmation</div>
                                    <div className="text-sm text-slate-600">Send when reservation is cancelled</div>
                                </div>
                            </label>
                        </div>
                    </>
                )}

                {/* ============== TEMPLATES ============== */}
                {activeTab === "templates" && (
                    <EmailTemplates settings={settings} updateSettingsSection={updateSettingsSection} />
                )}

                {/* ============== MANAGEMENT ============== */}
                {activeTab === "management" && (
                    <>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-slate-600" />
                                <div>
                                    <div className="font-semibold text-slate-900">Management Notifications</div>
                                    <div className="text-sm text-slate-600">
                                        Receive email alerts about new bookings and cancellations
                                    </div>
                                </div>
                            </div>

                            <Switch
                                checked={settings.owner_notifications_enabled}
                                onCheckedChange={(val) => setSettings({ owner_notifications_enabled: val })}
                            />
                        </div>

                        {settings.owner_notifications_enabled && (
                            <div className="space-y-4">
                                {/* Emails */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Management Email Addresses</label>

                                    <div className="space-y-2">
                                        {ownerEmailInputs.map((email, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        const next = [...ownerEmailInputs];
                                                        next[index] = e.target.value;
                                                        setSettings({ owner_emails: next.filter((x) => x !== undefined) });
                                                    }}
                                                    placeholder="manager@restaurant.com"
                                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                                                />

                                                {ownerEmailInputs.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const next = ownerEmailInputs.filter((_, i) => i !== index);
                                                            setSettings({ owner_emails: next.filter((x) => x.trim() !== "") });
                                                        }}
                                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (ownerEmailInputs.length >= 5) return;
                                                setSettings({ owner_emails: [...ownerEmailInputs, ""] });
                                            }}
                                            disabled={ownerEmailInputs.length >= 5}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Another Email
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-500 mt-1">Add up to 5 email addresses</p>
                                </div>

                                {/* Events */}
                                <div className="border-t border-slate-200 pt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Notification Events</label>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-gray-100 cursor-pointer">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSettings({ owner_notify_new_bookings: !settings.owner_notify_new_bookings })
                                                }
                                                className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.owner_notify_new_bookings
                                                    ? "bg-slate-900 border-slate-900 text-white"
                                                    : "border-slate-300 text-transparent hover:text-slate-400"
                                                    }`}
                                            >
                                                {settings.owner_notify_new_bookings && <Check className="w-4 h-4" />}
                                            </button>
                                            <div className="flex-1">
                                                <div className="font-medium">New Bookings</div>
                                                <div className="text-sm text-slate-600">Get notified when a reservation is created</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-gray-100 cursor-pointer">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSettings({ owner_notify_cancellations: !settings.owner_notify_cancellations })
                                                }
                                                className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.owner_notify_cancellations
                                                    ? "bg-slate-900 border-slate-900 text-white"
                                                    : "border-slate-300 text-transparent hover:text-slate-400"
                                                    }`}
                                            >
                                                {settings.owner_notify_cancellations && <Check className="w-4 h-4" />}
                                            </button>
                                            <div className="flex-1">
                                                <div className="font-medium">Cancellations</div>
                                                <div className="text-sm text-slate-600">Get notified when a reservation is cancelled</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default MainSettings
