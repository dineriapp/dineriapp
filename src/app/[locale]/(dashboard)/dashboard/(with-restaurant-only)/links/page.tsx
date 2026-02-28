"use client";

import type React from "react";

import LoadingUI from "@/components/loading-ui";
import EditLinkDialog from "@/components/pages/dashboard/links/edit-link-dialog";
import LinkDialog from "@/components/pages/dashboard/links/link-add-dialog";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/lib/auth/auth-client";
import { getLucideIconBySlug, type IconSlug } from "@/lib/get-icons";
import {
  useBulkDeleteLinks,
  useCreateLink,
  useDeleteLink,
  useLinks,
  useReorderLink,
  useUpdateLink,
} from "@/lib/link-queries";
import { getStripePlans, isLimitReached } from "@/lib/stripe-plans";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store";
import { SubscriptionPlan } from "@prisma/client";
import { ArrowDown, ArrowUp, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function LinksPage() {
  const { restaurants, selectedRestaurant } = useRestaurantStore();
  const { data: session } = useSession();
  const locale = useLocale();
  const openPopup = useUpgradePopupStore((state) => state.open);
  const t = useTranslations("LinksPage");
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingLink, setEditingLink] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<IconSlug>("link");

  const restaurantId = selectedRestaurant?.id;

  const { data: links = [], isLoading, error } = useLinks(restaurantId);
  const createMutation = useCreateLink(restaurantId);
  const updateMutation = useUpdateLink(restaurantId);
  const deleteMutation = useDeleteLink(restaurantId);
  const bulkDeleteMutation = useBulkDeleteLinks(restaurantId);
  const reorderMutation = useReorderLink(restaurantId);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim() || !restaurantId || !selectedIcon)
      return;

    setIsAddDialogOpen(false);
    setNewTitle("");
    setNewUrl("");

    createMutation.mutate({
      title: newTitle.trim(),
      url: newUrl.trim(),
      iconSlug: selectedIcon,
    });
  };

  const handleUpdateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink || !newTitle.trim() || !newUrl.trim() || !selectedIcon)
      return;

    setIsEditDialogOpen(false);
    setEditingLink(null);
    setNewTitle("");
    setNewUrl("");

    updateMutation.mutate({
      id: editingLink.id,
      title: newTitle.trim(),
      url: newUrl.trim(),
      iconSlug: selectedIcon,
    });
  };

  const handleEditClick = (link: any) => {
    setEditingLink(link);
    setSelectedIcon(link?.icon_slug);
    setNewTitle(link.title);
    setNewUrl(link.url);
    setIsEditDialogOpen(true);
  };

  const toggleLinkSelection = (linkId: string) => {
    const newSelection = new Set(selectedLinks);
    if (newSelection.has(linkId)) {
      newSelection.delete(linkId);
    } else {
      newSelection.add(linkId);
    }
    setSelectedLinks(newSelection);
  };

  const toggleAllLinks = () => {
    if (selectedLinks.size === links.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(links.map((link) => link.id)));
    }
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedLinks), {});
    setSelectedLinks(new Set());
    setIsDeleteDialogOpen(false);
  };

  if (restaurants.length === 0 || !selectedRestaurant || isLoading) {
    return <LoadingUI text={t("loadingText")} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            {t("errorTitle")}
          </h2>
          <p className="text-slate-500">
            {t("errorMessage", { restaurantName: selectedRestaurant.name })}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  const isLinkLimitReached = isLimitReached({
    userPlan: session?.user?.subscription_plan as SubscriptionPlan,
    resourceType: "links",
    currentCount: links.length,
  });

  return (
    <>
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className=" text-4xl font-bold text-main-blue">{t("title")}</h1>
            <p className="mt-2 text-slate-500">
              {t("subtitle")}{" "}
              <span className="font-medium text-main-green">
                {selectedRestaurant.name}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedLinks.size > 0 && (
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="lg"
                    disabled={bulkDeleteMutation.isPending}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-red-500 rounded-full !px-5 font-poppins h-[42px]"
                  >
                    <Trash2 className="h-4 w-4" />
                    {bulkDeleteMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      t("bulkDeleteButton", { count: selectedLinks.size })
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("bulkDeleteConfirmTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("bulkDeleteConfirmDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>
                      {t("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      className="bg-destructive text-white hover:opacity-80 hover:bg-destructive/90"
                    >
                      {bulkDeleteMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        t("delete")
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {!isLinkLimitReached ? (
              <>
                <LinkDialog
                  type="add"
                  isOpen={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                  restaurantName={selectedRestaurant.name}
                  title={newTitle}
                  setTitle={setNewTitle}
                  url={newUrl}
                  setUrl={setNewUrl}
                  icon={selectedIcon}
                  setIcon={setSelectedIcon}
                  onCancel={() => {
                    setIsAddDialogOpen(false);
                    setNewTitle("");
                    setNewUrl("");
                  }}
                  onSubmit={handleAddLink}
                  isPending={createMutation.isPending}
                  disabled={!restaurantId}
                />
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => {
                    const plan = session?.user?.subscription_plan ?? "basic";
                    const planName = getStripePlans(locale)[plan].name;
                    const limit = getStripePlans(locale)[plan].limits?.links;

                    openPopup(
                      t("limitReachedMessage", {
                        limit: limit || "",
                        planName: planName,
                      }),
                    );
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                >
                  <Plus className="h-4 w-4" />
                  {t("addNewLink")}
                </Button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="font-poppins">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">
                    {t("yourLinksTitle")}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {t("yourLinksDescription")}
                  </CardDescription>
                </div>
                {links.length > 0 && (
                  <Checkbox
                    checked={selectedLinks.size === links.length}
                    onCheckedChange={toggleAllLinks}
                    aria-label="Select all links"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {links.length > 0 ? (
                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div
                      key={link.id}
                      className="border border-slate-200 rounded-lg  bg-white/80 p-4 backdrop-blur-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 ">
                        <Checkbox
                          checked={selectedLinks.has(link.id)}
                          onCheckedChange={() => toggleLinkSelection(link.id)}
                          aria-label={`Select ${link.title}`}
                        />
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-2">
                            {getLucideIconBySlug(link.icon_slug, {
                              className: "w-4 h-4",
                            })}
                            <h3 className="truncate font-medium text-slate-900">
                              {link.title}
                            </h3>
                          </div>
                          <p className="truncate text-sm text-slate-500">
                            {link.url}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            {t("clicksLabel")}
                          </span>
                          <div className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                            {link?._count?.views}
                          </div>
                        </div>

                        <div className="md:flex hidden flex-shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(link)}
                            className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t("edit")}</span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">{t("delete")}</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("deleteSingleConfirmTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("deleteSingleConfirmDescription", {
                                    linkTitle: link.title,
                                    restaurantName: selectedRestaurant.name,
                                  })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-poppins rounded-full !px-5">
                                  {t("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(link.id)}
                                  className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                                >
                                  {t("delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              reorderMutation.mutate({
                                linkId: link.id,
                                direction: "up",
                              })
                            }
                            disabled={index === 0 || reorderMutation.isPending}
                            className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                          >
                            <ArrowUp className="h-4 w-4" />
                            <span className="sr-only">{t("moveUp")}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              reorderMutation.mutate({
                                linkId: link.id,
                                direction: "down",
                              })
                            }
                            disabled={
                              index === links.length - 1 ||
                              reorderMutation.isPending
                            }
                            className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                          >
                            <ArrowDown className="h-4 w-4" />
                            <span className="sr-only">{t("moveDown")}</span>
                          </Button>
                        </div>
                      </div>
                      <div className="md:hidden mt-4 justify-center flex flex-shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(link)}
                          className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">{t("edit")}</span>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t("delete")}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("deleteSingleConfirmTitle")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("deleteSingleConfirmDescription", {
                                  linkTitle: link.title,
                                  restaurantName: selectedRestaurant.name,
                                })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="font-poppins rounded-full !px-5">
                                {t("cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(link.id)}
                                className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                              >
                                {t("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            reorderMutation.mutate({
                              linkId: link.id,
                              direction: "up",
                            })
                          }
                          disabled={index === 0 || reorderMutation.isPending}
                          className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                        >
                          <ArrowUp className="h-4 w-4" />
                          <span className="sr-only">{t("moveUp")}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            reorderMutation.mutate({
                              linkId: link.id,
                              direction: "down",
                            })
                          }
                          disabled={
                            index === links.length - 1 ||
                            reorderMutation.isPending
                          }
                          className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                        >
                          <ArrowDown className="h-4 w-4" />
                          <span className="sr-only">{t("moveDown")}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 text-center"
                >
                  <p className="mb-3 text-sm text-slate-500">
                    {t("noLinksMessage", {
                      restaurantName: selectedRestaurant.name,
                    })}
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <EditLinkDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        restaurantName={selectedRestaurant.name}
        title={newTitle}
        setTitle={setNewTitle}
        url={newUrl}
        setUrl={setNewUrl}
        icon={selectedIcon}
        setIcon={setSelectedIcon}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setEditingLink(null);
          setNewTitle("");
          setNewUrl("");
        }}
        onSubmit={handleUpdateLink}
        isPending={updateMutation.isPending}
      />
    </>
  );
}
