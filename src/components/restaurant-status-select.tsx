"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RestaurantStatus } from "@prisma/client";

interface Props {
    value: RestaurantStatus;
    onChange: (val: RestaurantStatus) => void;
}

const STATUS_OPTIONS: { label: string; value: RestaurantStatus }[] = [
    { label: "All Okay (Open)", value: "ALLOKAY" },
    { label: "Disable delivery", value: "DISABLE_DELIVERY" },
    { label: "Disable pickup", value: "DISABLE_PICKUP" },
    { label: "Disable both", value: "DISABLE_BOTH" },
];

export default function RestaurantStatusSelect({ value, onChange }: Props) {


    return (
        <div className="space-y-2">
            <Label>Restaurant Status</Label>
            <Select value={value} onValueChange={(v) => onChange(v as RestaurantStatus)}>
                <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select status" />
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
    );
}
