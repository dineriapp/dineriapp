import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SettingsState } from "../../(dashboard)/dashboard/(with-restaurant-only)/(only-pro-plan)/reservations/_components/settings/types";
import ReservationClientSide from "./reservation-client-side";

interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

async function getRestaurant(slug: string) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        reservation_settings: true,
        Reservation_policy: true,
      },
    });

    return restaurant;
  } catch (error) {
    console.error("Error fetching restaurant :", error);
    return null;
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  const user = await prisma.user.findFirst({
    where: { id: restaurant.user_id },
    select: { subscription_plan: true },
  })


  if (!user) {
    notFound();
  }

  const settings = restaurant?.reservation_settings
    ?.settings as unknown as SettingsState;

  return (
    <div className="min-h-screen bg-gray-50">
      <ReservationClientSide
        userSubscriptionPlan={user?.subscription_plan}
        restaurant={{
          ...restaurant,
          reservation_settings: {
            ...restaurant.reservation_settings,
            settings,
          },
          Reservation_policy: restaurant.Reservation_policy,
        }}
      />
    </div>
  );
}

export async function generateMetadata({ params }: MenuPageProps) {
  const t = await getTranslations("makeAReservation");
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) {
    return {
      title: t("notFoundTitle"),
    };
  }
  return {
    title: t("reservationTitle", {
      restaurantName: restaurant.name,
    }),
    description: t("reservationDescription", {
      restaurantName: restaurant.name,
      bio: restaurant.bio || "",
    }),
  };
}
