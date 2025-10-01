"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRestaurantStore } from "@/stores/restaurant-store";
import type { RestaurantStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function formatToTwoDecimals(n: number) {
    return Math.round(n * 100) / 100;
}



export default function RestaurantOperationalSettingsCard() {
    const { selectedRestaurant: restaurant, updateSelectedRestaurant } = useRestaurantStore();
    const t = useTranslations("restaurantSettings")
    // ----- INITIALS -----
    const initialFee = useMemo(
        () => formatToTwoDecimals(restaurant?.delivery_fee ?? 0),
        [restaurant?.delivery_fee]
    );
    const STATUS_OPTIONS: { label: string; value: RestaurantStatus }[] = [
        { label: t("fields.status.options.ALLOKAY"), value: "ALLOKAY" },
        { label: t("fields.status.options.DISABLE_DELIVERY"), value: "DISABLE_DELIVERY" },
        { label: t("fields.status.options.DISABLE_PICKUP"), value: "DISABLE_PICKUP" },
        { label: t("fields.status.options.DISABLE_BOTH"), value: "DISABLE_BOTH" },
    ];
    const initialTax = useMemo(
        () => formatToTwoDecimals(restaurant?.tax_percentage ?? 0),
        [restaurant?.tax_percentage]
    );

    const initialStatus = useMemo<RestaurantStatus>(
        () => (restaurant?.status as RestaurantStatus) ?? "ALLOKAY",
        [restaurant?.status]
    );

    // ----- LOCAL STATE -----
    const [status, setStatus] = useState<RestaurantStatus>(initialStatus);
    const [feeInput, setFeeInput] = useState<string>(initialFee.toFixed(2));
    const [taxInput, setTaxInput] = useState<string>(initialTax.toFixed(2));
    const [saving, setSaving] = useState(false);

    // keep inputs synced if restaurant changes externally
    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);
    useEffect(() => {
        setFeeInput(initialFee.toFixed(2));
    }, [initialFee]);
    useEffect(() => {
        setTaxInput(initialTax.toFixed(2));
    }, [initialTax]);

    // ----- PARSING / VALIDATION -----
    const parsedFee = useMemo(() => {
        const n = Number(feeInput);
        return Number.isFinite(n) ? n : NaN;
    }, [feeInput]);

    const feeIsInvalid = useMemo(() => {
        if (!Number.isFinite(parsedFee)) return true;
        if (parsedFee < 0) return true;
        return false;
    }, [parsedFee]);

    const parsedTax = useMemo(() => {
        const n = Number(taxInput);
        return Number.isFinite(n) ? n : NaN;
    }, [taxInput]);

    const taxIsInvalid = useMemo(() => {
        if (!Number.isFinite(parsedTax)) return true;
        if (parsedTax < 0 || parsedTax > 100) return true; // enforce 0–100 range
        return false;
    }, [parsedTax]);

    const normalizedNextFee = useMemo(
        () => (Number.isFinite(parsedFee) ? formatToTwoDecimals(parsedFee) : NaN),
        [parsedFee]
    );

    const hasStatusChanged = status !== initialStatus;
    const hasTaxChanged = Number(taxInput) !== initialTax;
    const hasFeeChanged = Number.isFinite(normalizedNextFee) && normalizedNextFee !== initialFee;
    const hasChanges = hasStatusChanged || hasFeeChanged || hasTaxChanged;

    // ----- SAVE BOTH (calls two endpoints if needed) -----
    const handleSave = async () => {
        if (!restaurant?.id) return;
        if (!hasChanges) return;

        // Validate before attempting save
        if (hasFeeChanged && feeIsInvalid) {
            toast.error(t("invalidFee"));
            return;
        }
        if (hasTaxChanged && taxIsInvalid) {
            toast.error(t("invalidTax"));
            return;
        }

        const prev = {
            status: restaurant.status as RestaurantStatus,
            delivery_fee: restaurant.delivery_fee,
            tax_percentage: restaurant.tax_percentage,
        };

        // Optimistic update in store
        updateSelectedRestaurant({
            status,
            delivery_fee: hasFeeChanged ? normalizedNextFee : restaurant.delivery_fee,
            tax_percentage: hasTaxChanged ? Number(taxInput) : restaurant.tax_percentage,
        });

        try {
            setSaving(true);

            // Build calls for only the fields that changed
            const tasks: Promise<Response>[] = [];

            if (hasStatusChanged) {
                tasks.push(
                    fetch(`/api/restaurants/${restaurant.id}/status`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status }),
                    })
                );
            }

            if (hasFeeChanged) {
                tasks.push(
                    fetch(`/api/restaurants/${restaurant.id}/delivery-fee`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ delivery_fee: normalizedNextFee }),
                    })
                );
            }
            if (hasTaxChanged) {
                tasks.push(
                    fetch(`/api/restaurants/${restaurant.id}/tax-percentage`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tax_percentage: taxInput }),
                    })
                );
            }

            const responses = await Promise.all(tasks);

            for (const res of responses) {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error || "Update failed");
                }
            }

            // Refresh store with canonical values from server (optional)
            // If you want to be extra precise, you can fetch both responses' JSON
            // and pick the fields, but since each endpoint returns the updated field,
            // here’s a cheap re-sync:
            // (Skip extra fetch: we already optimistically set correct values)

            toast.success(t("saveSuccess"));
        } catch (e: any) {
            // Rollback
            updateSelectedRestaurant({
                status: prev.status,
                delivery_fee: prev.delivery_fee,
                tax_percentage: prev.tax_percentage,
            });
            setStatus(prev.status);
            setFeeInput(formatToTwoDecimals(prev.delivery_fee ?? 0).toFixed(2));

            toast.error(t("saveError"), {
                description: e?.message ?? "Please try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="bg-white rounded-xl grid grid-cols-4 px-5 py-4 gap-3 overflow-hidden relative">
            {saving && (
                <div className="flex items-center justify-center flex-col gap-1 absolute inset-0 bg-white/90">
                    <Loader2 className="animate-spin text-black/50" />
                    <p className="text-sm text-black/50">
                        {t("saving")}
                    </p>
                </div>
            )}

            {/* Status */}
            <div className="space-y-2 ">
                <Label>
                    {t("fields.status.label")}
                </Label>
                <Select
                    disabled={saving}
                    value={status}
                    onValueChange={(v) => setStatus(v as RestaurantStatus)}>
                    <SelectTrigger className="w-full bg-white !h-10">
                        <SelectValue placeholder={t("fields.status.placeholder")} className="!h-10" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {/* Delivery Fee */}
            <div className="space-y-2 ">
                <Label htmlFor="delivery_fee">
                    {t("fields.deliveryFee.label")}
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="delivery_fee"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        disabled={saving}
                        value={feeInput}
                        onChange={(e) => setFeeInput(e.target.value)}
                        className={feeIsInvalid ? "border-red-500 h-10" : "h-10"}
                        placeholder={t("fields.deliveryFee.placeholder")}
                    />
                </div>
            </div>
            {/* Tax Fee */}
            <div className="space-y-2 ">
                <Label htmlFor="tax_percentage">
                    {t("fields.tax.label")}
                </Label>
                <div className="flex gap-2">
                    <Input
                        id="tax_percentage"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        disabled={saving}
                        value={taxInput}
                        onChange={(e) => setTaxInput(e.target.value)}
                        className={taxIsInvalid ? "border-red-500 h-10" : "h-10"}
                        placeholder={t("fields.tax.placeholder")}
                    />
                </div>
            </div>
            <div className="w-full h-full flex items-end">
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || (!hasChanges || (hasFeeChanged && feeIsInvalid) || (hasTaxChanged && taxIsInvalid))}
                    className="whitespace-nowrap bg-main-green rounded-full w-full !h-10 hover:bg-main-green/70 cursor-pointer"
                >
                    {saving ? t("saving") : t("saveChanges")}
                </Button>
            </div>
            <div>
                {feeIsInvalid && (
                    <p className="text-xs text-red-600">
                        {t("invalidAmount")}
                    </p>
                )}
            </div>
        </Card>
    );
}
