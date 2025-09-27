"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getStripePlans, STRIPE_PLANS } from "@/lib//stripe-plans";
import { toast } from "sonner";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Locale } from "@/i18n/routing";

interface SubscriptionData {
  plan: string;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();
  const locale: Locale = useLocale() as Locale
  const t = useTranslations("Settings.subscription")
  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/user/subscription");
      if (!response.ok) {
        throw new Error(t("error.fetchDescription"));
      }
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error(t("error.title"), error);
      toast.error("Error", {
        description: t("error.fetchDescription"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Portal error:", error);
      toast.error(t("error.title"), {
        description: t("error.portalDescription"),
      });
      setPortalLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push("/#pricing");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t("alert.noSubscription.description")}
        </AlertDescription>
      </Alert>
    );
  }
  // @ts-expect-error due to types
  const currentPlan = getStripePlans(locale)[subscription.plan] || STRIPE_PLANS.basic;
  const isBasic = subscription.plan === "basic";
  const isPastDue = subscription.status === "past_due";

  return (
    <Card className="bg-white box-shad-every-2 shadow-md">
      <CardContent className="space-y-6">
        <div className="font-poppins">
          <h1 className="text-3xl font-bold">
            {t("page.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("page.description")}
          </p>
        </div>

        {isPastDue && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("alert.pastDue.title")}{" "}{t("alert.pastDue.description")}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t("plan.current.title")}
                <Badge variant={isBasic ? "secondary" : "default"}>
                  {currentPlan.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                {isBasic
                  ? t("plan.current.basicDescription")
                  : t("plan.current.premiumDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                €{currentPlan.price}
                {currentPlan.price > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {t("plan.current.pricePerMonth")}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">
                  {t("plan.current.featuresTitle")}
                </h4>
                <ul className="text-sm space-y-1">
                  {/* @ts-expect-error due to types  */}
                  {currentPlan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                  {currentPlan.features.length > 4 && (
                    <li className="text-muted-foreground">
                      +{currentPlan.features.length - 4}  {t("plan.current.moreFeatures")}
                    </li>
                  )}
                </ul>
              </div>

              {isBasic ? (
                <Button onClick={handleUpgrade} className="w-full">
                  {t("plan.basic.upgradeButton")}
                </Button>
              ) : (
                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  variant="outline"
                  className="w-full h-[44px] bg-transparent"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("plan.premium.manageButton.loading")}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("plan.premium.manageButton.default")}
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("billing.title")}
              </CardTitle>
              <CardDescription>
                {t("billing.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("billing.status")}
                  </span>
                  <Badge
                    variant={
                      subscription.status === "active"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>

                {subscription.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("billing.nextBillingDate")}
                    </span>
                    <span className="text-sm flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("billing.plan")}
                  </span>
                  <span className="text-sm font-medium">
                    {currentPlan.name}
                  </span>
                </div>
              </div>

              {!isBasic && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    variant="outline"
                    size="sm"
                    className="w-full h-[44px] bg-transparent"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("billing.updatePayment.loading")}
                      </>
                    ) : (
                      t("billing.updatePayment.button")
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isBasic && (
          <Card>
            <CardHeader>
              <CardTitle>
                {t("upgrade.title")}
              </CardTitle>
              <CardDescription>
                {t("upgrade.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">
                    {t("upgrade.pro.title")}
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {t.raw("upgrade.pro.features")?.map((item: string, idx: number) => (
                      <li key={`fddfds-${idx}`}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">
                    {t("upgrade.enterprise.title")}
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {t.raw("upgrade.enterprise.features")?.map((item: string, idx: number) => (
                      <li key={`fddfds-${idx}`}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button onClick={handleUpgrade} className="mt-4 h-[44px]" asChild>
                <Link href={"/plans"}>
                  {t("upgrade.viewPlansButton")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
