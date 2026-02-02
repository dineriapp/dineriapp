"use client";
import { Switch } from '@/components/ui/switch';
import { Check, Mail, Plus, Trash2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { NotificationSettings } from '../types';
import EmailTemplates from './email-templates';

interface Props {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

const MainSettings = ({ settings, updateSettingsSection }: Props) => {
    const t = useTranslations("mainSettings")
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
                        className={`px-6 py-3 max-sm:w-full font-medium border-b-2 ${activeTab === tab
                            ? "border-slate-900 text-slate-900 bg-gray-100"
                            : "border-transparent text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        {tab === "general" && t("tabs.general")}
                        {tab === "templates" && t("tabs.templates")}
                        {tab === "management" && t("tabs.management")}
                        {tab === "reviews" && t("tabs.reviews")}
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
                                    <div className="font-medium">
                                        {t("general.bookingConfirmation.title")}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {t("general.bookingConfirmation.description")}
                                    </div>
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
                                    <div className="font-medium">
                                        {t("general.reminderButton.title")}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {t("general.reminderButton.description")}
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
                                    <div className="font-medium">
                                        {t("general.cancellation.title")}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {t("general.cancellation.description")}
                                    </div>
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
                                    <div className="font-semibold text-slate-900">
                                        {t("management.section.title")}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {t("management.section.description")}
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
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t("management.emails.label")}
                                    </label>

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
                                                    placeholder={t("management.emails.placeholder")}
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
                                            {t("management.emails.add")}
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-500 mt-1">
                                        {t("management.emails.limit")}
                                    </p>
                                </div>

                                {/* Events */}
                                <div className="border-t border-slate-200 pt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        {t("management.events.label")}
                                    </label>

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
                                                <div className="font-medium">
                                                    {t("management.events.label")}
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    {t("management.events.description")}
                                                </div>
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
                                                <div className="font-medium">
                                                    {t("management.events.cancellations_title")}
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    {t("management.events.cancellations_description")}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {/* ============== reviews ============== */}

                {activeTab === "reviews" && (
                    <>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-slate-600" />
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        {t("reviews.toggle.title")}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        {t("reviews.toggle.description")}
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
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t("reviews.subject.label")}
                                    </label>
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
                                            <strong>
                                                {t("reviews.variables.label")}
                                            </strong>
                                            {`{{customer_name}}`}, {`{{restaurant_name}}`},{" "}
                                            {`{{review_links}}`}
                                        </p>
                                    </div>

                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {t("reviews.body.label")}
                                    </label>
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
                                    <div className="font-semibold text-slate-900">
                                        {t("reviews.platforms.title")}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {t("reviews.platforms.google.label")}
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.review_email.google_review_link}
                                            onChange={(e) =>
                                                setSettings({
                                                    review_email: { ...settings.review_email, google_review_link: e.target.value },
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            placeholder={t("reviews.platforms.google.placeholder")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {t("reviews.platforms.yelp.label")}
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.review_email.yelp_review_link}
                                            onChange={(e) =>
                                                setSettings({ review_email: { ...settings.review_email, yelp_review_link: e.target.value } })
                                            }
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            placeholder={t("reviews.platforms.yelp.placeholder")}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {t("reviews.platforms.tripadvisor.label")}
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.review_email.tripadvisor_review_link}
                                            onChange={(e) =>
                                                setSettings({
                                                    review_email: { ...settings.review_email, tripadvisor_review_link: e.target.value },
                                                })
                                            }
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                            placeholder={t("reviews.platforms.tripadvisor.placeholder")}
                                        />
                                    </div>

                                    {/* Custom platforms */}
                                    <div className="space-y-2 border-t pt-4">
                                        {(settings.review_email.other_review_links || []).map((link, idx) => (
                                            <div key={idx} className="flex flex-wrap gap-2">
                                                <input
                                                    type="text"
                                                    value={link.name}
                                                    onChange={(e) => {
                                                        const next = [...settings.review_email.other_review_links];
                                                        next[idx] = { ...next[idx], name: e.target.value };
                                                        setSettings({ review_email: { ...settings.review_email, other_review_links: next } });
                                                    }}
                                                    placeholder={t("reviews.platforms.custom.namePlaceholder")}
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
                                                    placeholder={t("reviews.platforms.custom.urlPlaceholder")}
                                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = settings.review_email.other_review_links.filter((_, i) => i !== idx);
                                                        setSettings({ review_email: { ...settings.review_email, other_review_links: next } });
                                                    }}
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    aria-label={t("reviews.platforms.custom.remove")}
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
                                            {t("reviews.platforms.custom.add")}
                                        </button>
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
