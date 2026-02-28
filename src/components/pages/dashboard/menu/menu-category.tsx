import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MenuCategory as MenuItemType, MenuItem } from "@prisma/client";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit,
  Leaf,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface Addon {
  name: string;
  price: number;
}

export type MenuCategoryWithItems = MenuItemType & {
  items: MenuItem[];
};

interface MenuCategoryProps {
  category: MenuCategoryWithItems;
  selectedRestaurant: { name: string };
  setSelectedCategory: (category: MenuCategoryWithItems) => void;
  setSelectedItem: (item: MenuItem | null) => void;
  setNewItemName: (name: string) => void;
  setNewItemDescription: (desc: string) => void;
  setNewItemPrice: (price: string) => void;
  setAllergens: (allergens: string[]) => void;
  setIsHalal: (val: boolean) => void;
  setAllergenInfo: (info: string) => void;
  setAddons: (addons: Addon[]) => void;
  setNewItemshow_in_quick_menu: (val: boolean) => void;
  setIsEditItemDialogOpen: (val: boolean) => void;
  setIsAddItemDialogOpen: (val: boolean) => void;
  deleteItemMutation: any;
  reorderItemMutation: any;
}

const MenuCategory: React.FC<MenuCategoryProps> = ({
  category,
  selectedRestaurant,
  setSelectedCategory,
  setSelectedItem,
  setNewItemName,
  setNewItemDescription,
  setNewItemPrice,
  setAllergens,
  setIsHalal,
  setAllergenInfo,
  setAddons,
  setNewItemshow_in_quick_menu,
  setIsEditItemDialogOpen,
  setIsAddItemDialogOpen,
  deleteItemMutation,
  reorderItemMutation,
}) => {
  const t = useTranslations("MenuPage");

  return (
    <>
      {category.items && category.items.length > 0 ? (
        <div className="space-y-3">
          {category.items.map((item, itemIndex) => {
            const parsedAddons = Array.isArray(item.addons)
              ? (item.addons as { name: string; price: number }[])
              : [];
            return (
              <div
                key={item.id}
                className="flex max-md:flex-col  items-center gap-3 rounded-lg border bg-white/80 p-4 backdrop-blur-sm transition-all hover:shadow-md hover:bg-white/90"
              >
                <div className="min-w-0 flex-grow max-md:w-full ">
                  <div className="flex items-center gap-2 mb-1 max-md:justify-between">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.is_halal && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                        title="Halal certified"
                      >
                        <Leaf className="h-3 w-3" />
                        {t("halalBadge")}
                      </span>
                    )}
                    {item.show_in_quick_menu && (
                      <Badge className="bg-primary text-white">
                        {t("quickMenuBadge")}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-500 mb-2">
                      {item.description}
                    </p>
                  )}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                        title={`Contains allergens`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {t("allergensBadge")}
                      </span>
                    </div>
                  )}
                  {/* Addons */}
                  {item.addons && parsedAddons.length > 0 && (
                    <div>
                      <h3 className="text-xs mt-2 font-medium mb-1">
                        {t("availableAddons")}
                      </h3>
                      <ul className="list-disc list-inside text-xs text-gray-700">
                        {parsedAddons.map((addon, index) => (
                          <li key={index}>
                            {addon?.name} — €{addon?.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 font-bold text-lg text-teal-600">
                  €{item.price.toFixed(2)}
                </div>

                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedItem(item);
                      setNewItemName(item.name);
                      setNewItemDescription(item.description || "");
                      setNewItemPrice(item.price.toString());
                      setAllergens(item.allergens || []);
                      setIsHalal(item.is_halal || false);
                      setAllergenInfo(item.allergen_info || "");
                      setIsEditItemDialogOpen(true);
                      setAddons(parsedAddons);
                      setNewItemshow_in_quick_menu(
                        item?.show_in_quick_menu ? true : false,
                      );
                    }}
                    className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">{t("editItemButton")}</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                        disabled={deleteItemMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("deleteItemButton")}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("deleteDialog.title")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("deleteDialog.description", {
                            itemName: item.name,
                            restaurantName: selectedRestaurant.name,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-poppins rounded-full !px-5">
                          {t("deleteDialog.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                        >
                          {t("deleteDialog.confirm")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      reorderItemMutation.mutate({
                        itemId: item.id,
                        direction: "up",
                      })
                    }
                    disabled={itemIndex === 0 || reorderItemMutation.isPending}
                    className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">{t("moveUpButton")}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      reorderItemMutation.mutate({
                        itemId: item.id,
                        direction: "down",
                      })
                    }
                    disabled={
                      itemIndex === (category.items?.length || 0) - 1 ||
                      reorderItemMutation.isPending
                    }
                    className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                  >
                    <ArrowDown className="h-4 w-4" />
                    <span className="sr-only">{t("moveDownButton")}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-slate-500 mb-4">{t("noItemsMessage")}</p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory(category);
              setSelectedItem(null);
              setNewItemName("");
              setNewItemDescription("");
              setNewItemPrice("");
              setAllergens([]);
              setIsHalal(false);
              setAllergenInfo("");
              setAddons([]);
              setNewItemshow_in_quick_menu(true);
              setIsAddItemDialogOpen(true);
            }}
            className="flex items-center gap-2 cursor-pointer text-white hover:text-white hover:opacity-75 !bg-main-green rounded-full !px-5 font-poppins h-[42px] mx-auto"
          >
            <Plus className="h-4 w-4" />
            {t("addFirstItem")}
          </Button>
        </div>
      )}
    </>
  );
};

export default MenuCategory;
