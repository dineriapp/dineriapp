// import prisma from "@/lib/prisma"
// import { notFound } from "next/navigation"
// import ReservationClientSide from "./reservation-client-side"
// import { SettingsState } from "../../(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types"

// interface MenuPageProps {
//     params: Promise<{ slug: string }>
// }

// async function getRestaurant(slug: string) {
//     try {
//         const restaurant = await prisma.restaurant.findUnique({
//             where: { slug },
//             include: {
//                 reservation_settings: true,
//                 Reservation_policy: true
//             },
//         })

//         return restaurant
//     } catch (error) {
//         console.error("Error fetching restaurant :", error)
//         return null
//     }
// }

// export default async function MenuPage({ params }: MenuPageProps) {
//     const { slug } = await params
//     const restaurant = await getRestaurant(slug)

//     if (!restaurant) {
//         notFound()
//     }

//     const settings = restaurant?.reservation_settings?.settings as unknown as SettingsState;

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <ReservationClientSide
//                 restaurant={
//                     {
//                         ...restaurant,
//                         reservation_settings: {
//                             ...restaurant.reservation_settings,
//                             settings
//                         },
//                         Reservation_policy: restaurant.Reservation_policy
//                     }
//                 }
//             />
//         </div>
//     )
// }

// export async function generateMetadata({ params }: MenuPageProps) {
//     const { slug } = await params
//     const restaurant = await getRestaurant(slug)

//     if (!restaurant) {
//         return {
//             title: "Reservation or Restaurent Not Found",
//         }
//     }

//     return {
//         title: `${restaurant.name} - Reservation`,
//         description: `Reservations at ${restaurant.name}. ${restaurant.bio || ""}`,
//     }
// }

//New Code

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReservationClientSide from "./reservation-client-side";
import { SettingsState } from "../../(dashboard)/dashboard/(with-restaurant-only)/reservations/_components/settings/types";
import { getTranslations } from "next-intl/server";

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

  const settings = restaurant?.reservation_settings
    ?.settings as unknown as SettingsState;

  return (
    <div className="min-h-screen bg-gray-50">
      <ReservationClientSide
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
