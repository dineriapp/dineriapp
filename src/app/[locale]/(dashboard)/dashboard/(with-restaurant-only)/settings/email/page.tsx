"use client";

import LoadingUI from "@/components/loading-ui";
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UnsavedChangesUi from "@/components/unsaved-changes-ui";
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Send, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function EmailConfigPage() {
    const t = useTranslations("emailIntegration");

    const emailConfigSchema = z.object({
        email_from_name: z.string().min(2, t("form.fromName.errors.min")),
        email_from_address: z.string().email(t("form.fromEmail.errors.invalid")),
        email_test_to: z.string().email(t("form.testEmail.errors.invalid")),
        resend_api_key: z.string().min(10, t("form.apiKey.errors.min")),
    });

    const codeSchema = z.object({
        code: z
            .string()
            .length(4, t("codeStep.errors.length"))
            .regex(/^\d+$/, t("codeStep.errors.numeric")),
    });

    type EmailConfigValues = z.infer<typeof emailConfigSchema>;
    type CodeValues = z.infer<typeof codeSchema>;
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore();
    const [isVerified, setIsVerified] = useState(false);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState<"FORM" | "CODE">("FORM");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const form = useForm<EmailConfigValues>({
        resolver: zodResolver(emailConfigSchema),
        defaultValues: {
            email_from_name: "",
            email_from_address: "",
            email_test_to: "",
            resend_api_key: "",
        },
    });

    const codeForm = useForm<CodeValues>({
        resolver: zodResolver(codeSchema),
        defaultValues: {
            code: "",
        },
    });


    const handleStart = async (values: EmailConfigValues) => {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await fetch("/api/resend-integration/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const result = await res.json();

            if (!res.ok || !result.ok) {
                throw new Error(result.message || t("alerts.sendCodeFailed"));
            }

            setSuccessMsg(t("alerts.verificationSent"));
            setStep("CODE");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (values: CodeValues) => {
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await fetch("/api/resend-integration/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const result = await res.json();

            if (!res.ok || !result.ok) {
                throw new Error(result.message || t("alerts.verificationFailed"));
            }

            setSuccessMsg(t("alerts.integrationSuccess"));
            setStep("FORM");
            setIsVerified(true);
            codeForm.reset();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const watchedValues = form.watch();

    useEffect(() => {
        if (selectedRestaurant) {
            form.reset({
                email_from_name: selectedRestaurant.email_from_name || "",
                email_from_address: selectedRestaurant.email_from_address || "",
                email_test_to: "",
                resend_api_key: "",
            });
        }
    }, [selectedRestaurant, form]);

    const hasChanges =
        watchedValues.email_from_name !== (selectedRestaurant?.email_from_name || "") ||
        watchedValues.email_from_address !== (selectedRestaurant?.email_from_address || "") ||
        Boolean(watchedValues.resend_api_key);

    const saveEmailSettings = async () => {
        if (!selectedRestaurant) return;

        const values = form.getValues();

        try {
            setSaving(true);

            const response = await fetch(
                `/api/restaurants/${selectedRestaurant.id}/email-integration`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t("alerts.saveFailed"));
            }

            const result = await response.json();

            updateSelectedRestaurant(result.data);

            form.reset({
                email_from_name: result.data.email_from_name || "",
                email_from_address: result.data.email_from_address || "",
                resend_api_key: "",
            });
            setEditMode(false);
            setIsVerified(false);
            toast.success(t("alerts.saveSuccess"));
        } catch (error: any) {
            toast.error(error.message || t("alerts.saveFailed"));
        } finally {
            setSaving(false);
        }
    };

    if (!selectedRestaurant) {
        return <LoadingUI text={t("loading.page")} />;
    }

    const isConfigured =
        !!selectedRestaurant?.email_from_name &&
        !!selectedRestaurant?.email_from_address &&
        !!selectedRestaurant?.email_api_key_encrypted;

    return (
        <>
            <Card className="pt-0 shadow-md border-gray-200">
                <CardHeader className="bg-gray-50/50 py-4">
                    <CardTitle>
                        {t("title")}
                    </CardTitle>
                    <CardDescription>
                        {t("description")}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                            {successMsg}
                        </div>
                    )}

                    {step === "FORM" && (!isConfigured || editMode) && (
                        <form onSubmit={form.handleSubmit(handleStart)} className="space-y-4">

                            <div className="space-y-2">
                                <Label>
                                    {t("form.fromName.label")}
                                </Label>
                                <Input {...form.register("email_from_name")}
                                    placeholder={t("form.fromName.placeholder")}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t("form.fromName.helper")}
                                </p>
                                {form.formState.errors.email_from_name && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.email_from_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    {t("form.fromEmail.label")}
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                    <Input type="email" className="pl-10" {...form.register("email_from_address")} placeholder={t("form.fromEmail.placeholder")} />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("form.fromEmail.helper")}
                                </p>
                                {form.formState.errors.email_from_address && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.email_from_address.message}
                                    </p>
                                )}

                            </div>

                            <div className="space-y-2">
                                <Label>{t("form.testEmail.label")}</Label>
                                <Input type="email" {...form.register("email_test_to")} placeholder={t("form.testEmail.placeholder")} />
                                <p className="text-xs text-muted-foreground">
                                    {t("form.testEmail.helper")}
                                </p>
                                {form.formState.errors.email_test_to && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.email_test_to.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    {t("form.apiKey.label")}</Label>
                                <Input type="password" {...form.register("resend_api_key")} placeholder={t("form.apiKey.placeholder")} />
                                <p className="text-xs text-muted-foreground">
                                    {t("form.apiKey.helper")}
                                </p>
                                {form.formState.errors.resend_api_key && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.resend_api_key.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    {t("buttons.sendCode")}
                                </button>
                            </div>

                        </form>
                    )}

                    {step === "CODE" && (
                        <form onSubmit={codeForm.handleSubmit(handleVerify)} className="space-y-4">

                            <div className="space-y-2">
                                <Label>
                                    {t("codeStep.label")}
                                </Label>
                                <Input maxLength={4} {...codeForm.register("code")} placeholder="1234" />
                                <p className="text-xs text-muted-foreground">
                                    {t("codeStep.helper")}
                                </p>
                                {codeForm.formState.errors.code && (
                                    <p className="text-sm text-red-600">
                                        {codeForm.formState.errors.code.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep("FORM")}
                                    className="text-sm text-slate-600 underline"
                                >
                                    {t("codeStep.buttons.back")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="h-4 w-4" />
                                    )}
                                    {t("codeStep.buttons.verify")}
                                </button>
                            </div>

                        </form>
                    )}
                    {step === "FORM" && isConfigured && !editMode && (
                        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">

                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-md bg-emerald-100 flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                </div>

                                <div className="text-sm">
                                    <p className="font-medium text-gray-900">
                                        {t("status.connected")}
                                    </p>
                                    <p className="text-gray-600 text-xs">
                                        {selectedRestaurant.email_from_address}
                                    </p>
                                </div>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-emerald-700 hover:underline hover:text-emerald-800 transition"
                                    >
                                        {t("buttons.edit")}
                                    </button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("status.reverificationTitle")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("status.reverificationDescription")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            {t("buttons.cancel")}
                                        </AlertDialogCancel>

                                        <AlertDialogAction
                                            onClick={() => {
                                                setEditMode(true);
                                                setIsVerified(false);

                                                form.reset({
                                                    email_from_name:
                                                        selectedRestaurant.email_from_name || "",
                                                    email_from_address:
                                                        selectedRestaurant.email_from_address || "",
                                                    email_test_to: "",
                                                    resend_api_key: "",
                                                });

                                                setStep("FORM");
                                            }}
                                        >
                                            {t("buttons.continue")}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
            <UnsavedChangesPanel
                hasChanges={isVerified && hasChanges}
                saving={saving}
                resetForm={() => form.reset()}
                saveSettings={saveEmailSettings}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />
        </>
    );
}