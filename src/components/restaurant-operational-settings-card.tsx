"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRestaurantStore } from "@/stores/restaurant-store";
import type { RestaurantStatus } from "@prisma/client";

function formatToTwoDecimals(n: number) {
    return Math.round(n * 100) / 100;
}

const STATUS_OPTIONS: { label: string; value: RestaurantStatus }[] = [
    { label: "All Okay (Open)", value: "ALLOKAY" },
    { label: "Disable delivery", value: "DISABLE_DELIVERY" },
    { label: "Disable pickup", value: "DISABLE_PICKUP" },
    { label: "Disable both", value: "DISABLE_BOTH" },
];

export default function RestaurantOperationalSettingsCard() {
    const { selectedRestaurant: restaurant, updateSelectedRestaurant } = useRestaurantStore();

    // ----- INITIALS -----
    const initialFee = useMemo(
        () => formatToTwoDecimals(restaurant?.delivery_fee ?? 0),
        [restaurant?.delivery_fee]
    );
    const initialStatus = useMemo<RestaurantStatus>(
        () => (restaurant?.status as RestaurantStatus) ?? "ALLOKAY",
        [restaurant?.status]
    );

    // ----- LOCAL STATE -----
    const [status, setStatus] = useState<RestaurantStatus>(initialStatus);
    const [feeInput, setFeeInput] = useState<string>(initialFee.toFixed(2));
    const [saving, setSaving] = useState(false);

    // keep inputs synced if restaurant changes externally
    useEffect(() => {
        setStatus(initialStatus);
    }, [initialStatus]);
    useEffect(() => {
        setFeeInput(initialFee.toFixed(2));
    }, [initialFee]);

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

    const normalizedNextFee = useMemo(
        () => (Number.isFinite(parsedFee) ? formatToTwoDecimals(parsedFee) : NaN),
        [parsedFee]
    );

    const hasStatusChanged = status !== initialStatus;
    const hasFeeChanged = Number.isFinite(normalizedNextFee) && normalizedNextFee !== initialFee;
    const hasChanges = hasStatusChanged || hasFeeChanged;

    // ----- SAVE BOTH (calls two endpoints if needed) -----
    const handleSave = async () => {
        if (!restaurant?.id) return;
        if (!hasChanges) return;

        // Validate before attempting save
        if (hasFeeChanged && feeIsInvalid) {
            toast.error("Please enter a valid non-negative delivery fee.");
            return;
        }

        const prev = {
            status: restaurant.status as RestaurantStatus,
            delivery_fee: restaurant.delivery_fee,
        };

        // Optimistic update in store
        updateSelectedRestaurant({
            status,
            delivery_fee: hasFeeChanged ? normalizedNextFee : restaurant.delivery_fee,
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

            toast.success("Settings updated");
        } catch (e: any) {
            // Rollback
            updateSelectedRestaurant({
                status: prev.status,
                delivery_fee: prev.delivery_fee,
            });
            setStatus(prev.status);
            setFeeInput(formatToTwoDecimals(prev.delivery_fee ?? 0).toFixed(2));

            toast.error("Could not save changes", {
                description: e?.message ?? "Please try again.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="bg-white rounded-xl grid grid-cols-5 px-5 py-4 gap-3 overflow-hidden relative">
            {saving && (
                <div className="flex items-center justify-center flex-col gap-1 absolute inset-0 bg-white/90">
                    <Loader2 className="animate-spin text-black/50" />
                    <p className="text-sm text-black/50">Saving...</p>
                </div>
            )}

            {/* Status */}
            <div className="space-y-2 col-span-2">
                <Label>Restaurant Status</Label>
                <Select
                    disabled={saving}
                    value={status}
                    onValueChange={(v) => setStatus(v as RestaurantStatus)}>
                    <SelectTrigger className="w-full bg-white !h-10">
                        <SelectValue placeholder="Select status" className="!h-10" />
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
            <div className="space-y-2 col-span-2">
                <Label htmlFor="delivery_fee">Delivery Fee (€)</Label>
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
                        placeholder="0.00"
                    />
                </div>
            </div>
            <div className="w-full h-full flex items-end">
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || (!hasChanges || (hasFeeChanged && feeIsInvalid))}
                    className="whitespace-nowrap bg-main-green rounded-full w-full !h-10 hover:bg-main-green/70 cursor-pointer"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
            <div>
                {feeIsInvalid && (
                    <p className="text-xs text-red-600">Please enter a valid non-negative amount.</p>
                )}
            </div>
        </Card>
    );
}
