"use client";

import type { Restaurant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { isRestaurantOpenNow } from "./menu-item-card";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StylesDataType } from "@/types";

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
  const openingHours = (() => {
    if (!restaurant.opening_hours) return null;
    if (typeof restaurant.opening_hours === "string") {
      try {
        return JSON.parse(restaurant.opening_hours);
      } catch {
        return null;
      }
    }
    return restaurant.opening_hours;
  })();

  const isOpen = openingHours ? isRestaurantOpenNow(openingHours) : false;

  const [showClosedDialog, setShowClosedDialog] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowClosedDialog(true);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={showClosedDialog} onOpenChange={setShowClosedDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>We&apos;re currently closed</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {restaurant.name} is currently closed. Please come back during our
            opening hours.
          </p>
          <div className="mt-4 text-right">
            <Button onClick={() => setShowClosedDialog(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
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
                    Menu
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
