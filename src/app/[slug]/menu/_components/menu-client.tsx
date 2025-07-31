"use client";

import { useState } from "react";
import type { Restaurant, MenuCategory, MenuItem, User } from "@prisma/client";
import { MenuHeader } from "./menu-header";
import { CategoryButtons } from "./category-buttons";
import { MenuItems } from "./menu-items";
import { CartDrawer } from "./cart-drawer";
import { useCartStore } from "@/stores/cart-store";
import ResturantHeader from "./resturant-header";
import { Info, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react"
import { ReviewsInfo } from "@/types";
import { GoogleRating } from "../../_components/google-rating";

type RestaurantWithMenu = Restaurant & {
  user: User
  menuCategories: (MenuCategory & {
    items: MenuItem[];
  })[];
};

interface MenuClientProps {
  restaurant: RestaurantWithMenu;
  reviewsInfo: ReviewsInfo
}

export function MenuClient({ restaurant, reviewsInfo }: MenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { getCartItemCount } = useCartStore();
  const cartItemCount = getCartItemCount(restaurant.slug);

  // Get all items or filtered by category
  const getFilteredItems = () => {
    if (selectedCategory === "all") {
      return restaurant.menuCategories.flatMap((category) =>
        category.items.map((item) => ({ ...item, categoryName: category.name }))
      );
    }

    const category = restaurant.menuCategories.find(
      (cat) => cat.id === selectedCategory
    );
    return category
      ? category.items.map((item) => ({ ...item, categoryName: category.name }))
      : [];
  };

  const filteredItems = getFilteredItems();

  const getBackgroundStyle = () => {
    if (restaurant.bg_type === "image" && restaurant.bg_image_url) {
      return {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${restaurant.bg_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }

    if (
      restaurant.bg_type === "gradient" &&
      restaurant.bg_gradient_start &&
      restaurant.bg_gradient_end
    ) {
      const directionMap: Record<string, string> = {
        top: "to top",
        bottom: "to bottom",
        left: "to left",
        right: "to right",
        "top-right": "to top right",
        "top-left": "to top left",
        "bottom-right": "to bottom right",
        "bottom-left": "to bottom left",
      };

      return {
        backgroundImage: `linear-gradient(${directionMap[restaurant.gradient_direction] || "to bottom right"
          }, ${restaurant.bg_gradient_start}, ${restaurant.bg_gradient_end})`,
      };
    }

    return { backgroundColor: restaurant.bg_color || "#ffffff" };
  };

  return (
    <div className="min-h-screen w-full " style={{}}>
      {/* Header */}
      <MenuHeader
        restaurant={restaurant}
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      <div style={getBackgroundStyle()}>
        <ResturantHeader logo={restaurant.logo_url || ""} />
      </div>
      <div className="w-full max-w-[1200px] px-4 mx-auto pb-8 " >
        <div className="flex justify-between py-4 items-center ">
          {/* left  */}
          <div>
            <h4 className="text-2xl font-semibold text-black">{restaurant.name}</h4>
            <div className="mt-3 flex items-start sm:items-center sm:flex-row flex-col justify-start sm:justify-start gap-4 sm:gap-3">
              {restaurant.google_place_id && restaurant?.user?.subscription_plan !== "basic" && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className=""
                >
                  <GoogleRating info={reviewsInfo}
                    color={"#000000"}
                    className="text-black underline font-semibold" />
                </motion.div>
              )}
              {restaurant.address && (
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="h-5 w-5 fill-yellow-400 text-white" />
                  <span className="text-sm" >
                    {restaurant.address}
                  </span>
                </div>
              )}
            </div>

          </div>
          {/* right  */}
          <div>
            <Button variant={"ghost"} className="bg-[#f5f3f1] cursor-pointer hover:bg-gray-200">
              <Info className="text-black size-4" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
        <div className="relative w-full my-2 bg-white rounded-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
          <input
            type="text"
            placeholder={`Search in ${restaurant.name}...`}
            className="w-full h-[54px] pl-12 rounded-full pr-4 py-2 border border-black/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Category Buttons */}
        <CategoryButtons
          categories={restaurant.menuCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          restaurant={restaurant}
        />

        {/* Menu Items */}
        <div className="mx-auto w-full">
          <MenuItems
            restaurant={restaurant}
            items={filteredItems}
            restaurantSlug={restaurant.slug}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Cart Drawer */}
        <CartDrawer
          restaurantSlug={restaurant.slug}
          restaurantName={restaurant.name}
          restaurant={restaurant}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />
      </div>
    </div>
  );
}
