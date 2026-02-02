"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Restaurant } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { ReservationDialog } from "./_components/reservation-query-dialog";
import { useTranslations } from "next-intl";

interface ReservationHeaderProps {
  restaurant: Restaurant;
  plan: "basic" | "pro" | "enterprise";
}

export function ReservationHeader({
  restaurant,
  plan,
}: ReservationHeaderProps) {
  const t = useTranslations("makeAReservation.reservationHeader");

  return (
    <div
      className="sticky bg-white top-0 z-40 shadow-sm w-full"
    >
      <div className="w-full px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Restaurant info */}
          <div className="flex items-center space-x-4">
            <Link href={`/${restaurant.slug}`}>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 cursor-pointer"
              >
                <ArrowLeft
                  className="h-4 w-4"
                />
              </Button>
            </Link>

            <div className="flex items-center space-x-3">
              {restaurant.logo_url && (
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={restaurant.logo_url || "/placeholder.svg"}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-1">
                <h1
                  className="text-lg !leading-[1] font-bold text-gray-900 line-clamp-1"
                >
                  {restaurant.name}
                </h1>
                <p
                  className="text-sm opacity-80 !leading-[1]"
                >
                  {t("subtitle")}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Drop Query */}
          {plan !== "basic" && <Button
            variant="outline"
            className="relative cursor-pointer"
            size="sm"
          >
            <ReservationDialog
              restaurantId={restaurant.id}
              timezone={restaurant.timezone || ""}
            >
              <button className="w-full leading-[1] h-full cursor-pointer">
                {t("dropQuery")}
              </button>
            </ReservationDialog>
          </Button>}
        </div>
      </div>
    </div>
  );
}
