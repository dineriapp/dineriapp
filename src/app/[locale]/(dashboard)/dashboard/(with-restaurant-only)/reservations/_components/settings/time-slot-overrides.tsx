"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { OverridesSettings, TimeSlotOverride } from "./types";

interface TimeSlotOverridesProps {
    settings: OverridesSettings;
    updateSettingsSection: (section: "overrides_settings", value: OverridesSettings) => void;
}

export default function TimeSlotOverrides({ settings, updateSettingsSection }: TimeSlotOverridesProps) {

    const [form, setForm] = useState({
        date: "",
        startTime: "",
        endTime: "",
        reason: "",
        blocked: true,
    });

    const [showForm, setShowForm] = useState(false);

    const handleAddOverride = () => {
        if (!form.date || !form.startTime || !form.endTime) return;

        const newOverride: TimeSlotOverride = {
            id: uuidv4(),
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            reason: form.reason,
            blocked: form.blocked,
        };

        updateSettingsSection("overrides_settings", {
            ...settings,
            overrides: [...settings.overrides, newOverride],
        });

        setForm({ date: "", startTime: "", endTime: "", reason: "", blocked: true });
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        updateSettingsSection("overrides_settings", {
            ...settings,
            overrides: settings.overrides.filter((o) => o.id !== id),
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Time Slot Overrides</CardTitle>
                    <CardDescription>
                        Allow blocking specific time slots manually
                    </CardDescription>
                </div>
                <div className="flex items-center justify-center gap-4">
                    {/* Add Button */}
                    {
                        settings.overrides_enabled
                        &&
                        <div className="flex justify-end">
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Override
                            </Button>
                        </div>
                    }
                    <Switch
                        id="override-switch"
                        checked={settings.overrides_enabled}
                        onCheckedChange={(val) =>
                            updateSettingsSection("overrides_settings", {
                                ...settings,
                                overrides_enabled: val,
                            })
                        }
                    />
                </div>
            </CardHeader>

            {settings.overrides_enabled && (showForm || settings.overrides.length > 0) && (
                <CardContent className="space-y-6">
                    {/* Form */}
                    {showForm && (
                        <div className="p-5 border relative rounded-md shadow-sm space-y-6 bg-white">
                            <button
                                onClick={() => setShowForm(false)}
                                className="absolute rounded-bl-[20px] pb-1 pl-1 bg-red-500 cursor-pointer right-0  size-[30px] flex items-center justify-center top-0 text-red-600 hover:text-red-800"
                            >
                                <X size={18} className="text-white" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date</Label>
                                    <Input
                                        type="date"
                                        id="date"
                                        value={form.date}
                                        onChange={(e) =>
                                            setForm({ ...form, date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="start">Start Time</Label>
                                    <Input
                                        type="time"
                                        id="start"
                                        value={form.startTime}
                                        onChange={(e) =>
                                            setForm({ ...form, startTime: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end">End Time</Label>
                                    <Input
                                        type="time"
                                        id="end"
                                        value={form.endTime}
                                        onChange={(e) =>
                                            setForm({ ...form, endTime: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Private event, maintenance, etc."
                                    value={form.reason}
                                    onChange={(e) =>
                                        setForm({ ...form, reason: e.target.value })
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="block"
                                    checked={form.blocked}
                                    onCheckedChange={(val) =>
                                        setForm({ ...form, blocked: val })
                                    }
                                />
                                <Label htmlFor="block">Block Time Slot</Label>
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleAddOverride}
                            >
                                Create Override
                            </Button>
                        </div>
                    )}

                    {/* List of Overrides */}
                    {
                        settings.overrides.length > 0 &&
                        <div className="space-y-3">
                            {

                                settings.overrides.map((override) => (
                                    <div
                                        key={override.id}
                                        className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-2 h-12 rounded ${override.blocked ? 'bg-red-500' : 'bg-amber-500'
                                                    }`}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <CalendarIcon className="w-4 h-4 text-slate-600" />
                                                    <span className="font-semibold text-slate-900">
                                                        {new Date(override.date + 'T00:00:00').toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    {override.startTime} - {override.endTime}
                                                </div>
                                                {override.reason && (
                                                    <div className="text-sm text-slate-500 mt-1">{override.reason}</div>
                                                )}
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {override.blocked ? 'Blocked' : 'Special hours'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(override.id!)}
                                            className="text-red-600 hover:text-red-700 p-2"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            }

                        </div>
                    }
                </CardContent>
            )}
        </Card>
    );
}
