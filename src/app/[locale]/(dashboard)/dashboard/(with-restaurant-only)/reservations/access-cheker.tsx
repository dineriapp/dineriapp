"use client"
import { useRestaurantStore } from "@/stores/restaurant-store";
import { User as PrismaUserType, } from "@prisma/client";
import ReservationsPage from "./page-client";
import { Link } from "@/i18n/navigation";
import UpgradeBtn from "@/components/upgrade-btn";
import LoadingUI from "@/components/loading-ui";

interface AccessCheckerProps {
    prismaUser: PrismaUserType;
}

export default function AccessChecker({ prismaUser }: AccessCheckerProps) {
    const { selectedRestaurant: restaurant } = useRestaurantStore();

    const hasStripeKeys = Boolean(
        restaurant?.stripe_public_key_encrypted && restaurant?.stripe_secret_key_encrypted
    );

    const isProPlan = prismaUser?.subscription_plan !== "basic";

    const isAuthorized = hasStripeKeys && isProPlan;

    if (isAuthorized) {
        return <ReservationsPage />;
    }

    if (!restaurant) {
        return <LoadingUI text="Loading..." />
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
            {!hasStripeKeys && (
                <div className="bg-white border flex flex-col items-center justify-center border-red-300 shadow-sm rounded-xl p-5 w-full max-w-md">
                    <div className="flex items-center justify-center mb-2 text-red-600 text-2xl">
                        ⚠️
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Stripe Not Connected
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Your restaurant needs to connect Stripe to accept online payments for reservations.
                    </p>
                    <Link
                        href={"/dashboard/settings/stripe"}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                        Connect Stripe
                    </Link>
                </div>
            )}

            {!isProPlan && (
                <div className="bg-white border border-yellow-300 flex flex-col items-center justify-center shadow-sm rounded-xl p-5 w-full max-w-md">
                    <div className="flex items-center justify-center mb-2 text-yellow-500 text-2xl">
                        🚀
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Upgrade Required
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        You need to upgrade to the <span className="font-semibold">Pro Plan</span> to access the reservation system.
                    </p>
                    <div className="mt-2">
                        <UpgradeBtn />
                    </div>
                </div>
            )}
        </div>

    );
}
