"use client";

import type { ReservationPolicy } from "@prisma/client";
import { AlertCircle, Notebook } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { EDITOR_PROSE } from "@/lib/prose";

type PolicyKey = "cancellation" | "deposit" | "dining" | "no_show";

type Props = {
  policies: ReservationPolicy | null | undefined;
  children: React.ReactNode;
};

function PolicyPreviewCard(props: {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  html: string;
}) {
  const { title, description, icon, html } = props;

  return (
    <div className="border rounded-lg p-5 bg-white shadow-sm w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      </div>

      <p className="text-gray-500 text-sm">{description}</p>

      <div className="mt-4">
        <div
          className={EDITOR_PROSE}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export default function ReservationPoliciesDialog({
  policies,
  children,
}: Props) {
  const t = useTranslations("makeAReservation.reservationPolicies");

  const safePolicies = React.useMemo(() => {
    if (policies) return policies;
    return null;
  }, [policies]);

  const get = React.useCallback(
    (key: PolicyKey) => {
      if (!safePolicies) return null;

      switch (key) {
        case "cancellation":
          return {
            enabled: safePolicies.cancellation_enabled,
            html: safePolicies.cancellation_policy,
          };
        case "deposit":
          return {
            enabled: safePolicies.deposit_enabled,
            html: safePolicies.deposit_policy,
          };
        case "dining":
          return {
            enabled: safePolicies.dining_enabled,
            html: safePolicies.dining_policy,
          };
        case "no_show":
          return {
            enabled: safePolicies.no_show_enabled,
            html: safePolicies.no_show_policy,
          };
      }
    },
    [safePolicies]
  );

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        {children}
      </DialogTrigger>

      <DialogContent className="lg:max-w-4xl w-full gap-0 !p-0">
        <DialogHeader className="p-3">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Notebook className="text-green-500" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="px-5 pt-5 space-y-4 max-h-[65dvh] overflow-y-auto">
          {!safePolicies ? (
            <div className="flex items-start gap-3 rounded-lg border p-4 bg-muted/30">
              <AlertCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t("empty.title")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("empty.description")}
                </p>
              </div>
            </div>
          ) : (
            <>
              {get("cancellation")!.enabled && (
                <PolicyPreviewCard
                  title={t("policies.cancellation.title")}
                  icon="⛔"
                  description={t("policies.cancellation.description")}
                  enabled={get("cancellation")!.enabled}
                  html={get("cancellation")!.html}
                />
              )}

              {get("deposit")!.enabled && (
                <PolicyPreviewCard
                  title={t("policies.deposit.title")}
                  icon="💰"
                  description={t("policies.deposit.description")}
                  enabled={get("deposit")!.enabled}
                  html={get("deposit")!.html}
                />
              )}

              {get("dining")!.enabled && (
                <PolicyPreviewCard
                  title={t("policies.dining.title")}
                  icon="🍽️"
                  description={t("policies.dining.description")}
                  enabled={get("dining")!.enabled}
                  html={get("dining")!.html}
                />
              )}

              {get("no_show")!.enabled && (
                <PolicyPreviewCard
                  title={t("policies.noShow.title")}
                  icon="⚠️"
                  description={t("policies.noShow.description")}
                  enabled={get("no_show")!.enabled}
                  html={get("no_show")!.html}
                />
              )}
            </>
          )}
        </div>

        <Separator />

        <div className="p-2 flex justify-end">
          <DialogTrigger asChild>
            <Button variant="secondary">{t("close")}</Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
}
