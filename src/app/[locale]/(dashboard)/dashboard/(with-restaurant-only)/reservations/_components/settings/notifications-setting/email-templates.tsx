import { Card } from '@/components/ui/card';
import { NotificationSettings } from '../types';
import TestTemplatesDialog from './test-templates-dialog';

interface Props {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

const EmailTemplates = ({ settings, updateSettingsSection }: Props) => {
    const setSettings = (partial: Partial<NotificationSettings>) => {
        updateSettingsSection("notification_settings", { ...settings, ...partial });
    };

    return (
        <div className='w-full space-y-3'>
            <div className='w-full flex items-center justify-end'>
                <TestTemplatesDialog />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Available variables:</strong> {`{{restaurant_name}}`}, {`{{guest_name}}`},{" "}
                    {`{{party_size}}`}, {`{{date}}`}, {`{{time}}`}, {`{{restaurant_contact}}`}
                </p>
            </div>
            <Card className='p-4'>
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
            </Card>
            <Card className='p-4'>
                <div className="">
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
            </Card>
            <Card className='p-4'>
                <div className="">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cancellation Subject</label>
                    <input
                        type="text"
                        value={settings.email_cancellation_subject}
                        onChange={(e) => setSettings({ email_cancellation_subject: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cancellation Body</label>
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
