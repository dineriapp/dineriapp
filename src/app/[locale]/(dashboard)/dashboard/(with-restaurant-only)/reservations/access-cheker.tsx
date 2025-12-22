"use client"
import LoadingUI from "@/components/loading-ui";
import UpgradeBtn from "@/components/upgrade-btn";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { useRestaurantStore } from "@/stores/restaurant-store";
import ReservationsPage from "./page-client";
import { useTranslations } from "next-intl";

export default function AccessChecker() {
    const { selectedRestaurant: restaurant } = useRestaurantStore();
    const t = useTranslations("accessChecker")
    const { data: session } = useSession()
    const hasStripeKeys = Boolean(
        restaurant?.stripe_public_key_encrypted && restaurant?.stripe_secret_key_encrypted
    );

    const isProPlan = session?.user?.subscription_plan !== "basic";

    const isAuthorized = hasStripeKeys && isProPlan;

    if (isAuthorized) {
        return <ReservationsPage />;
    }

    if (!restaurant) {
        return <LoadingUI text={t("loading")} />
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
            {!hasStripeKeys && (
                <div className="bg-white border flex flex-col items-center justify-center border-red-300 shadow-sm rounded-xl p-5 w-full max-w-md">
                    <div className="flex items-center justify-center mb-2 text-red-600 text-2xl">
                        ⚠️
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        {t("stripe.title")}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {t("stripe.description")}
                    </p>
                    <Link
                        href={"/dashboard/settings/stripe"}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                        {t("stripe.button")}
                    </Link>
                </div>
            )}

            {!isProPlan && (
                <div className="bg-white border border-yellow-300 flex flex-col items-center justify-center shadow-sm rounded-xl p-5 w-full max-w-md">
                    <div className="flex items-center justify-center mb-2 text-yellow-500 text-2xl">
                        🚀
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        {t("upgrade.title")}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {t("upgrade.description")}

                    </p>
                    <div className="mt-2">
                        <UpgradeBtn />
                    </div>
                </div>
            )}
        </div>

    );
}
