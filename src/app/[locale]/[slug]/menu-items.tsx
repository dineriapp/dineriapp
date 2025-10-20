"use client";

import type { MenuItem, Restaurant } from "@prisma/client";
import { MenuItemCard } from "./menu-item-card";
import { useTranslations } from "next-intl";

type MenuItemWithCategory = MenuItem & {
  categoryName: string;
};

interface MenuItemsProps {
  items: MenuItemWithCategory[];
  restaurantSlug: string;
  searchQuery: string;
  selectedCategory: string;
  restaurant: Restaurant;
}

export function MenuItems({
  items,
  restaurant,
  searchQuery,
  selectedCategory,
}: MenuItemsProps) {
  const m = useTranslations("menu_dialog")

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery.trim() ? (
          <>
            <h3 className="text-lg font-medium mb-1" style={{ color: restaurant.textColor }}>
              {m("no_results_title")}
            </h3>
            <p style={{ color: restaurant.textColor }}>
              {m("no_results_message", { searchQuery })}
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-1" style={{ color: restaurant.textColor }}>
              {selectedCategory === "all"
                ? m("no_items_all_title")
                : m("no_items_category_title")}
            </h3>
            <p style={{ color: restaurant.textColor }}>
              {selectedCategory === "all"
                ? m("no_items_all_message")
                : m("no_items_category_message")}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2
          className="text-xl font-semibold"
          style={{
            color: restaurant.textColor
          }}
        >
          {selectedCategory === "all" ? m("menu_items.section_title_all") : items[0]?.categoryName}
        </h2>
        <p
          className="text-sm opacity-80"
          style={{
            color: restaurant.textColor
          }}
        >

          {
            items.length === 1
              ?
              <>
                {m("menu_items.items_available_singular", { count: items.length })}
              </>
              :
              <>
                {m("menu_items.items_available_plural", { count: items.length })}

              </>
          }
        </p>
      </div>

      <div className="flex flex-col  w-full gap-3">
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-6"> */}
        {items.map((item) => (
          <MenuItemCard
            restaurant={restaurant}
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}
