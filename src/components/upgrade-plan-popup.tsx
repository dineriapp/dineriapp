"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuthCheck } from "@/hooks/use-auth-check";
import { STRIPE_PLANS, StripePlan } from "@/lib/stripe-plans";
import { useUserStore } from "@/stores/auth-store";
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store";
import { CheckIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const UpgradePopup = () => {
  const { isOpen, message, close } = useUpgradePopupStore();
  const [loading, setLoading] = useState<StripePlan | null>(null);
  const router = useRouter();
  const isAuthenticated = useAuthCheck();
  const { prismaUser } = useUserStore();

  const handleSubscribe = async (plan: StripePlan) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (plan === "basic") {
      router.push("/dashboard");
      return;
    }

    setLoading(plan);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      toast("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to start subscription process",
      });
    } finally {
      setLoading(null);
    }
  };
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-2xl p-0 border-0 bg-transparent">
        <Card className="bg-white dark:bg-gray-900 gap-2 rounded-xl shadow-2xl overflow-hidden">
          <DialogHeader className="px-6 pb-0 pt-0">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-main-blue">
                Upgrade Your Plan
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="px-6 pb-2">
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>

          <Separator />

          <div className="px-6 py-3 max-h-[60dvh] sm:max-h-[70dvh] overflow-auto">
            <div
              className={
                prismaUser?.subscription_plan === "pro"
                  ? "grid grid-cols-1 md:grid-cols-1 gap-6"
                  : "grid grid-cols-1 md:grid-cols-2 gap-6"
              }
            >
              {Object.entries(STRIPE_PLANS).map(([key, plan]) => {
                if (key === "basic") return null;
                const planKey = key as StripePlan;
                const isPopular = planKey === "pro";
                const isLoading = loading === planKey;
                if (
                  prismaUser?.subscription_plan === "pro" &&
                  (key as StripePlan) === "pro"
                )
                  return null;
                return (
                  <Card
                    key={key}
                    className="border border-gray-200 gap-0 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold">
                            {plan.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            €{plan.price}/month
                          </CardDescription>
                        </div>
                        {isPopular && (
                          <span className="bg-main-green text-white text-xs font-semibold px-3 py-1 rounded-full">
                            POPULAR
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <ul className="space-y-3">
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <div className="bg-teal-500/10 p-1 rounded-full mr-3">
                              <CheckIcon className="h-4 w-4 text-main-green" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="flex items-start text-sm text-gray-500 ml-7 mt-1">
                            +{plan.features.length - 4} more
                          </li>
                        )}
                      </ul>
                    </CardContent>

                    <CardFooter>
                      <Button
                        size="lg"
                        className={`w-full cursor-pointer !h-[44px] ${isPopular
                          ? "bg-main-green rounded-full hover:bg-main-green/70 font-poppins "
                          : "bg-main-blue rounded-full font-poppins hover:bg-main-blue/70"
                          }`}
                        onClick={() => handleSubscribe(planKey)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {planKey === "basic"
                              ? "Get Started Free"
                              : `Subscribe to ${plan.name}`}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={close}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                May be later
              </Button>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
