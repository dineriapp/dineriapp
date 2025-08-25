"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRestaurantStore } from "@/stores/restaurant-store";

function formatToTwoDecimals(n: number) {
    return Math.round(n * 100) / 100;
}

export default function RestaurantDeliveryFeeField() {
    const { selectedRestaurant: restaurant, updateSelectedRestaurant } = useRestaurantStore();
    const initial = useMemo(() => formatToTwoDecimals(restaurant?.delivery_fee ?? 0), [restaurant?.delivery_fee]);

    const [value, setValue] = useState<string>(initial.toFixed(2));
    const [saving, setSaving] = useState(false);

    // keep field synced if restaurant changes
    useEffect(() => {
        setValue(initial.toFixed(2));
    }, [initial]);

    const parsed = useMemo(() => {
        const n = Number(value);
        return Number.isFinite(n) ? n : NaN;
    }, [value]);

    const isDirty = useMemo(() => {
        if (!Number.isFinite(parsed)) return false;
        return formatToTwoDecimals(parsed) !== initial;
    }, [parsed, initial]);

    const isInvalid = useMemo(() => {
        if (!Number.isFinite(parsed)) return true;
        if (parsed < 0) return true;
        return false;
    }, [parsed]);

    const save = async () => {
        if (!restaurant?.id) return;
        if (isInvalid || !isDirty) return;

        const next = formatToTwoDecimals(parsed);
        const prev = restaurant.delivery_fee;

        // optimistic store sync
        updateSelectedRestaurant({ delivery_fee: next });

        try {
            setSaving(true);
            const res = await fetch(`/api/restaurants/${restaurant.id}/delivery-fee`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ delivery_fee: next }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to update delivery fee");
            }

            const data = await res.json();
            updateSelectedRestaurant({ delivery_fee: data.data.delivery_fee });
            toast.success("Delivery fee updated");
        } catch (e: any) {
            // rollback
            updateSelectedRestaurant({ delivery_fee: prev });
            toast.error("Could not update delivery fee", {
                description: e?.message ?? "Please try again",
            });
            // also reset input back to previous on failure
            setValue(prev.toFixed(2));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="delivery_fee">Delivery Fee (€)</Label>
            <div className="flex gap-2">
                <Input
                    id="delivery_fee"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={isInvalid ? "border-red-500" : ""}
                    placeholder="0.00"
                />
                <Button
                    onClick={save}
                    disabled={saving || isInvalid || !isDirty}
                    className="whitespace-nowrap"
                >
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
            {isInvalid && (
                <p className="text-xs text-red-600">Please enter a valid non-negative amount.</p>
            )}
            {!isInvalid && !isDirty && (
                <p className="text-xs text-muted-foreground">Current: €{initial.toFixed(2)}</p>
            )}
        </div>
    );
}
