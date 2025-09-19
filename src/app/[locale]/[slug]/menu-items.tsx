"use client";

import type { MenuItem, Restaurant } from "@prisma/client";
import { MenuItemCard } from "./menu-item-card";

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
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        {searchQuery.trim() ? (
          <>
            <h3 className="text-lg font-medium mb-1" style={{ color: restaurant.textColor }}>
              No results found
            </h3>
            <p style={{ color: restaurant.textColor }}>
              We couldn&apos;t find any items matching &quot;{searchQuery}&quot;.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-1" style={{ color: restaurant.textColor }}>
              {selectedCategory === "all"
                ? "No menu items available"
                : "No items in this category"}
            </h3>
            <p style={{ color: restaurant.textColor }}>
              {selectedCategory === "all"
                ? "This restaurant hasn't added any menu items yet."
                : "This category doesn't have any quick menu items yet."}
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
          {selectedCategory === "all" ? "All Items" : items[0]?.categoryName}
        </h2>
        <p
          className="text-sm opacity-80"
          style={{
            color: restaurant.textColor
          }}
        >
          {items.length} item{items.length !== 1 ? "s" : ""} available
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
