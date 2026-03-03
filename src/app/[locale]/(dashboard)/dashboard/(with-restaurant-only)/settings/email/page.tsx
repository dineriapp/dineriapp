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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const emailConfigSchema = z.object({
    email_from_name: z.string().min(2, "Name must be at least 2 characters"),
    email_from_address: z.string().email("Invalid email address"),
    email_test_to: z.string().email("Invalid test email"),
    resend_api_key: z.string().min(10, "API key is required"),
});

const codeSchema = z.object({
    code: z
        .string()
        .length(4, "Code must be 4 digits")
        .regex(/^\d+$/, "Code must be numeric"),
});

type EmailConfigValues = z.infer<typeof emailConfigSchema>;
type CodeValues = z.infer<typeof codeSchema>;

export default function EmailConfigPage() {
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
                throw new Error(result.message || "Failed to send verification code");
            }

            setSuccessMsg("Verification code sent to your email.");
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
                throw new Error(result.message || "Verification failed");
            }

            setSuccessMsg("Email integration configured successfully.");
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
                throw new Error(errorData.error || "Failed to save email settings");
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
            toast.success("Email settings saved successfully.");
        } catch (error: any) {
            toast.error(error.message || "Failed to save email settings.");
        } finally {
            setSaving(false);
        }
    };

    if (!selectedRestaurant) {
        return <LoadingUI text="Loading" />;
    }

    const isConfigured =
        !!selectedRestaurant?.email_from_name &&
        !!selectedRestaurant?.email_from_address &&
        !!selectedRestaurant?.email_api_key_encrypted;

    return (
        <>
            <Card className="pt-0 shadow-md border-gray-200">
                <CardHeader className="bg-gray-50/50 py-4">
                    <CardTitle>Email Integration</CardTitle>
                    <CardDescription>
                        Configure your Resend email settings to send notifications.
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
                                <Label>From Name</Label>
                                <Input {...form.register("email_from_name")} placeholder="Your Restaurant Name" />
                                {form.formState.errors.email_from_name && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.email_from_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>From Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                    <Input type="email" className="pl-10" {...form.register("email_from_address")} placeholder="noreply@yourdomain.com" />
                                </div>
                                {form.formState.errors.email_from_address && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.email_from_address.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Test Email (Where to send verification code)</Label>
                                <Input type="email" {...form.register("email_test_to")} placeholder="you@example.com" />
                                {form.formState.errors.email_test_to && (
                                    <p className="text-sm text-red-600">
                                        {form.formState.errors.email_test_to.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Resend API Key</Label>
                                <Input type="password" {...form.register("resend_api_key")} placeholder="re_************************" />
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
                                    Send Verification Code
                                </button>
                            </div>

                        </form>
                    )}

                    {step === "CODE" && (
                        <form onSubmit={codeForm.handleSubmit(handleVerify)} className="space-y-4">

                            <div className="space-y-2">
                                <Label>Enter 4-Digit Code</Label>
                                <Input maxLength={4} {...codeForm.register("code")} placeholder="1234" />
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
                                    Go Back
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
                                    Verify & Activate
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
                                        Email integration connected
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
                                        Edit
                                    </button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Re-verification required
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Changing sender details requires verifying your email again.
                                            You will need to provide the API key and confirm with a verification code.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
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
                                            Continue
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