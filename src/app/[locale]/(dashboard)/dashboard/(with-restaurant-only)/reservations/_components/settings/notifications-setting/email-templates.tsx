import { Card } from '@/components/ui/card';
import { NotificationSettings } from '../types';
import TestTemplatesDialog from './test-templates-dialog';
import { useTranslations } from 'next-intl';

interface Props {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

const EmailTemplates = ({ settings, updateSettingsSection }: Props) => {
    const setSettings = (partial: Partial<NotificationSettings>) => {
        updateSettingsSection("notification_settings", { ...settings, ...partial });
    };
    const t = useTranslations("emailTemplates")

    return (
        <div className='w-full space-y-3'>
            <div className="w-full flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-blue-900">
                    <span className="font-semibold">
                        {t("variables.label")}
                    </span>{" "}
                    <span className="font-mono text-blue-800">
                        {`{{restaurant_name}}`}, {`{{guest_name}}`}, {`{{party_size}}`}, {`{{date}}`}, {`{{time}}`},{" "}
                        {`{{restaurant_contact}}`}
                    </span>
                </p>

                <div className="flex justify-end">
                    <TestTemplatesDialog />
                </div>
            </div>

            <Card className='p-4'>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("confirmation.subjectLabel")}
                    </label>
                    <input
                        type="text"
                        value={settings.email_confirmation_subject}
                        onChange={(e) => setSettings({ email_confirmation_subject: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("confirmation.bodyLabel")}
                    </label>
                    <textarea
                        rows={8}
                        value={settings.email_confirmation_body}
                        onChange={(e) => setSettings({ email_confirmation_body: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                    />
                </div>
            </Card>
            <Card className='p-4'>
                <div className="">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("reminder.subjectLabel")}
                    </label>
                    <input
                        type="text"
                        value={settings.email_reminder_subject}
                        onChange={(e) => setSettings({ email_reminder_subject: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("reminder.bodyLabel")}
                    </label>
                    <textarea
                        rows={8}
                        value={settings.email_reminder_body}
                        onChange={(e) => setSettings({ email_reminder_body: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                    />
                </div>
            </Card>
            <Card className='p-4'>
                <div className="">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("cancellation.subjectLabel")}
                    </label>
                    <input
                        type="text"
                        value={settings.email_cancellation_subject}
                        onChange={(e) => setSettings({ email_cancellation_subject: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {t("cancellation.bodyLabel")}
                    </label>
                    <textarea
                        rows={8}
                        value={settings.email_cancellation_body}
                        onChange={(e) => setSettings({ email_cancellation_body: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                    />
                </div>
            </Card>

        </div>
    )
}

export default EmailTemplates
