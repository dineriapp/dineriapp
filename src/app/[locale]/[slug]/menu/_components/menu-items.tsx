"use client";

import type { MenuItem, Restaurant } from "@prisma/client";
import { MenuItemCard } from "./menu-item-card";
import { StylesDataType } from "@/types";
import { useTranslations } from "next-intl";

type MenuItemWithCategory = MenuItem & {
  categoryName: string;
};

interface MenuItemsProps {
  items: MenuItemWithCategory[];
  restaurantSlug: string;
  searchQuery: string;
  selectedCategory: string;
  stylesData: StylesDataType;
  restaurant: Restaurant;
}

export function MenuItems({
  items,
  restaurantSlug,
  restaurant,
  searchQuery,
  stylesData,
  selectedCategory,
}: MenuItemsProps) {

  const t = useTranslations("menu_items_menu_page")

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery.trim() ? (
          <>
            <h3 className="text-lg font-medium mb-1" style={{ color: stylesData.textColor }}>
              {t("no_results_title")}
            </h3>
            <p style={{ color: stylesData.textColor }}>
              {t("no_results_message", { searchQuery })}
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-2" style={{ color: stylesData.textColor }}>
              {selectedCategory === "all"
                ? t("no_items_all_title")
                : t("no_items_category_title")}
            </h3>
            <p style={{ color: stylesData.textColor }}>
              {selectedCategory === "all"
                ? t("no_items_all_message")
                : t("no_items_category_message")}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2
          className="text-xl font-semibold"
          style={{
            color: stylesData.textColor
          }}
        >
          {selectedCategory === "all" ? t("section_title_all") : items[0]?.categoryName}
        </h2>
        <p
          className="text-sm opacity-80"
          style={{
            color: stylesData.textColor
          }}
        >

          {
            items.length !== 1 ?
              <>
                {t("items_available_plural", { count: items.length })}
              </>
              :
              <>
                {t("items_available_singular", { count: items.length })}
              </>
          }
        </p>
      </div>

      <div className="flex flex-col  w-full gap-6">
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-6"> */}
        {items.map((item) => (
          <MenuItemCard
            restaurant={restaurant}
            key={item.id}
            stylesData={stylesData}
            item={item}
            categoryName={item.categoryName}
            restaurantSlug={restaurantSlug}
          />
        ))}
      </div>
    </div>
  );
}
