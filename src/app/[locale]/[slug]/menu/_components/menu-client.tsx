"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCartStore } from "@/stores/cart-store";
import { OpeningHoursData, ReviewsInfo, StylesDataType } from "@/types";
import type { MenuCategory, MenuItem, Restaurant, User } from "@prisma/client";
import { Info, MapPin, Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { GoogleRating } from "../../_components/google-rating";
import { OpeningHoursStatus } from "../../_components/opening-hours-status";
import { CartDrawer } from "./cart-drawer";
import { CategoryButtons } from "./category-buttons";
import { MenuHeader } from "./menu-header";
import { MenuItems } from "./menu-items";
import { WelcomePopupMenu } from "./menu-welocome-popup";
import { RestaurantInfoDialog } from "./restaurant-info-dialog";
import RestaurantCustomizer from "./restaurent-customizer";
import ResturantHeader from "./resturant-header";
import RestaurantStatusAlert from "@/components/restaurant-status-alert";
import { useRestaurantStatus } from "@/hooks/useRestaurentStatus";
import { useTranslations } from "next-intl";

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
  const [customBgUrl, setCustomBgUrl] = useState(restaurant.menuPageBackgroundImage)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState("");
  const s = useTranslations("menu_page")
  useEffect(() => {
    // Show welcome popup after component mounts
    const timer = setTimeout(
      () => {
        const dismissed = localStorage.getItem(`menu-popup-${restaurant.slug}`)
        if (!dismissed && restaurant.menu_popup_enabled) {
          setShowWelcomePopup(true)
        }
      },
      (restaurant.menu_popup_delay || 2) * 1000,
    )

    return () => clearTimeout(timer)
  }, [restaurant.slug, restaurant.menu_popup_enabled, restaurant.menu_popup_delay])

  const [stylesData, setStylesData] = useState<StylesDataType>({
    background: {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${customBgUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    // header
    headerBg: restaurant.headerBg,
    headerText: restaurant.headerText,
    headerCartButtonBG: restaurant.headerCartButtonBG,
    headerCartButtonBorder: restaurant.headerCartButtonBorder,
    headerCartButtonCountBG: restaurant.headerCartButtonCountBG,
    headerCartButtonCountBorder: restaurant.headerCartButtonCountBorder,
    // overall
    textColor: restaurant.textColor,
    bgColor: restaurant.bgColor,
    infoIconsColor: restaurant.infoIconsColor,
    // category tabs
    tabsButtonBG: restaurant.tabsButtonBG,
    tabsButtonDefault: restaurant.tabsButtonDefault,
    tabsBorderColor: restaurant.tabsBorderColor,
    tabsTextColor: restaurant.tabsTextColor,
    tabsTextDefaultColor: restaurant.tabsTextDefaultColor,
    // cards
    cardsBG: restaurant.cardsBG,
    cardsText: restaurant.cardsText,
    cardsBadgesBg: restaurant.cardsBadgesBg,
    cardsBadgesTextColor: restaurant.cardsBadgesTextColor,
  })


  const updateStylesData = (key: string, value: string) => {
    if (key === "bg_image_url") {
      setCustomBgUrl(value)
      setStylesData((prev) => ({
        ...prev,
        background: {
          ...prev.background,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${value})`,
        },
      }))
    } else {
      setStylesData((prev) => ({
        ...prev,
        [key]: value,
      }))
    }
  }

  const { getCartItemCount } = useCartStore();
  const cartItemCount = getCartItemCount(restaurant.slug);

  // Get all items or filtered by category
  const getFilteredItems = () => {
    let allItems: (MenuItem & { categoryName: string })[] = [];

    if (selectedCategory === "all") {
      allItems = restaurant.menuCategories.flatMap((category) =>
        category.items.map((item) => ({
          ...item,
          categoryName: category.name,
        }))
      );
    } else {
      const category = restaurant.menuCategories.find(
        (cat) => cat.id === selectedCategory
      );
      allItems = category
        ? category.items.map((item) => ({
          ...item,
          categoryName: category.name,
        }))
        : [];
    }

    if (!searchQuery) return allItems;

    return allItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };




  const filteredItems = getFilteredItems();

  const welcomePopupShowInfo = restaurant.menu_popup_show_info
    ? (restaurant.menu_popup_show_info as { ratings: boolean; address: boolean; hours: boolean; phone: boolean })
    : { ratings: true, address: true, hours: true, phone: true }

  const openingHours = restaurant.opening_hours ? (restaurant.opening_hours as OpeningHoursData) : null

  const status = useRestaurantStatus(openingHours || {
    monday: { open: "", close: "", closed: true },
    tuesday: { open: "", close: "", closed: true },
    wednesday: { open: "", close: "", closed: true },
    thursday: { open: "", close: "", closed: true },
    friday: { open: "", close: "", closed: true },
    saturday: { open: "", close: "", closed: true },
    sunday: { open: "", close: "", closed: true },
  }, restaurant.timezone || "Asia/Karachi")


  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: stylesData.bgColor
      }}>
      {/* Header */}
      <MenuHeader
        restaurant={restaurant}
        stylesData={stylesData}
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />
      {/* JSON Display */}
      {/* Restaurant Customizer Component */}
      <RestaurantCustomizer restaurentID={restaurant.id} restaurentOwnerID={restaurant.user_id} stylesData={stylesData} customBgUrl={customBgUrl || ""} updateStylesData={updateStylesData} />
      <div style={stylesData.background}>
        <ResturantHeader logo={restaurant.logo_url || ""} />
      </div>
      <div className="w-full max-w-[1200px] px-4 mx-auto pb-8 ">
        <div className="flex justify-between py-4 items-center ">
          {/* left  */}
          <div>
            <h4 className="text-2xl font-semibold "
              style={{
                color: stylesData.textColor
              }}>{restaurant.name}</h4>
            <div className="mt-3 flex items-start sm:items-center sm:flex-row flex-col justify-start sm:justify-start gap-4 sm:gap-3">
              {restaurant.google_place_id && restaurant?.user?.subscription_plan !== "basic" && reviewsInfo && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className=""
                >
                  <GoogleRating info={reviewsInfo}
                    color={stylesData.textColor}
                    iconsColor={stylesData.infoIconsColor}
                    underline={true}
                    className="font-semibold" />
                </motion.div>
              )}
              {restaurant.address && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center justify-center gap-1">
                  <MapPin
                    style={{
                      color: stylesData.bgColor,
                      fill: stylesData.infoIconsColor
                    }}
                    className="h-5 w-5" />
                  <span
                    style={{
                      color: stylesData.textColor
                    }}
                    className="text-sm" >
                    {restaurant.address}
                  </span>
                </motion.div>
              )}
              {/* Opening Hours Status */}
              {openingHours && restaurant.timezone && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className=""
                >
                  <OpeningHoursStatus
                    openingHours={openingHours}
                    restaurentTimeZone={restaurant.timezone || ""}
                    color={restaurant.textColor || "#000000"}
                    className=" cursor-pointer text-center"
                    accentColor={restaurant.textColor}
                    onClick={() => { }}
                  />
                </motion.div>
              )}
            </div>

          </div>
          {/* right  */}
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="bg-transparent cursor-pointer hover:bg-transparent p-0">
                  <Info className="size-4" style={{ color: stylesData.textColor }} strokeWidth={2.5} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <RestaurantInfoDialog restaurant={restaurant} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {

          status.isOpen
            ?
            <>
              <RestaurantStatusAlert status={restaurant.status} />
            </>
            :
            null
        }
        <div className="relative w-full my-2 rounded-full"
          style={{
            backgroundColor: stylesData.headerBg
          }}
        >
          <Search
            style={{
              color: stylesData.headerText,
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2  w-5 h-5" />
          <input
            type="text"
            placeholder={s("placeholder", { restaurantName: restaurant.name })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              color: stylesData.headerText,
              borderColor: stylesData.headerCartButtonBorder
            }}
            className="w-full h-[54px] pl-12 rounded-full pr-4 py-2 border shadow-sm focus:outline-none "
          />
        </div>
        {/* Category Buttons */}
        <CategoryButtons
          categories={restaurant.menuCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          stylesData={stylesData}
          restaurant={restaurant}
        />

        {/* Menu Items */}
        <div className="mx-auto w-full">
          <MenuItems
            restaurant={restaurant}
            items={filteredItems}
            stylesData={stylesData}
            searchQuery={searchQuery}
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
        {/* Welcome Popup */}
        <WelcomePopupMenu
          // @ts-expect-error due to types 
          restaurant={restaurant}
          isOpen={showWelcomePopup}
          RatingInfo={reviewsInfo}
          onClose={() => setShowWelcomePopup(false)}
          welcomePopupShowInfo={welcomePopupShowInfo}
        />
      </div>
    </div>
  );
}
