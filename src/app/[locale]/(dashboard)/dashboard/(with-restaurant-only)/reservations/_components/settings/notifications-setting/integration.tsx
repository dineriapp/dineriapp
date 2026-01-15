"use client";

import kyInstance from "@/lib/ky";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Info, Loader2, Send, ShieldCheck, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NotificationSettings } from "../types";

const integrationSchema = z.object({
    email_from_name: z
        .string()
        .trim()
        .min(2, "From Name must be at least 2 characters")
        .max(60, "From Name must be 60 characters or less"),

    email_reply_to: z
        .string()
        .trim()
        .min(1, "Reply-To email is required")
        .email("Reply-To must be a valid email"),

    email_test_to: z
        .string()
        .trim()
        .min(1, "Test email is required")
        .email("Test email must be a valid email"),

    sendgrid_api_key: z
        .string()
        .trim()
        .min(1, "Resend API key is required")
});

const codeSchema = z.object({
    code: z.string().trim().regex(/^\d{4}$/, "Enter the 4-digit code"),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;
type ApiResponse = { ok: boolean; message?: string; };

type Props = {
    settings: NotificationSettings;
    onIntegrationSuccess: (values: Partial<NotificationSettings>) => void;
};


export default function Integration({ onIntegrationSuccess, settings }: Props) {
    const [step, setStep] = useState<"FORM" | "CODE">("FORM");
    const [showinfo, setShowInfo] = useState<boolean>(true);
    const [serverMsg, setServerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const form = useForm<IntegrationFormValues>({
        resolver: zodResolver(integrationSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            email_from_name: settings.email_from_name || "",
            email_reply_to: settings.email_reply_to || "",
            email_test_to: settings.email_test_to || "",
            sendgrid_api_key: settings.sendgrid_api_key || "",
        },
    });

    const codeForm = useForm<CodeFormValues>({
        resolver: zodResolver(codeSchema),
        mode: "onBlur",
        defaultValues: { code: "" },
    });

    const inputClass = (hasError?: boolean) =>
        `w-full px-4 py-2 border rounded-lg outline-none ${hasError ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-slate-400"
        }`;

    const Help = ({ children }: { children: React.ReactNode }) => (
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{children}</p>
    );

    const startMutation = useMutation({
        mutationFn: async (payload: IntegrationFormValues) => {
            const res = await kyInstance.post("/api/notifications/integration/start", { json: payload }).json<ApiResponse>();

            if (!res.ok) {
                throw new Error(res.message || `Request failed`);
            }
            return res;
        },
        onSuccess: () => {
            setServerMsg({ type: "success", text: "We sent a 4-digit code to your test email." });
            setStep("CODE");
        },
        onError: async (err: any) => {
            // Ky HTTPError
            if (err?.name === "HTTPError" && err?.response) {
                try {
                    const data = (await err.response.json()) as ApiResponse;
                    setServerMsg({ type: "error", text: data.message || "Request failed" });
                    return;
                } catch {
                    setServerMsg({ type: "error", text: `Request failed (${err.response.status})` });
                    return;
                }
            }
            setServerMsg({ type: "error", text: err?.message || "Something went wrong" });
        },
    });


    const verifyMutation = useMutation({
        mutationFn: async (payload: CodeFormValues) => {
            const res = await kyInstance.post("/api/notifications/integration/verify", { json: payload }).json<ApiResponse>();

            if (!res.ok) {
                throw new Error(res.message || `Request failed`);
            }
            return res;
        },
        onSuccess: () => {
            setServerMsg({
                type: "success",
                text: "Verification successful. Your settings are ready — please click Save to apply them."
            });
            const configuredValues = form.getValues();

            onIntegrationSuccess({
                ...configuredValues,
                test_mode_passed: true,
            });
        },
        onError: async (err: any) => {
            // Ky HTTPError
            if (err?.name === "HTTPError" && err?.response) {
                try {
                    const data = (await err.response.json()) as ApiResponse;
                    setServerMsg({ type: "error", text: data.message || "Request failed" });
                    return;
                } catch {
                    setServerMsg({ type: "error", text: `Request failed (${err.response.status})` });
                    return;
                }
            }
            setServerMsg({ type: "error", text: err?.message || "Something went wrong" });
        },
    });

    const loading = startMutation.isPending || verifyMutation.isPending;

    return (
        <div className="py-4 px-5 space-y-4 border-t border-slate-200">
            {/* Info callout */}
            {showinfo
                &&
                <div className="rounded-lg relative border border-blue-200 bg-blue-50 p-4 border-l-4 border-l-blue-500">
                    <X className="absolute cursor-pointer top-2 right-2 size-4" onClick={() => setShowInfo(false)} />
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-700 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900">Verify email integration</p>
                            <p className="mt-1 text-sm text-blue-800">
                                We will send a 4-digit verification code to your test email. After verification, you can manage
                                other notification settings safely.
                            </p>
                        </div>
                    </div>
                </div>}

            {/* Server message */}
            {serverMsg && (
                <div
                    className={`rounded-lg border p-4 text-sm ${serverMsg.type === "success"
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-800"
                        }`}
                >
                    {serverMsg.text}
                </div>
            )}

            {/* STEP 1: FORM */}
            {step === "FORM" && (
                <form
                    onSubmit={form.handleSubmit((values) => {
                        setServerMsg(null);
                        startMutation.mutate(values);
                    })}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">From Name</label>
                            <input
                                type="text"
                                {...form.register("email_from_name")}
                                className={inputClass(!!form.formState.errors.email_from_name)}
                                placeholder="Your Restaurant Name"
                            />
                            <Help>This name will appear to customers as the sender name.</Help>
                            {form.formState.errors.email_from_name && (
                                <p className="mt-1 text-sm text-red-600">{form.formState.errors.email_from_name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Reply-To</label>
                            <input
                                type="email"
                                {...form.register("email_reply_to")}
                                className={inputClass(!!form.formState.errors.email_reply_to)}
                                placeholder="reservations@yourrestaurant.com"
                            />
                            <Help>This email address will be used to send notification emails to customers.</Help>
                            {form.formState.errors.email_reply_to && (
                                <p className="mt-1 text-sm text-red-600">{form.formState.errors.email_reply_to.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Test email send to</label>
                        <input
                            type="email"
                            {...form.register("email_test_to")}
                            className={inputClass(!!form.formState.errors.email_test_to)}
                            placeholder="test@domain.com"
                        />
                        <Help>We will send the verification code to this email address.</Help>
                        {form.formState.errors.email_test_to && (
                            <p className="mt-1 text-sm text-red-600">{form.formState.errors.email_test_to.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Resend API Key</label>
                        <input
                            type="password"
                            {...form.register("sendgrid_api_key")}
                            className={inputClass(!!form.formState.errors.sendgrid_api_key)}
                            placeholder="re_xxxxxxxxxxxx"
                        />
                        <Help>Your Resend API key is used to send emails from your account.</Help>
                        {form.formState.errors.sendgrid_api_key && (
                            <p className="mt-1 text-sm text-red-600">{form.formState.errors.sendgrid_api_key.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={loading || form.formState.isSubmitting}
                            className="px-4 py-2 rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Validate & Send Code
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 2: CODE */}
            {step === "CODE" && (
                <form
                    onSubmit={codeForm.handleSubmit((values) => {
                        setServerMsg(null);
                        verifyMutation.mutate(values);
                    })}
                    className="space-y-4"
                >
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm font-medium text-slate-800">Enter verification code</p>
                        <p className="mt-1 text-sm text-slate-600">
                            We sent a 4-digit code to your test email. Enter it below to complete verification.
                        </p>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">4-digit code</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                {...codeForm.register("code")}
                                className={inputClass(!!codeForm.formState.errors.code)}
                                placeholder="1234"
                            />
                            {codeForm.formState.errors.code && (
                                <p className="mt-1 text-sm text-red-600">{codeForm.formState.errors.code.message}</p>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={loading || codeForm.formState.isSubmitting}
                                className="px-4 py-2 rounded-lg cursor-pointer bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                Verify Code
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
