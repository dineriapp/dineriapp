"use client";

import LoadingUI from "@/components/loading-ui";
import TipTapEditor from "@/components/tip-tap-editor";
import {
    useReservationPolicies,
    useUpdateReservationPolicy,
} from "@/lib/reservation-queries";
import { ReservationPolicyType } from "@/lib/types";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
const policySchema = z.object({
    policy: z.string().min(1, "Policy is required"),
    enabled: z.boolean(),
});

export type PolicyFormType = z.infer<typeof policySchema>;

interface PolicyCardProps {
    title: string;
    icon: string;
    description: string;
    form: UseFormReturn<PolicyFormType>;
    onSubmit: (data: PolicyFormType) => Promise<void>;
    loading: boolean;
}

const PolicyCard: React.FC<PolicyCardProps> = ({
    title,
    icon,
    description,
    form,
    onSubmit,
    loading,
}) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = form;

    const enabled = watch("enabled");

    return (
        <div className="border rounded-lg p-5 bg-white shadow-sm w-full">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl">{icon}</span>
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>

                <button
                    type="button"
                    onClick={() => setValue("enabled", !enabled, { shouldDirty: true })}
                    disabled={loading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition 
            ${enabled ? "bg-green-500" : "bg-gray-300"} 
            ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label={`${title} enabled toggle`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition 
              ${enabled ? "translate-x-6" : "translate-x-1"}`}
                    />
                </button>
            </div>

            <p className="text-gray-500 text-sm">{description}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                <input type="hidden" {...register("enabled")} />

                <Controller
                    control={form.control}
                    name="policy"
                    render={({ field }) => (
                        <TipTapEditor content={field.value} onValueChange={field.onChange} />
                    )}
                />


                {errors.policy && (
                    <p className="text-red-500 text-sm mt-1">{errors.policy.message}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || !isDirty}
                    className={`mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 
            disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {loading ? "Saving..." : isDirty ? "Save Policy" : "Saved"}
                </button>
            </form>
        </div>
    );
};

const DEFAULT_HTML = "Enter policy here";

export default function PoliciesTab() {
    const initializedRef = useRef(false);

    const { selectedRestaurant: restaurant } = useRestaurantStore();
    const restaurantId = restaurant?.id;

    const { data: policies, isLoading, isError } = useReservationPolicies(restaurantId);
    const updatePolicy = useUpdateReservationPolicy();

    // track which card is currently saving (so only that one becomes disabled)
    const [savingType, setSavingType] = useState<ReservationPolicyType | null>(null);

    // Forms
    const cancellationForm = useForm<PolicyFormType>({
        resolver: zodResolver(policySchema),
        defaultValues: { enabled: true, policy: "" },
    });

    const depositForm = useForm<PolicyFormType>({
        resolver: zodResolver(policySchema),
        defaultValues: { enabled: true, policy: "" },
    });

    const diningForm = useForm<PolicyFormType>({
        resolver: zodResolver(policySchema),
        defaultValues: { enabled: true, policy: "" },
    });

    const noShowForm = useForm<PolicyFormType>({
        resolver: zodResolver(policySchema),
        defaultValues: { enabled: true, policy: "" },
    });

    // hydrate from API (or defaults if null)
    useEffect(() => {
        if (initializedRef.current) return;
        if (isLoading) return;

        if (policies === null) {
            cancellationForm.reset({ enabled: true, policy: DEFAULT_HTML });
            depositForm.reset({ enabled: true, policy: DEFAULT_HTML });
            diningForm.reset({ enabled: true, policy: DEFAULT_HTML });
            noShowForm.reset({ enabled: true, policy: DEFAULT_HTML });

            initializedRef.current = true;
            return;
        }

        if (policies) {
            // NOTE: use your model field names here
            cancellationForm.reset({
                enabled: (policies as any).cancellation_enabled,
                policy: (policies as any).cancellation_policy,
            });

            depositForm.reset({
                enabled: (policies as any).deposit_enabled,
                policy: (policies as any).deposit_policy,
            });

            diningForm.reset({
                enabled: (policies as any).dining_enabled,
                policy: (policies as any).dining_policy,
            });

            noShowForm.reset({
                enabled: (policies as any).no_show_enabled,
                policy: (policies as any).no_show_policy,
            });

            initializedRef.current = true;
        }
    }, [isLoading, policies, cancellationForm, depositForm, diningForm, noShowForm]);

    const canRender = useMemo(() => !!restaurantId && !isLoading, [restaurantId, isLoading]);

    if (!canRender) {
        return (
            <div className="flex items-center justify-center">
                <LoadingUI text="Loading policies...." className="" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center text-red-600">
                Failed to load policies.
            </div>
        );
    }

    const savePolicy = async (type: ReservationPolicyType, data: PolicyFormType, label: string) => {
        if (!restaurantId) return;

        const toastId = toast.loading(`Saving ${label}...`);
        setSavingType(type);

        try {
            const updated = await updatePolicy.mutateAsync({
                restaurantId,
                type,
                text: data.policy,     // HTML string
                enabled: data.enabled,
            });

            toast.success(`${label} saved successfully!`, { id: toastId });

            // Optional: sync the form with the server returned value and clear dirty state
            // (helps if backend sanitizes HTML)
            if (type === "cancellation") {
                cancellationForm.reset({
                    enabled: (updated as any).cancellation_enabled,
                    policy: (updated as any).cancellation_policy,
                });
            } else if (type === "deposit") {
                depositForm.reset({
                    enabled: (updated as any).deposit_enabled,
                    policy: (updated as any).deposit_policy,
                });
            } else if (type === "dining") {
                diningForm.reset({
                    enabled: (updated as any).dining_enabled,
                    policy: (updated as any).dining_policy,
                });
            } else {
                noShowForm.reset({
                    enabled: (updated as any).no_show_enabled,
                    policy: (updated as any).no_show_policy,
                });
            }
        } catch (e: any) {
            toast.error(e?.message || `Failed to save ${label}.`, { id: toastId });
        } finally {
            setSavingType(null);
        }
    };

    return (
        <div className="min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-center">Restaurant Policies</h1>

            <div className="space-y-5">
                <PolicyCard
                    title="Cancellation Policy"
                    icon="⛔"
                    description="Define your cancellation rules and timeframes."
                    form={cancellationForm}
                    loading={savingType === "cancellation"}
                    onSubmit={(data) => savePolicy("cancellation", data, "Cancellation Policy")}
                />

                <PolicyCard
                    title="Deposit Policy"
                    icon="💰"
                    description="Explain deposit requirements."
                    form={depositForm}
                    loading={savingType === "deposit"}
                    onSubmit={(data) => savePolicy("deposit", data, "Deposit Policy")}
                />

                <PolicyCard
                    title="Dining Policy"
                    icon="🍽️"
                    description="Set rules for dining experience."
                    form={diningForm}
                    loading={savingType === "dining"}
                    onSubmit={(data) => savePolicy("dining", data, "Dining Policy")}
                />

                <PolicyCard
                    title="No-Show Policy"
                    icon="⚠️"
                    description="Define consequences for missed reservations."
                    form={noShowForm}
                    loading={savingType === "no_show"}
                    onSubmit={(data) => savePolicy("no_show", data, "No-Show Policy")}
                />
            </div>
        </div>
    );
}
