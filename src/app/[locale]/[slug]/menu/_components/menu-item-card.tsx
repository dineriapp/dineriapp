"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurantStatus } from "@/hooks/useRestaurentStatus";
import { useCartStore } from "@/stores/cart-store";
import { OpeningHoursData, StylesDataType } from "@/types";
import type { MenuItem, Restaurant } from "@prisma/client";
import { isAfter, isBefore, parse } from "date-fns";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddonSelectorDialog } from "./addon-selector-dialog";
import { useTranslations } from "next-intl";

interface MenuItemCardProps {
  item: MenuItem;
  categoryName: string;
  restaurantSlug: string;
  restaurant: Restaurant;
  stylesData: StylesDataType
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
  categoryName,
  restaurant,
  restaurantSlug,
  stylesData
}: MenuItemCardProps) {
  const { addItem } = useCartStore();
  const t = useTranslations("menu_item_card_menu_page")

  const openingHours = restaurant.opening_hours ? (restaurant.opening_hours as OpeningHoursData) : {
    monday: { open: "", close: "", closed: true },
    tuesday: { open: "", close: "", closed: true },
    wednesday: { open: "", close: "", closed: true },
    thursday: { open: "", close: "", closed: true },
    friday: { open: "", close: "", closed: true },
    saturday: { open: "", close: "", closed: true },
    sunday: { open: "", close: "", closed: true },
  }
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);

  const status = useRestaurantStatus(openingHours, restaurant.timezone || "Asia/Karachi")

  const handleConfirmAddons = (selectedAddons: { name: string; price: number }[]) => {
    // const totalAddonPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);

    addItem(restaurantSlug, {
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      price: item.price,
      image_url: item.image || "",
      category: categoryName,
      allergens: item.allergens,
      is_halal: item.is_halal || undefined,
      addons: selectedAddons,
      cartItemId: crypto.randomUUID()
    });

    toast.success(t("add_to_cart_success_title"), {
      description: t("add_to_cart_success_description"),
    });
  };

  const handleAddToCart = () => {
    if (!status?.isOpen) {
      toast.error(t("restaurant_closed_title"), {
        description: status?.nextOpeningDay
          ? t("restaurant_closed_next_opening", { day: status.nextOpeningDay, time: status.openingTime || "" })
          : t("restaurant_closed_description"),
      });
      return;
    }

    const hasAddons = Array.isArray(item.addons) && item.addons.length > 0;

    if (hasAddons) {
      setAddonDialogOpen(true);
    } else {
      handleConfirmAddons([]);
    }
  };

  return (

    <Card
      style={{
        backgroundColor: stylesData.cardsBG,
        borderColor: restaurant.accent_color || "black",
      }}
      className="overflow-hidden w-full gap-0 !pt-0 !pb-0 hover:shadow-lg border-none transition-all duration-200 h-full flex flex-col"
    >
      <AddonSelectorDialog
        isOpen={addonDialogOpen}
        onClose={() => setAddonDialogOpen(false)}
        itemName={item.name}
        addons={(item.addons as { name: string; price: number }[]) || []}
        onConfirm={handleConfirmAddons}
      />
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Header with name and price */}
        <div className="flex items-end justify-between">
          <div className="flex justify-between items-start">
            <h3
              style={{
                color: stylesData.cardsText,
              }}
              className="font-semibold line-clamp-2 text-base leading-tight flex-1 mr-2"
            >
              {item.name}
            </h3>
          </div>
          <div className="">
            <Button
              style={{
                color: stylesData.tabsTextColor,
                backgroundColor: stylesData.tabsButtonBG,
              }}
              onClick={handleAddToCart}
              className="w-full cursor-pointer"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              {/* Add to Cart */}
            </Button>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p
            style={{
              color: stylesData.cardsText,
            }}
            className=" text-sm mb-1 mt-1 opacity-80 line-clamp-3 flex-1"
          >
            {item.description}
          </p>
        )}
        <h4 className="mb-3">
          <span
            style={{
              color: stylesData.cardsText,
            }}
            className="font-bold  text-lg text-black  whitespace-nowrap"
          >
            €{item.price.toFixed(2)}
          </span>
        </h4>


        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {item.allergens.slice(0, 3).map((allergen) => (
                <Badge
                  style={{
                    color: stylesData.cardsBadgesTextColor,
                    backgroundColor: stylesData.cardsBadgesBg
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
                    color: stylesData.cardsBadgesTextColor,
                    backgroundColor: stylesData.cardsBadgesBg
                  }}
                  variant="secondary"
                  className="text-xs"
                >
                  {t("allergens_more", { count: item.allergens.length - 3 })}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Allergen info */}
        {item.allergen_info && (
          <p
            style={{
              color: stylesData.cardsBadgesTextColor,
              backgroundColor: stylesData.cardsBadgesBg
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
