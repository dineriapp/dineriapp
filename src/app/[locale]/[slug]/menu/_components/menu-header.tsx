"use client";

import { Button } from "@/components/ui/button";
import { StylesDataType } from "@/types";
import type { Restaurant } from "@prisma/client";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";;

interface MenuHeaderProps {
  restaurant: Restaurant;
  stylesData: StylesDataType;
  cartItemCount: number;
  onCartClick: () => void;
}

export function MenuHeader({
  restaurant,
  cartItemCount,
  stylesData,
  onCartClick,
}: MenuHeaderProps) {
  const t = useTranslations("slug_page")
  return (
    <>

      <div
        style={{
          backgroundColor: stylesData.headerBg,
        }}
        className=" sticky top-0 z-40 shadow-sm"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Restaurant info */}
            <div className="flex items-center space-x-4">
              <Link href={`/${restaurant.slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 cursor-pointer hover:bg-transparent"
                >
                  <ArrowLeft
                    style={{
                      color: stylesData.headerText,
                    }}
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
                    style={{
                      color: stylesData.headerText,
                    }}
                    className="text-lg !leading-[1] font-bold text-gray-900 line-clamp-1"
                  >
                    {restaurant.name}
                  </h1>
                  <p
                    style={{
                      color: stylesData.headerText,
                    }}
                    className="text-sm opacity-80 !leading-[1]"
                  >
                    {t("menu")}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Cart button */}
            <Button
              style={{
                backgroundColor: stylesData.headerCartButtonBG,
                color: stylesData.headerText,
                borderColor: stylesData.headerCartButtonBorder || "white",
              }}
              onClick={onCartClick}
              variant="outline"
              className="relative cursor-pointer"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              {/* Cart */}
              {cartItemCount > 0 && (
                <span
                  style={{
                    backgroundColor: stylesData.headerCartButtonCountBG,
                    color: stylesData.headerText,
                    borderColor: stylesData.headerCartButtonCountBorder || "white",
                  }}
                  className="absolute bg-white -top-2 -right-2 border text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]"
                >
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
