"use client";

import type { MenuItem, Restaurant } from "@prisma/client";
import { MenuItemCard } from "./menu-item-card";
import { StylesDataType } from "@/types";

type MenuItemWithCategory = MenuItem & {
  categoryName: string;
};

interface MenuItemsProps {
  items: MenuItemWithCategory[];
  restaurantSlug: string;
  selectedCategory: string;
  stylesData: StylesDataType;
  restaurant: Restaurant;
}

export function MenuItems({
  items,
  restaurantSlug,
  restaurant,
  stylesData,
  selectedCategory,
}: MenuItemsProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium  mb-2" style={{
          color: stylesData.textColor
        }}>
          {selectedCategory === "all"
            ? "No menu items available"
            : "No items in this category"}
        </h3>
        <p className="" style={{
          color: stylesData.textColor
        }}>
          {selectedCategory === "all"
            ? "This restaurant hasn't added any menu items yet."
            : "This category doesn't have any menu items yet."}
        </p>
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
          {selectedCategory === "all" ? "All Items" : items[0]?.categoryName}
        </h2>
        <p
          className="text-sm opacity-80"
          style={{
            color: stylesData.textColor
          }}
        >
          {items.length} item{items.length !== 1 ? "s" : ""} available
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
