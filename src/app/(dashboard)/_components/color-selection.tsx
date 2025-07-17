import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const predefinedColors = [
    "#FFFFFF", "#000000", "#1DA1F2", "#1877F2", "#E1306C",
    "#25D366", "#FF0000", "#F59E0B", "#10B981"
];

export function ColorSelector({
    label,
    value,
    colors = predefinedColors,
    onChange,
}: {
    label?: string;
    colors?: string[]
    value: string;
    onChange: (val: string) => void;
}) {
    const [customColor, setCustomColor] = useState("#000000");

    return (
        <div className="space-y-2">
            {label
                &&
                <Label className="text-slate-700 text-sm font-medium">{label}</Label>
            }
            <Select onValueChange={(val) => onChange(val)} defaultValue={value} value={value}>
                <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: value }}
                        ></div>
                        <span>{value}</span>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: color }}
                                ></div>
                                {color}
                            </div>
                        </SelectItem>
                    ))}
                    <div className="px-4 py-2 border-t mt-2">
                        <Label className="text-xs text-muted-foreground">Custom Color</Label>
                        <Input
                            type="color"
                            className="w-full h-8 p-0 mt-1 border-none cursor-pointer"
                            value={customColor}
                            onChange={(e) => {
                                setCustomColor(e.target.value);
                                onChange(e.target.value);
                            }}
                        />
                    </div>
                </SelectContent>
            </Select>
        </div>
    );
}
