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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { CancellationPolicy, DepositSystemSettings, DepositType, DynamicRule, RuleType } from "./types";

interface DepositSystemProps {
    value: DepositSystemSettings;
    onChange: (val: DepositSystemSettings) => void;
}

export default function DepositSystem({ value, onChange }: DepositSystemProps) {

    // ===================== Helpers =====================
    const updateDepositSystem = <K extends keyof DepositSystemSettings>(
        key: K,
        newValue: DepositSystemSettings[K]
    ) => {
        onChange({
            ...value,
            [key]: newValue,
        });
    };

    // ===================== Rules =====================
    const addRule = () => {
        const newRule: DynamicRule = {
            id: Date.now(),
            ruleType: "day-of-week",
            depositType: "per-person",
            amount: "0",
            priority: "0",
        };
        updateDepositSystem("dynamicRules", [...value.dynamicRules, newRule]);
    };



    const updateRule = <K extends keyof DynamicRule>(
        id: number,
        key: K,
        valueThis: DynamicRule[K]
    ) => {
        const updated = value.dynamicRules.map((rule) =>
            rule.id === id ? { ...rule, [key]: valueThis } : rule
        );
        updateDepositSystem("dynamicRules", updated);
    };

    const deleteRule = (id: number) => {
        updateDepositSystem(
            "dynamicRules",
            value.dynamicRules.filter((rule) => rule.id !== id)
        );
    };

    // ===================== Policies =====================
    const addPolicy = () => {
        const newPolicy: CancellationPolicy = {
            id: Date.now(),
            hoursBefore: "24",
            refundPercentage: "100",
            active: true,
        };
        updateDepositSystem("cancellationPolicies", [
            ...value.cancellationPolicies,
            newPolicy,
        ]);
    };

    const updatePolicy = <K extends keyof CancellationPolicy>(
        id: number,
        key: K,
        valueThis: CancellationPolicy[K]
    ) => {
        const updated = value.cancellationPolicies.map((p) =>
            p.id === id ? { ...p, [key]: valueThis } : p
        );
        updateDepositSystem("cancellationPolicies", updated);
    };

    const deletePolicy = (id: number) => {
        updateDepositSystem(
            "cancellationPolicies",
            value.cancellationPolicies.filter((p) => p.id !== id)
        );
    };

    // ===================== Rule Specific Fields =====================
    const renderRuleFields = (rule: DynamicRule) => {
        switch (rule.ruleType) {
            case "day-of-week":
                return (
                    <div className="flex flex-col space-y-2 w-full col-span-4">
                        <Label>Days (0=Sun, 6=Sat)</Label>
                        <Input
                            value={rule.days || ""}
                            onChange={(e) => updateRule(rule.id, "days", e.target.value)}
                            placeholder="e.g. 5,6"
                        />
                    </div>
                );

            case "time-slot":
                return (
                    <>
                        <div className="flex flex-col space-y-2 w-full col-span-2">
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={rule.startTime || ""}
                                onChange={(e) => updateRule(rule.id, "startTime", e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col space-y-2 w-full col-span-2">
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={rule.endTime || ""}
                                onChange={(e) => updateRule(rule.id, "endTime", e.target.value)}
                            />
                        </div>
                    </>
                );

            case "party-size":
                return (
                    <>
                        <div className="flex flex-col space-y-2 w-full col-span-2">
                            <Label>Min Party Size</Label>
                            <Input
                                type="number"
                                value={rule.minPartySize || ""}
                                onChange={(e) =>
                                    updateRule(rule.id, "minPartySize", e.target.value)
                                }
                            />
                        </div>
                        <div className="flex flex-col space-y-2 w-full col-span-2">
                            <Label>Max Party Size</Label>
                            <Input
                                type="number"
                                value={rule.maxPartySize || ""}
                                onChange={(e) =>
                                    updateRule(rule.id, "maxPartySize", e.target.value)
                                }
                            />
                        </div>
                    </>
                );

            case "special-date":
                return (
                    <div className="flex flex-col space-y-2 w-full col-span-4">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={rule.date || ""}
                            onChange={(e) => updateRule(rule.id, "date", e.target.value)}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-3">
            {/* =================== Deposit System Toggle Card =================== */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Enable Deposit System</CardTitle>
                        <CardDescription>Require deposits for reservations</CardDescription>
                    </div>
                    <Switch
                        checked={value.depositSystemEnabled}
                        onCheckedChange={(val) =>
                            updateDepositSystem("depositSystemEnabled", val)
                        }
                    />
                </CardHeader>

                {value.depositSystemEnabled && (
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        {/* Type */}
                        <div className="flex flex-col space-y-2 w-full">
                            <Label>Default Deposit Type</Label>
                            <Select
                                value={value.depositType}
                                onValueChange={(val: DepositType) =>
                                    updateDepositSystem("depositType", val)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="per-person">Per Person</SelectItem>
                                    <SelectItem value="flat-rate">Flat Rate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col space-y-2 w-full">
                            <Label>Default Amount (EUR)</Label>
                            <Input
                                type="number"
                                value={value.depositAmount}
                                onChange={(e) =>
                                    updateDepositSystem("depositAmount", e.target.value)
                                }
                            />
                        </div>

                        {/* Currency */}
                        <div className="flex flex-col space-y-2 w-full">
                            <Label>Currency</Label>
                            <Select
                                value={value.depositCurrency}
                                onValueChange={(val) =>
                                    updateDepositSystem("depositCurrency", val)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                                    <SelectItem value="USD ($)">USD ($)</SelectItem>
                                    <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* =================== Dynamic Rules Card =================== */}
            {value.depositSystemEnabled && (
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>Dynamic Deposit Rules</CardTitle>
                            <CardDescription>
                                Set different deposits based on conditions
                            </CardDescription>
                        </div>
                        <Button onClick={addRule}>
                            <Plus className="h-4 w-4" /> Add Rule
                        </Button>
                    </CardHeader>
                    {value.dynamicRules?.length > 0 &&
                        <CardContent className="space-y-6">
                            {value.dynamicRules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className="grid gap-4 md:grid-cols-4 border p-4 rounded-md overflow-hidden bg-muted/10 relative"
                                >
                                    {/* Rule Type */}
                                    <div className="flex flex-col space-y-2 w-full">
                                        <Label>Rule Type</Label>
                                        <Select
                                            value={rule.ruleType}
                                            onValueChange={(val: RuleType) =>
                                                updateRule(rule.id, "ruleType", val)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="day-of-week">Day of Week</SelectItem>
                                                <SelectItem value="time-slot">Time Slot</SelectItem>
                                                <SelectItem value="party-size">Party Size</SelectItem>
                                                <SelectItem value="special-date">Special Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Deposit Type */}
                                    <div className="flex flex-col space-y-2 w-full">
                                        <Label>Deposit Type</Label>
                                        <Select
                                            value={rule.depositType}
                                            onValueChange={(val: DepositType) =>
                                                updateRule(rule.id, "depositType", val)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="per-person">Per Person</SelectItem>
                                                <SelectItem value="flat-rate">Flat Rate</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex flex-col space-y-2 w-full">
                                        <Label>Amount (EUR)</Label>
                                        <Input
                                            type="number"
                                            value={rule.amount}
                                            onChange={(e) =>
                                                updateRule(rule.id, "amount", e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* Priority */}
                                    <div className="flex flex-col space-y-2 w-full">
                                        <Label>Priority</Label>
                                        <Input
                                            type="number"
                                            value={rule.priority}
                                            onChange={(e) =>
                                                updateRule(rule.id, "priority", e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* Conditional fields */}
                                    {renderRuleFields(rule)}

                                    {/* Delete */}
                                    <button
                                        onClick={() => deleteRule(rule.id)}
                                        className="absolute rounded-bl-[20px] pb-1 pl-1 bg-red-500 cursor-pointer right-0  size-[30px] flex items-center justify-center top-0 text-red-600 hover:text-red-800"
                                    >
                                        <X size={18} className="text-white" />
                                    </button>
                                </div>
                            ))}
                        </CardContent>
                    }
                </Card>
            )}
            {/* =================== Cancellation Policies =================== */}
            {value.depositSystemEnabled && (
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <div>
                            <CardTitle>Cancellation Policies</CardTitle>
                            <CardDescription>
                                Define refund rules based on cancellation timing
                            </CardDescription>
                        </div>
                        <Button onClick={addPolicy}>
                            <Plus className="h-4 w-4" /> Add Policy
                        </Button>
                    </CardHeader>
                    {
                        value.cancellationPolicies?.length > 0 &&
                        <CardContent className="space-y-4">
                            {value.cancellationPolicies.map((policy) => (
                                <div
                                    key={policy.id}
                                    className="flex items-start justify-between gap-4 border p-4 rounded-md bg-muted/10 relative"
                                >
                                    <div className="flex flex-col w-full col-span-4 space-y-2">
                                        <Label>Hours Before</Label>
                                        <Input
                                            type="number"
                                            value={policy.hoursBefore}
                                            onChange={(e) =>
                                                updatePolicy(policy.id, "hoursBefore", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col w-full space-y-2 col-span-4">
                                        <Label>Refund %</Label>
                                        <Input
                                            type="number"
                                            value={policy.refundPercentage}
                                            onChange={(e) =>
                                                updatePolicy(policy.id, "refundPercentage", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex w-full flex-col space-y-2 col-span-1">
                                        <Label>Active</Label>
                                        <Switch
                                            checked={policy.active}
                                            onCheckedChange={(val) =>
                                                updatePolicy(policy.id, "active", val)
                                            }
                                        />
                                    </div>
                                    <button
                                        onClick={() => deletePolicy(policy.id)}
                                        className="absolute rounded-bl-[20px] pb-1 pl-1 bg-red-500 cursor-pointer right-0  size-[30px] flex items-center justify-center top-0 text-red-600 hover:text-red-800"
                                    >
                                        <X size={18} className="text-white" />
                                    </button>
                                </div>
                            ))}
                        </CardContent>
                    }
                </Card>
            )}
        </div>
    );
}
