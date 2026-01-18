"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Check, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import Integration from "./notifications-setting/integration";
import MainSettings from "./notifications-setting/main-settings";
import { NotificationSettings } from "./types";

interface NotificationSettingsProps {
    settings: NotificationSettings;
    updateSettingsSection: (section: "notification_settings", value: NotificationSettings) => void;
}

export function NotificationSettingsComponent({ settings, updateSettingsSection }: NotificationSettingsProps) {
    const [showinfo, setShowInfo] = useState<boolean>(false);

    const setSettings = (partial: Partial<NotificationSettings>) => {
        updateSettingsSection("notification_settings", { ...settings, ...partial });
    };

    return (
        <Card className="gap-4 pb-0">
            {/* Header */}
            <CardHeader>
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Configure automated email notifications for reservations</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Test status badge */}
                        {settings.notifications_enabled && (
                            settings.test_mode_passed ? (
                                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Testing phase passed
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm text-amber-800">
                                    <AlertCircle className="h-4 w-4" />
                                    Testing phase not passed
                                </div>
                            )
                        )}
                        {settings.notifications_enabled && settings.test_mode_passed && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="default" size="sm" className="h-8">
                                        Change integration values
                                    </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Change integration values?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            If you change these values, the testing phase will be reset to <b>Not Passed</b>.
                                            You will need to verify again by sending a new code to your test email.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                // reset test mode so user can re-verify
                                                setSettings({ test_mode_passed: false });
                                            }}
                                        >
                                            Yes, change
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}


                        {/* Enable switch */}
                        <Switch
                            checked={settings.notifications_enabled}
                            onCheckedChange={(val) => {
                                setSettings({ notifications_enabled: val })
                            }}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="py-0 px-0">
                {
                    showinfo && (
                        <div className="rounded-lg relative border border-green-200 bg-green-50 p-4 border-l-4 border-l-green-500 mx-5 mb-2">
                            <X
                                className="absolute cursor-pointer top-2 right-2 size-4"
                                onClick={() => setShowInfo(false)}
                            />
                            <div className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-700 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-green-900">Integrations done</p>
                                    <p className="mt-1 text-sm text-green-800">
                                        Your email integration is verified and working. Please save your changes before updating any other settings, so your
                                        integration stays active.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }

                {settings.notifications_enabled && (
                    <>
                        {
                            settings.test_mode_passed
                                ?
                                <>
                                </>
                                :
                                <Integration
                                    onIntegrationSuccess={(values) => {
                                        setSettings(values)
                                        setShowInfo(true);
                                    }}
                                    settings={settings}
                                />
                        }
                    </>
                )
                }
                {/* Other Settings  */}
                {
                    settings.notifications_enabled && settings.test_mode_passed && (
                        <>
                            <MainSettings
                                settings={settings}
                                updateSettingsSection={updateSettingsSection}
                            />
                        </>
                    )
                }
            </CardContent>
        </Card >
    );
}
