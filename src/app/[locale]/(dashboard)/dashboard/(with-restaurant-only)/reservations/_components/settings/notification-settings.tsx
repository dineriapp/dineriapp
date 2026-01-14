"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Check, CheckCircle2, Mail, Plus, Send, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { NotificationSettings } from "./types";

interface NotificationSettingsProps {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

const ensureTime = (t: string) => (t?.length === 5 ? `${t}:00` : t);

export function NotificationSettingsComponent({ settings, updateSettingsSection }: NotificationSettingsProps) {
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"general" | "templates" | "management" | "reviews">("general");

    // local-only inputs for owner emails UI (keep UX smooth, save to settings on change)
    const ownerEmailInputs = useMemo(() => {
        const arr = (settings.owner_emails && settings.owner_emails.length > 0) ? settings.owner_emails : [""];
        return arr.slice(0, 5);
    }, [settings.owner_emails]);

    const setSettings = (partial: Partial<NotificationSettings>) => {
        updateSettingsSection("notification_settings", { ...settings, ...partial });
    };

    const handleTestNotification = () => {
        if (!settings.resend_api_key) {
            setMessage({ type: "error", text: "Please configure Resend API key first" });
            return;
        }
        setMessage({ type: "success", text: "Design-only: Test notification (hook backend later)" });
    };

    return (
        <Card className="gap-4">
            {/* Header */}
            <CardHeader>
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Configure automated email notifications for reservations</CardDescription>
                    </div>
                    <div className="flex gap-3 items-center">
                        {settings.notifications_enabled && (
                            <button
                                onClick={handleTestNotification}
                                disabled={!settings.resend_api_key}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" /> Test
                            </button>
                        )}

                        <Switch
                            checked={settings.notifications_enabled}
                            onCheckedChange={(val) => setSettings({ notifications_enabled: val })}
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

            {settings.notifications_enabled && (
                <>
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
                    <div className="p-6 !pb-0 space-y-6">
                        {/* ============== GENERAL ============== */}
                        {activeTab === "general" && (
                            <>
                                {/* From & Reply */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">From Name</label>
                                        <input
                                            type="text"
                                            value={settings.email_from_name}
                                            onChange={(e) => setSettings({ email_from_name: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            placeholder="Your Restaurant Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Reply-To</label>
                                        <input
                                            type="email"
                                            value={settings.email_reply_to}
                                            onChange={(e) => setSettings({ email_reply_to: e.target.value })}
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
                                        onChange={(e) => setSettings({ resend_api_key: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        placeholder="re_xxxxxxxxxxxx"
                                    />
                                </div>

                                {/* Notification toggles */}
                                <div className="border-t border-slate-200 pt-6 space-y-3">
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

                                    {/* Test mode */}
                                    <div className="border-t border-slate-200 pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer p-4 border border-amber-200 bg-amber-50 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setSettings({ test_mode: !settings.test_mode })}
                                                className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${settings.test_mode
                                                        ? "bg-slate-900 border-slate-900 text-white"
                                                        : "border-slate-300 text-transparent hover:text-slate-400"
                                                    }`}
                                            >
                                                {settings.test_mode && <Check className="w-4 h-4" />}
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

                        {/* ============== TEMPLATES ============== */}
                        {activeTab === "templates" && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Available variables:</strong> {`{{restaurant_name}}`}, {`{{guest_name}}`},{" "}
                                        {`{{party_size}}`}, {`{{date}}`}, {`{{time}}`}, {`{{restaurant_contact}}`}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmation Subject</label>
                                    <input
                                        type="text"
                                        value={settings.email_confirmation_subject}
                                        onChange={(e) => setSettings({ email_confirmation_subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirmation Body</label>
                                    <textarea
                                        rows={8}
                                        value={settings.email_confirmation_body}
                                        onChange={(e) => setSettings({ email_confirmation_body: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Subject</label>
                                    <input
                                        type="text"
                                        value={settings.email_reminder_subject}
                                        onChange={(e) => setSettings({ email_reminder_subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Body</label>
                                    <textarea
                                        rows={8}
                                        value={settings.email_reminder_body}
                                        onChange={(e) => setSettings({ email_reminder_body: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                                    />
                                </div>
                            </>
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

                        {/* ============== REVIEWS ============== */}
                        {activeTab === "reviews" && (
                            <>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-slate-600" />
                                        <div>
                                            <div className="font-semibold text-slate-900">Review Request Emails</div>
                                            <div className="text-sm text-slate-600">
                                                Ask customers for reviews after their reservation
                                            </div>
                                        </div>
                                    </div>

                                    <Switch
                                        checked={settings.review_email?.enabled ?? false}
                                        onCheckedChange={(val) =>
                                            setSettings({ review_email: { ...settings.review_email, enabled: val } })
                                        }
                                    />
                                </div>

                                {settings.review_email?.enabled && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Delay</label>
                                            <select
                                                value={settings.review_email.delay_hours}
                                                onChange={(e) =>
                                                    setSettings({
                                                        review_email: { ...settings.review_email, delay_hours: parseInt(e.target.value) },
                                                    })
                                                }
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            >
                                                <option value={1}>1 hour after dining</option>
                                                <option value={2}>2 hours after dining</option>
                                                <option value={4}>4 hours after dining</option>
                                                <option value={6}>6 hours after dining</option>
                                                <option value={12}>12 hours after dining</option>
                                                <option value={24}>Next day</option>
                                                <option value={48}>2 days later</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Subject</label>
                                            <input
                                                type="text"
                                                value={settings.review_email.email_subject}
                                                onChange={(e) =>
                                                    setSettings({ review_email: { ...settings.review_email, email_subject: e.target.value } })
                                                }
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>

                                        <div>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                                <p className="text-xs text-blue-800">
                                                    <strong>Available variables:</strong> {`{{customer_name}}`}, {`{{restaurant_name}}`},{" "}
                                                    {`{{review_links}}`}
                                                </p>
                                            </div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Body</label>
                                            <textarea
                                                rows={10}
                                                value={settings.review_email.email_body}
                                                onChange={(e) =>
                                                    setSettings({ review_email: { ...settings.review_email, email_body: e.target.value } })
                                                }
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                                            />
                                        </div>

                                        <div className="border-t border-slate-200 pt-6 space-y-3">
                                            <div className="font-semibold text-slate-900">Review Platform Links</div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Google Review Link</label>
                                                <input
                                                    type="url"
                                                    value={settings.review_email.google_review_link}
                                                    onChange={(e) =>
                                                        setSettings({
                                                            review_email: { ...settings.review_email, google_review_link: e.target.value },
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                    placeholder="https://g.page/r/..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Yelp Review Link</label>
                                                <input
                                                    type="url"
                                                    value={settings.review_email.yelp_review_link}
                                                    onChange={(e) =>
                                                        setSettings({ review_email: { ...settings.review_email, yelp_review_link: e.target.value } })
                                                    }
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                    placeholder="https://www.yelp.com/biz/..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">TripAdvisor Review Link</label>
                                                <input
                                                    type="url"
                                                    value={settings.review_email.tripadvisor_review_link}
                                                    onChange={(e) =>
                                                        setSettings({
                                                            review_email: { ...settings.review_email, tripadvisor_review_link: e.target.value },
                                                        })
                                                    }
                                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                                    placeholder="https://www.tripadvisor.com/..."
                                                />
                                            </div>

                                            {/* Custom platforms */}
                                            <div className="space-y-2">
                                                {(settings.review_email.other_review_links || []).map((link, idx) => (
                                                    <div key={link.id || idx} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={link.name}
                                                            onChange={(e) => {
                                                                const next = [...settings.review_email.other_review_links];
                                                                next[idx] = { ...next[idx], name: e.target.value };
                                                                setSettings({ review_email: { ...settings.review_email, other_review_links: next } });
                                                            }}
                                                            placeholder="Platform name"
                                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                        <input
                                                            type="url"
                                                            value={link.url}
                                                            onChange={(e) => {
                                                                const next = [...settings.review_email.other_review_links];
                                                                next[idx] = { ...next[idx], url: e.target.value };
                                                                setSettings({ review_email: { ...settings.review_email, other_review_links: next } });
                                                            }}
                                                            placeholder="https://..."
                                                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = settings.review_email.other_review_links.filter((_, i) => i !== idx);
                                                                setSettings({ review_email: { ...settings.review_email, other_review_links: next } });
                                                            }}
                                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            aria-label="Remove platform"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = [
                                                            ...(settings.review_email.other_review_links || []),
                                                            { id: crypto.randomUUID(), name: "", url: "" },
                                                        ];
                                                        setSettings({ review_email: { ...settings.review_email, other_review_links: next } });
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Another Platform
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </Card>
    );
}
