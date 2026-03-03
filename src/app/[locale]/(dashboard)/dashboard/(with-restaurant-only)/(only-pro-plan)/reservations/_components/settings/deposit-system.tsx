"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  CancellationPolicy,
  DepositSystemSettings,
  DepositType,
  DynamicRule,
  RuleType,
} from "./types";
import { toast } from "sonner";

interface DepositSystemProps {
  value: DepositSystemSettings;
  onChange: (val: DepositSystemSettings) => void;
}

export default function DepositSystem({ value, onChange }: DepositSystemProps) {
  const t = useTranslations("SettingsPage.depositSystem");

  //  simple sanitizers
  const sanitizeNonNegative = (val: string) => {
    if (val === "") return "";
    const num = Number(val);
    if (isNaN(num) || num < 0) return "0";
    return num.toString();
  };

  const weekDays = [
    { label: t("sunday"), value: 0 },
    { label: t("monday"), value: 1 },
    { label: t("tuesday"), value: 2 },
    { label: t("wednesday"), value: 3 },
    { label: t("thursday"), value: 4 },
    { label: t("friday"), value: 5 },
    { label: t("saturday"), value: 6 },
  ];

  const sanitizePercentage = (val: string) => {
    if (val === "") return "";
    const num = Number(val);
    if (isNaN(num) || num < 0) return "0";
    if (num > 100) return "100";
    return num.toString();
  };

  // ===================== Helpers =====================
  const updateDepositSystem = <K extends keyof DepositSystemSettings>(
    key: K,
    newValue: DepositSystemSettings[K],
  ) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  // ===================== Rules =====================
  const addRule = () => {
    // Get highest existing priority
    const existingPriorities = value.dynamicRules.map((r) =>
      Number(r.priority || 0)
    );

    const nextPriority =
      existingPriorities.length > 0
        ? Math.max(...existingPriorities) + 1
        : 1;

    const newRule: DynamicRule = {
      id: Date.now(),
      ruleType: "day-of-week",
      depositType: "per-person",
      amount: "0",
      priority: String(nextPriority), // auto unique
    };

    updateDepositSystem("dynamicRules", [...value.dynamicRules, newRule]);
  };

  const updateRule = <K extends keyof DynamicRule>(
    id: number,
    key: K,
    valueThis: DynamicRule[K],
  ) => {

    if (key === "priority") {
      const raw = String(valueThis);

      // Prevent empty
      if (raw.trim() === "") {
        toast.error(t("priorityRequired"));
        return;
      }

      const numeric = Number(raw);

      // Prevent invalid numbers
      if (isNaN(numeric) || numeric < 0) {
        toast.error(t("priorityInvalid"));
        return;
      }

      const newPriority = String(numeric);

      // Prevent duplicates
      const duplicate = value.dynamicRules.find(
        (rule) =>
          rule.id !== id &&
          rule.priority === newPriority
      );

      if (duplicate) {
        toast.error(t("priorityDuplicate"));
        return;
      }

      valueThis = newPriority as DynamicRule[K];
    }

    const updated = value.dynamicRules.map((rule) =>
      rule.id === id ? { ...rule, [key]: valueThis } : rule,
    );

    updateDepositSystem("dynamicRules", updated);
  };

  const deleteRule = (id: number) => {
    updateDepositSystem(
      "dynamicRules",
      value.dynamicRules.filter((rule) => rule.id !== id),
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
    valueThis: CancellationPolicy[K],
  ) => {
    const updated = value.cancellationPolicies.map((p) =>
      p.id === id ? { ...p, [key]: valueThis } : p,
    );
    updateDepositSystem("cancellationPolicies", updated);
  };

  const deletePolicy = (id: number) => {
    updateDepositSystem(
      "cancellationPolicies",
      value.cancellationPolicies.filter((p) => p.id !== id),
    );
  };

  // ===================== Rule Specific Fields =====================
  const renderRuleFields = (rule: DynamicRule) => {
    switch (rule.ruleType) {
      case "day-of-week":
        const selectedDays = rule.days
          ? rule.days.split(",").map((d) => Number(d.trim()))
          : [];

        const toggleDay = (day: number) => {
          let updated: number[];

          if (selectedDays.includes(day)) {
            updated = selectedDays.filter((d) => d !== day);
          } else {
            updated = [...selectedDays, day];
          }

          updateRule(rule.id, "days", updated.sort().join(","));
        };

        return (
          <div className="flex flex-col space-y-2 w-full col-span-4">
            <Label>{t("ruleDaysLabel")}</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  {selectedDays.length > 0
                    ? weekDays
                      .filter((d) => selectedDays.includes(d.value))
                      .map((d) => d.label)
                      .join(", ")
                    : t("selectDays")}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-64 p-3 rounded-xl shadow-lg border bg-white"
                align="start"
              >
                <div className="grid gap-1">
                  {weekDays.map((day) => {
                    const isSelected = selectedDays.includes(day.value);

                    return (
                      <div
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors
            ${isSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/60"
                          }`}
                      >
                        <Label className="cursor-pointer text-sm font-medium">
                          {day.label}
                        </Label>

                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleDay(day.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );

      case "time-slot":
        return (
          <>
            <div className="flex flex-col space-y-2 w-full col-span-2">
              <Label>{t("ruleStartTimeLabel")}</Label>
              <Select
                value={rule.startTime}
                onValueChange={(value) =>
                  updateRule(rule.id, "startTime", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("ruleSelectTimePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 * 2 }, (_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = i % 2 === 0 ? "00" : "30";
                    const ampm = hour >= 12 ? "PM" : "AM";
                    const formattedHour = (hour % 12 || 12)
                      .toString()
                      .padStart(2, "0");
                    const label = `${formattedHour}:${minute} ${ampm}`;
                    return (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2 w-full col-span-2">
              <Label>{t("ruleEndTimeLabel")}</Label>
              <Select
                value={rule.endTime}
                onValueChange={(value) => updateRule(rule.id, "endTime", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("ruleSelectTimePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 * 2 }, (_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = i % 2 === 0 ? "00" : "30";
                    const ampm = hour >= 12 ? "PM" : "AM";
                    const formattedHour = (hour % 12 || 12)
                      .toString()
                      .padStart(2, "0");
                    const label = `${formattedHour}:${minute} ${ampm}`;
                    return (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "party-size":
        return (
          <>
            <div className="flex flex-col space-y-2 w-full col-span-2">
              <Label>{t("ruleMinPartySizeLabel")}</Label>
              <Input
                type="number"
                min={0}
                value={rule.minPartySize || ""}
                onChange={(e) =>
                  updateRule(
                    rule.id,
                    "minPartySize",
                    sanitizeNonNegative(e.target.value),
                  )
                }
              />
            </div>
            <div className="flex flex-col space-y-2 w-full col-span-2">
              <Label>{t("ruleMaxPartySizeLabel")}</Label>
              <Input
                type="number"
                min={0}
                value={rule.maxPartySize || ""}
                onChange={(e) =>
                  updateRule(
                    rule.id,
                    "maxPartySize",
                    sanitizeNonNegative(e.target.value),
                  )
                }
              />
            </div>
          </>
        );

      case "special-date":
        return (
          <div className="flex flex-col space-y-2 w-full col-span-4">
            <Label>{t("ruleDateLabel")}</Label>
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
            <CardTitle>{t("enableDepositSystemTitle")}</CardTitle>
            <CardDescription>
              {t("enableDepositSystemDescription")}
            </CardDescription>
          </div>
          <Switch
            checked={value.depositSystemEnabled}
            onCheckedChange={(val) =>
              updateDepositSystem("depositSystemEnabled", val)
            }
          />
        </CardHeader>

        {value.depositSystemEnabled && (
          <CardContent className="grid gap-6 800:grid-cols-3">
            {/* Type */}
            <div className="flex flex-col space-y-2 w-full">
              <Label>{t("defaultDepositTypeLabel")}</Label>
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
                  <SelectItem value="per-person">
                    {t("defaultDepositTypePerPerson")}
                  </SelectItem>
                  <SelectItem value="flat-rate">
                    {t("defaultDepositTypeFlatRate")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="flex flex-col space-y-2 w-full">
              <Label>{t("defaultAmountLabel")}</Label>
              <Input
                type="number"
                min={0}
                value={value.depositAmount}
                onChange={(e) =>
                  updateDepositSystem(
                    "depositAmount",
                    sanitizeNonNegative(e.target.value),
                  )
                }
              />
            </div>

            {/* Currency */}
            <div className="flex flex-col space-y-2 w-full">
              <Label>{t("currencyLabel")}</Label>
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
                  <SelectItem value="EUR (€)">{t("currencyEur")}</SelectItem>
                  <SelectItem value="USD ($)">{t("currencyUsd")}</SelectItem>
                  <SelectItem value="GBP (£)">{t("currencyGbp")}</SelectItem>
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
              <CardTitle>{t("dynamicRulesTitle")}</CardTitle>
              <CardDescription>{t("dynamicRulesDescription")}</CardDescription>
            </div>
            <Button onClick={addRule}>
              <Plus className="h-4 w-4" />
              {t("dynamicRulesAddRuleButton")}
            </Button>
          </CardHeader>
          {value.dynamicRules?.length > 0 && (
            <CardContent className="space-y-6">
              {value.dynamicRules.map((rule) => (
                <div
                  key={rule.id}
                  className="grid gap-4 md:grid-cols-4 border p-4 rounded-md overflow-hidden bg-muted/10 relative"
                >
                  {/* Rule Type */}
                  <div className="flex flex-col space-y-2 w-full">
                    <Label>{t("ruleTypeLabel")}</Label>
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
                        <SelectItem value="day-of-week">
                          {t("ruleTypeDayOfWeek")}
                        </SelectItem>
                        <SelectItem value="time-slot">
                          {t("ruleTypeTimeSlot")}
                        </SelectItem>
                        <SelectItem value="party-size">
                          {t("ruleTypePartySize")}
                        </SelectItem>
                        <SelectItem value="special-date">
                          {t("ruleTypeSpecialDate")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Deposit Type */}
                  <div className="flex flex-col space-y-2 w-full">
                    <Label>{t("ruleDepositTypeLabel")}</Label>
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
                        <SelectItem value="per-person">
                          {t("ruleDepositTypePerPerson")}
                        </SelectItem>
                        <SelectItem value="flat-rate">
                          {t("ruleDepositTypeFlatRate")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col space-y-2 w-full">
                    <Label>{t("ruleAmountLabel")}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={rule.amount}
                      onChange={(e) =>
                        updateRule(
                          rule.id,
                          "amount",
                          sanitizeNonNegative(e.target.value),
                        )
                      }
                    />
                  </div>

                  {/* Priority */}
                  <div className="flex flex-col space-y-2 w-full">
                    <Label>{t("rulePriorityLabel")}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={rule.priority}
                      onChange={(e) =>
                        updateRule(
                          rule.id,
                          "priority",
                          sanitizeNonNegative(e.target.value),
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("priorityHelperText")}
                    </p>
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
          )}
        </Card>
      )}
      {/* =================== Cancellation Policies =================== */}
      {value.depositSystemEnabled && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>{t("cancellationPoliciesTitle")}</CardTitle>
              <CardDescription>
                {t("cancellationPoliciesDescription")}
              </CardDescription>
            </div>
            <Button onClick={addPolicy}>
              <Plus className="h-4 w-4" />
              {t("cancellationPoliciesAddPolicyButton")}
            </Button>
          </CardHeader>
          {value.cancellationPolicies?.length > 0 && (
            <CardContent className="space-y-4">
              {value.cancellationPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-start justify-between gap-4 border p-4 rounded-md bg-muted/10 relative"
                >
                  <div className="flex flex-col w-full col-span-4 space-y-2">
                    <Label>{t("policyHoursBeforeLabel")}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={policy.hoursBefore}
                      onChange={(e) =>
                        updatePolicy(
                          policy.id,
                          "hoursBefore",
                          sanitizeNonNegative(e.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="flex flex-col w-full space-y-2 col-span-4">
                    <Label>{t("policyRefundPercentageLabel")}</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={policy.refundPercentage}
                      onChange={(e) =>
                        updatePolicy(
                          policy.id,
                          "refundPercentage",
                          sanitizePercentage(e.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="flex w-full flex-col space-y-2 col-span-1">
                    <Label>{t("policyActiveLabel")}</Label>
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
          )}
        </Card>
      )}
    </div>
  );
}
