"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MenuItem, Restaurant } from "@prisma/client";
import { isAfter, isBefore, parse } from "date-fns";
import { useTranslations } from "next-intl";

interface MenuItemCardProps {
  item: MenuItem;
  restaurant: Restaurant;
}

type OpeningHours = {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
};

export function isRestaurantOpenNow(openingHours: OpeningHours): boolean {

  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const now = new Date();
  const currentDay = daysOfWeek[now.getDay()];
  const todayHours = openingHours[currentDay];

  if (!todayHours || todayHours.closed) return false;

  // Parse times in same day context
  const openTime = parse(todayHours.open, "hh:mm a", now);
  const closeTime = parse(todayHours.close, "hh:mm a", now);

  return isAfter(now, openTime) && isBefore(now, closeTime);
}

export function MenuItemCard({
  item,
  restaurant,
}: MenuItemCardProps) {
  const m = useTranslations("menu_dialog.menu_item_card")

  return (
    <Card
      style={{
        backgroundColor: restaurant.cardsBG,
        borderColor: restaurant.accent_color || "black",
      }}
      className="overflow-hidden w-full gap-0 !pt-0 !pb-0 hover:shadow-lg border-none transition-all duration-200 h-full flex flex-col"
    >
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with name and price */}
        <div className="flex justify-between">
          <div className="flex justify-between items-start">
            <h3
              style={{
                color: restaurant.cardsText,
              }}
              className="font-semibold line-clamp-2 text-base leading-tight flex-1 mr-2"
            >
              {item.name}
            </h3>
          </div>
        </div>
        <h4>
          <span
            style={{
              color: restaurant.cardsText,
            }}
            className="font-bold text-lg text-black  whitespace-nowrap"
          >
            €{item.price.toFixed(2)}
          </span>
        </h4>

        {/* Description */}
        {item.description && (
          <p
            style={{
              color: restaurant.cardsText,
            }}
            className=" text-sm mb-3 opacity-80 line-clamp-3 flex-1"
          >
            {item.description}
          </p>
        )}

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {item.allergens.slice(0, 3).map((allergen) => (
                <Badge
                  style={{
                    color: restaurant.cardsBadgesTextColor,
                    backgroundColor: restaurant.cardsBadgesBg
                  }}
                  key={allergen}
                  variant="secondary"
                  className="text-xs"
                >
                  {allergen}
                </Badge>
              ))}
              {item.allergens.length > 3 && (
                <Badge
                  style={{
                    color: restaurant.cardsBadgesTextColor,
                    backgroundColor: restaurant.cardsBadgesBg
                  }}
                  variant="secondary"
                  className="text-xs"
                >
                  {m("allergens_more", { count: item.allergens.length - 3 })}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Allergen info */}
        {item.allergen_info && (
          <p
            style={{
              color: restaurant.cardsBadgesTextColor,
              backgroundColor: restaurant.cardsBadgesBg
            }}
            className="text-xs italic w-fit px-2 py-0.5 mb-3 line-clamp-2"
          >
            {item.allergen_info}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
