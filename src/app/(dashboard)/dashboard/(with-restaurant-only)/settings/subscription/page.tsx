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
import { STRIPE_PLANS } from "@/lib//stripe-plans";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/user/subscription");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Subscription fetch error:", error);
      toast.error("Error", {
        description: "Failed to load subscription information",
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
      toast.error("Error", {
        description: "Failed to open billing portal",
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
          Failed to load subscription information.
        </AlertDescription>
      </Alert>
    );
  }
  // @ts-expect-error due to types
  const currentPlan = STRIPE_PLANS[subscription.plan] || STRIPE_PLANS.basic;
  const isBasic = subscription.plan === "basic";
  const isPastDue = subscription.status === "past_due";

  return (
    <Card className="bg-white box-shad-every-2 shadow-md">
      <CardContent className="space-y-6">
        <div className="font-poppins">
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information.
          </p>
        </div>

        {isPastDue && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your subscription payment is past due. Please update your payment
              method to continue using premium features.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Plan
                <Badge variant={isBasic ? "secondary" : "default"}>
                  {currentPlan.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                {isBasic
                  ? "Free plan with basic features"
                  : "Premium plan with advanced features"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                €{currentPlan.price}
                {currentPlan.price > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Features included:</h4>
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
                      +{currentPlan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              {isBasic ? (
                <Button onClick={handleUpgrade} className="w-full">
                  Upgrade Plan
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
                      Loading...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Your subscription and payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
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
                      Next billing date
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
                  <span className="text-sm text-muted-foreground">Plan</span>
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
                        Loading...
                      </>
                    ) : (
                      "Update Payment Method"
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
              <CardTitle>Upgrade Your Plan</CardTitle>
              <CardDescription>
                Unlock unlimited features and advanced capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Pro Plan - €19/month</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Unlimited everything</li>
                    <li>• Advanced analytics</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Enterprise Plan - €49/month</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Everything in Pro</li>
                    <li>• White label solution</li>
                    <li>• API access</li>
                  </ul>
                </div>
              </div>
              <Button onClick={handleUpgrade} className="mt-4 h-[44px]">
                View All Plans
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
