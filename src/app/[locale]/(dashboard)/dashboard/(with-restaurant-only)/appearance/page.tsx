"use client";

import { ColorSelector } from "@/app/[locale]/(dashboard)/_components/color-selection";
import LoadingUI from "@/components/loading-ui";
import SlugPagePreview from "@/components/shared/slug-page-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Locale } from "@/i18n/routing";
import {
  colorPresets,
  fonts,
  gradientDirectionsLangs,
  gradientPresets,
  textColorPresets
} from "@/lib/reuseable-data";
import { AppearanceFormData } from "@/lib/types";
import {
  ResetChangesBtnClasses,
  SaveChangesBtnClasses
} from "@/lib/utils";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { uploadImage } from "@/supabase/clients/client";
import { GradientDirection } from "@prisma/client";
import {
  ImageIcon,
  Loader,
  Paintbrush,
  Palette,
  RotateCcw,
  Save,
  Type,
  Upload
} from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AppearancePage() {
  const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const t = useTranslations("appearance");

  // Form state
  const [formData, setFormData] = useState<AppearanceFormData>({
    bg_color: "#ffffff",
    accent_color: "#10b981",
    headings_text_color: "#ffffff",
    button_text_icons_color: "#000000",
    button_style: "rounded",
    font_family: "var(--font-space-grotesk)",
    bg_type: "color",
    button_icons_show: true,
    use_headings_in_buttons: true,
    food_heading: "Food & Drinks",
    about_heading: "About",
    social_icon_bg_show: false,
    social_icon_bg_color: "#FFFFFF",
    social_icon_color: "#000000",
    buttons_gap_in_px: 16,
    social_icon_gap: 12,
    bg_gradient_start: "#ffffff",
    bg_gradient_end: "#f3f4f6",
    gradient_direction: "bottom_right",
    button_variant: "solid",
    bg_image_url: "",
  });

  const [initialData, setInitialData] = useState<AppearanceFormData>(formData);

  // UI state
  const [saving, setSaving] = useState(false);

  const locale = useLocale() as Locale;
  // Load initial data from restaurant store
  useEffect(() => {
    if (selectedRestaurant) {
      const initialFormData: AppearanceFormData = {
        bg_color: selectedRestaurant.bg_color || "#ffffff",
        accent_color: selectedRestaurant.accent_color || "#10b981",
        headings_text_color:
          selectedRestaurant.headings_text_color || "#ffffff",
        button_text_icons_color:
          selectedRestaurant.button_text_icons_color || "#000000",
        button_style: selectedRestaurant.button_style || "rounded",
        font_family: selectedRestaurant.font_family || "Inter",
        bg_type: selectedRestaurant.bg_type || "color",
        button_icons_show: selectedRestaurant.button_icons_show,
        buttons_gap_in_px: selectedRestaurant.buttons_gap_in_px,
        social_icon_bg_show: selectedRestaurant.social_icon_bg_show,
        social_icon_bg_color: selectedRestaurant.social_icon_bg_color,
        social_icon_color: selectedRestaurant.social_icon_color,
        social_icon_gap: selectedRestaurant.social_icon_gap,
        bg_gradient_start: selectedRestaurant.bg_gradient_start || "#ffffff",
        bg_gradient_end: selectedRestaurant.bg_gradient_end || "#f3f4f6",
        gradient_direction:
          selectedRestaurant.gradient_direction || "bottom_right",
        button_variant: selectedRestaurant.button_variant || "solid",
        bg_image_url: selectedRestaurant.bg_image_url || "",
        about_heading: selectedRestaurant.about_heading || "About",
        food_heading: selectedRestaurant.food_heading || "Food & Drinks",
        use_headings_in_buttons: selectedRestaurant.use_headings_in_buttons,
      };

      setFormData(initialFormData);
      setInitialData(initialFormData);
    }
  }, [selectedRestaurant]);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  // Update form data
  const updateFormData = (updates: Partial<AppearanceFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialData);
    toast.success(t("resetToOrignal"));
  };

  // Save changes
  const saveChanges = async () => {
    if (!selectedRestaurant) return;

    try {
      setSaving(true);

      const response = await fetch(
        `/api/restaurants/${selectedRestaurant.id}/appearance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t("failedToChange"));
      }

      const result = await response.json();

      // Update restaurant store with new data
      updateSelectedRestaurant(result.data);

      // Update initial data to reflect saved state
      setInitialData(formData);

      toast.success(t("SuccessToChange"));
    } catch (error) {
      console.error("Error saving appearance:", error);
      toast.error(error instanceof Error ? error.message : t("failedToChange"));
    } finally {
      setSaving(false);
    }
  };

  const handleUrlChange = (value: string) => {
    updateFormData({ bg_image_url: value });
  };

  async function handleFileChange(file?: File) {
    if (!file) return;
    // optional: quick client validation
    if (!file.type.startsWith("image/")) {
      return;
    }
    setUploadingLogo(true);
    try {
      const uploadedUrl = await uploadImage(file); // <- your existing uploader
      if (uploadedUrl) handleUrlChange(uploadedUrl); // reuse same updater
    } catch (e) {
      console.log(e);
    } finally {
      setUploadingLogo(false);
    }
  }

  // Apply template
  // const applyTemplate = async (template: Template) => {
  //     const templateData = template.preview
  //     setFormData(templateData)
  // }

  if (!selectedRestaurant) {
    return <LoadingUI text={t("loadingAppearance")} />;
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-main-blue">{t("appearance")}</h1>
        <p className="text-slate-500 mt-1">{t("customizeRestaurantPage")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Tabs defaultValue="style" className="space-y-6">
            <TabsList className="grid grid-cols-3 md:gap-4 gap-1 h-[44px] rounded-full w-full">
              <TabsTrigger
                value="style"
                className="flex items-center gap-2 rounded-full"
              >
                <Paintbrush className="h-4 w-4" />
                <span className="max-md:text-xs">{t("tabs_style")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="colors"
                className="flex items-center gap-2 rounded-full"
              >
                <Palette className="h-4 w-4" />
                <span className="max-md:text-xs">{t("tabs_colors")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="typography"
                className="flex items-center gap-2 rounded-full"
              >
                <Type className="h-4 w-4" />
                <span className="max-md:text-xs">{t("tabs_typography")}</span>
              </TabsTrigger>
              {/* <TabsTrigger value="templates" className="flex items-center gap-2 rounded-full">
                                <Sparkles className="h-4 w-4" />
                                <span>Templates</span>
                            </TabsTrigger> */}
            </TabsList>

            <TabsContent value="style" className="space-y-4">
              <Card className="border-slate-200 gap-0 pt-0 box-shad-every-2">
                <CardHeader className="py-4 gap-1 font-poppins bg-gray-100/50">
                  <CardTitle className="text-slate-900">
                    {t("buttonStyle")}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {t("buttonStyle_description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="space-y-4">
                    <Label className="text-slate-700">{t("shape")}</Label>
                    <RadioGroup
                      value={formData.button_style}
                      onValueChange={(value: string) =>
                        updateFormData({
                          button_style: value as "rounded" | "square" | "pill",
                        })
                      }
                      className="grid md:grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="rounded"
                          id="rounded"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="rounded"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-10 rounded-2xl bg-gradient-to-r from-main-action to-main-blue mb-2"></div>
                          <span className="text-slate-700">{t("rounded")}</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="square"
                          id="square"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="square"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-10 rounded-sm bg-gradient-to-r from-main-action to-main-blue mb-2"></div>
                          <span className="text-slate-700">{t("square")}</span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="pill"
                          id="pill"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="pill"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-10 rounded-full bg-gradient-to-r from-main-action to-main-blue mb-2"></div>
                          <span className="text-slate-700">{t("pill")}</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-slate-700">{t("style")}</Label>
                    <RadioGroup
                      value={formData.button_variant}
                      onValueChange={(value: string) =>
                        updateFormData({
                          button_variant: value as "solid" | "outline",
                        })
                      }
                      className="grid md:grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="solid"
                          id="solid"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="solid"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-10 rounded-xl bg-gradient-to-r from-main-green to-main-blue flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {t("solid")}
                            </span>
                          </div>
                          <span className="text-slate-700">
                            {/* {t("solid")} */}
                          </span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="outline"
                          id="outline"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="outline"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-10 rounded-xl bg-white border-2 border-teal-600 flex items-center justify-center">
                            <span className="text-teal-600 text-xs font-medium">
                              {t("outline")}
                            </span>
                          </div>
                          <span className="text-slate-700">
                            {/* {t("outline")} */}
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {/* button icons show  */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border rounded-lg px-4 py-3">
                      <div className="space-y-1">
                        <Label className="text-slate-700 text-sm font-medium">
                          {t("showIconsOnButtons")}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t("showIconsOnButtons_description")}
                        </p>
                      </div>
                      <Switch
                        checked={formData.button_icons_show}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            button_icons_show: checked,
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-col border rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="space-y-1">
                          <Label className="text-slate-700 text-sm font-medium">
                            {t("separate_buttons_title")}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {t("separate_buttons_description")}
                          </p>
                        </div>

                        <Switch
                          checked={formData.use_headings_in_buttons}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              use_headings_in_buttons: checked,
                            }))
                          }
                        />
                      </div>

                      {formData.use_headings_in_buttons && (
                        <div className="mt-4 flex flex-col gap-3">
                          <div className="space-y-1">
                            <Label className="text-sm">
                              {t("first_section_heading_label")}
                            </Label>
                            <Input
                              value={formData.food_heading || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  food_heading: e.target.value,
                                }))
                              }
                              placeholder={t("first_section_heading_placeholder")}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-sm">
                              {t("second_section_heading_label")}
                            </Label>
                            <Input
                              value={formData.about_heading || ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  about_heading: e.target.value,
                                }))
                              }
                              placeholder={t("second_section_heading_placeholder")}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Gap between buttons (vertical spacing) */}
                  <div className="space-y-2">
                    <div>
                      <Label className="text-slate-700 text-sm font-medium">
                        {t("verticalGapBetweenButtons")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("verticalGapBetweenButtons_description")}
                      </p>
                    </div>
                    <Select
                      value={String(formData.buttons_gap_in_px)}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          buttons_gap_in_px: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectGapPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(16)].map((_, i) => {
                          const gap = i * 2;
                          if (gap === 0) return null;
                          return (
                            <SelectItem key={gap} value={String(gap)}>
                              {gap}px
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 gap-0 pt-0 box-shad-every-2">
                <CardHeader className="py-4 gap-1 bg-gray-100/50 font-poppins">
                  <CardTitle className="text-slate-900">
                    {t("socialIconStyle")}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {t("socialIconStyle_description")}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                  {/* Toggle for background */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border rounded-lg px-4 py-3">
                      <div className="space-y-1">
                        <Label className="text-slate-700 text-sm font-medium">
                          {t("showIconBackground")}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t("showIconBackground_description")}
                        </p>
                      </div>
                      <Switch
                        checked={formData.social_icon_bg_show}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            social_icon_bg_show: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Select background color */}
                  <div className="space-y-2">
                    <div>
                      <Label className="text-slate-700 text-sm font-medium">
                        {t("iconBackgroundColor")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("iconBackgroundColor_description")}
                      </p>
                    </div>
                    <ColorSelector
                      value={formData.social_icon_bg_color}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          social_icon_bg_color: val,
                        }))
                      }
                    />
                  </div>

                  {/* Select icon color */}
                  <div className="space-y-2">
                    <div>
                      <Label className="text-slate-700 text-sm font-medium">
                        {t("iconColor")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("iconColor_description")}
                      </p>
                    </div>
                    <ColorSelector
                      value={formData.social_icon_color}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          social_icon_color: val,
                        }))
                      }
                    />
                  </div>
                  {/* Horizonal Gap Between icons  */}
                  <div className="space-y-2">
                    <div>
                      <Label className="text-slate-700 text-sm font-medium">
                        {t("horizontalGapBetweenIcons")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("horizontalGapBetweenIcons_description")}
                      </p>
                    </div>
                    <Select
                      value={String(formData.social_icon_gap)}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          social_icon_gap: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectGapPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => {
                          const gap = i * 2;
                          if (gap === 0) return null;
                          return (
                            <SelectItem key={gap} value={String(gap)}>
                              {gap}px
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors">
              <div className="space-y-4">
                <Card className="border-slate-200 gap-0 pt-0 box-shad-every-2">
                  <CardHeader className="py-4 font-poppins bg-gray-100/50">
                    <CardTitle className="text-slate-900">
                      {t("background")}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      {t("background_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <RadioGroup
                      value={formData.bg_type}
                      onValueChange={(value: string) =>
                        updateFormData({
                          bg_type: value as "color" | "gradient" | "image",
                        })
                      }
                      className="grid md:grid-cols-3 w-full  gap-3"
                    >
                      <div>
                        <RadioGroupItem
                          value="color"
                          id="color"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="color"
                          className="flex flex-col md:w-[120px] items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-8 rounded bg-teal-600 mb-2"></div>
                          <span className="text-slate-700">
                            {t("solidColor")}
                          </span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="gradient"
                          id="gradient"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="gradient"
                          className="flex flex-col md:w-[120px] items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-8 rounded bg-gradient-to-r from-teal-500 to-blue-500 mb-2"></div>
                          <span className="text-slate-700">
                            {t("gradient")}
                          </span>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="image"
                          id="image"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="image"
                          className="flex flex-col md:w-[120px] items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-teal-600 [&:has([data-state=checked])]:border-teal-600 cursor-pointer"
                        >
                          <div className="w-full h-8 rounded bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center mb-2">
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                          </div>
                          <span className="text-slate-700">{t("image")}</span>
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.bg_type === "color" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {t("backgroundColor")}
                          </Label>
                          <ColorSelector
                            value={formData.bg_color}
                            colors={[
                              "#FFFFFF",
                              "#000000",
                              ...colorPresets.map((item) => item.color),
                            ]}
                            onChange={(val) =>
                              updateFormData({ bg_color: val })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {formData.bg_type === "gradient" && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <Label className="text-slate-700">
                            {t("gradientPresets")}
                          </Label>

                          <div className="grid grid-cols-10 gap-2">
                            {gradientPresets.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() =>
                                  updateFormData({
                                    bg_gradient_start: preset.start,
                                    bg_gradient_end: preset.end,
                                  })
                                }
                                className="w-full aspect-square rounded-lg overflow-hidden hover:ring-2 ring-offset-2 ring-teal-600 transition-all"
                                style={{
                                  background: `linear-gradient(to bottom right, ${preset.start}, ${preset.end})`,
                                }}
                                title={preset.name}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-slate-700">
                            {t("gradientDirection")}
                          </Label>
                          <Select
                            value={formData.gradient_direction}
                            onValueChange={(value) =>
                              updateFormData({
                                gradient_direction: value as GradientDirection,
                              })
                            }
                          >
                            <SelectTrigger className="border-slate-200 !py-5 w-full">
                              <SelectValue
                                placeholder={t("selectDirectionPlaceholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {gradientDirectionsLangs[locale].map(
                                (direction) => (
                                  <SelectItem
                                    key={direction.value}
                                    value={direction.value}
                                  >
                                    <div className="flex flex-col items-start">
                                      <span>{direction.label}</span>
                                      <span className="text-xs text-slate-500">
                                        {direction.preview}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-slate-700">
                              {t("startColor")}
                            </Label>
                            <ColorSelector
                              value={formData.bg_gradient_start}
                              colors={[
                                "#FFFFFF",
                                "#000000",
                                ...colorPresets.map((item) => item.color),
                              ]}
                              onChange={(val) =>
                                updateFormData({ bg_gradient_start: val })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-700">
                              {t("endColor")}
                            </Label>
                            <ColorSelector
                              value={formData.bg_gradient_end}
                              colors={[
                                "#FFFFFF",
                                "#000000",
                                ...colorPresets.map((item) => item.color),
                              ]}
                              onChange={(val) =>
                                updateFormData({ bg_gradient_end: val })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.bg_type === "image" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {t("imageUrl")}
                          </Label>
                          {/* <div className="flex items-center gap-2">
                                                        <Input
                                                            type="url"
                                                            value={formData.bg_image_url || ""}
                                                            onChange={(e) => updateFormData({ bg_image_url: e.target.value })}
                                                            placeholder={t("imageUrl_placeholder")}
                                                            className="flex-1 border-slate-200"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        {t("imageUrl_hint")}
                                                    </p> */}
                          <div className="relative">
                            {/* Hidden file input */}
                            <Input
                              id="logo_file"
                              type="file"
                              accept="image/*"
                              disabled={saving || uploadingLogo}
                              onChange={(e) =>
                                handleFileChange(e.target.files?.[0])
                              }
                              className="hidden"
                            />

                            {/* Upload button */}
                            <Button
                              type="button"
                              disabled={saving || uploadingLogo}
                              onClick={() =>
                                document.getElementById("logo_file")?.click()
                              }
                              className="w-full text-sm! cursor-pointer"
                              variant={"outline"}
                            >
                              {uploadingLogo ? (
                                <>
                                  <Loader className="animate-spin" />
                                </>
                              ) : (
                                <>
                                  <Upload />
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500">
                            {t("imageUrl_hint")}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200 gap-0 pt-0 box-shad-every-2">
                  <CardHeader className="py-4 font-poppins bg-gray-100/50">
                    <CardTitle className="text-slate-900">
                      {t("accentColor")}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      {t("accentColor_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <Label className="text-slate-700">
                        {t("colorPresets")}
                      </Label>
                      <div>
                        <ColorSelector
                          value={formData.accent_color}
                          colors={colorPresets.map((item) => item.color)}
                          onChange={(val) =>
                            updateFormData({ accent_color: val })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 gap-0 !pt-0 box-shad-every-2">
                  <CardHeader className="py-4 font-poppins bg-gray-100/50">
                    <CardTitle className="text-slate-900">
                      {t("textColors")}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      {t("textColors_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-700">
                          {t("headingsTextColor")}
                        </Label>
                        <p className="text-xs mt-2 text-slate-500">
                          {t("headingsTextColor_hint")}
                        </p>
                      </div>
                      <div>
                        <ColorSelector
                          value={formData.headings_text_color}
                          colors={textColorPresets.map((item) => item.color)}
                          onChange={(val) =>
                            updateFormData({ headings_text_color: val })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-700">
                          {t("buttonTextIconsColor")}
                        </Label>
                        <p className="text-xs mt-2 text-slate-500">
                          {t("buttonTextIconsColor_hint")}
                        </p>
                      </div>
                      <div>
                        <ColorSelector
                          value={formData.button_text_icons_color}
                          colors={textColorPresets.map((item) => item.color)}
                          onChange={(val) =>
                            updateFormData({ button_text_icons_color: val })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="typography">
              <Card className="border-slate-200 pt-0 box-shad-every-2">
                <CardHeader className="py-4 bg-gray-100/50 font-poppins">
                  <CardTitle className="text-slate-900">
                    {t("fontSelection")}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {t("fontSelection_description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">{t("font")}</Label>
                      <Select
                        value={
                          formData.font_family || "var(--font-space-grotesk)"
                        }
                        onValueChange={(value) =>
                          updateFormData({ font_family: value })
                        }
                      >
                        <SelectTrigger className="border-slate-200 !h-[50px] w-full">
                          <SelectValue
                            placeholder={t("selectFontPlaceholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <div className="flex flex-col items-start ">
                                <span style={{ fontFamily: font.value }}>
                                  {font.name}
                                </span>
                                {/* <span className="text-xs text-slate-500">{font.preview}</span> */}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700">{t("preview")}</Label>
                      <div
                        className="p-4 rounded-lg bg-slate-100"
                        style={{ fontFamily: formData.font_family }}
                      >
                        <p className="text-2xl font-bold mb-2 text-slate-900">
                          {t("preview_text_title")}
                        </p>
                        <p className="text-slate-600">
                          {t("preview_text_paragraph")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Floating Action Buttons */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 right-6 flex gap-2 z-50"
            >
              <Button
                onClick={resetForm}
                variant="outline"
                size="sm"
                className={`${ResetChangesBtnClasses} !bg-white`}
              >
                <RotateCcw className="h-4 w-4" />
                {t("reset")}
              </Button>
              <Button
                onClick={saveChanges}
                disabled={saving}
                size="sm"
                className={SaveChangesBtnClasses}
              >
                <Save className="size-4 aspect-square" />
                {saving ? t("saving") : t("saveChanges")}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Live Preview */}
        <SlugPagePreview className="lg:sticky lg:top-24 space-y-6" formData={formData} />
      </div>
    </main>
  );
}

// {
//        <TabsContent value="templates">
//                             <Card className="border-slate-200 pt-0 box-shad-every-2">
//                                 <CardHeader className="py-4 font-poppins bg-gray-100/50">
//                                     <CardTitle className="text-slate-900">Design Templates</CardTitle>
//                                     <CardDescription className="text-slate-500">
//                                         Choose from professionally designed templates to quickly style your restaurant page
//                                     </CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="grid md:grid-cols-2 gap-6">
//                                         {templates.map((template) => (
//                                             <motion.div
//                                                 key={template.id}
//                                                 initial={{ opacity: 0, y: 20 }}
//                                                 animate={{ opacity: 1, y: 0 }}
//                                                 transition={{ duration: 0.3 }}
//                                                 className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300"
//                                             >
//                                                 {/* Template Preview */}
//                                                 <div className="aspect-[4/3] relative overflow-hidden">
//                                                     <div
//                                                         className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center"
//                                                         style={{
//                                                             background: template.preview.bg_type === "gradient"
//                                                                 ? `linear-gradient(to bottom right, ${template.preview.bg_gradient_start}, ${template.preview.bg_gradient_end})`
//                                                                 : template.preview.bg_color,
//                                                             fontFamily: template.preview.font_family
//                                                         }}
//                                                     >
//                                                         {/* Mock Restaurant Name */}
//                                                         <h3
//                                                             className="text-lg font-bold mb-2"
//                                                             style={{ color: template.preview.headings_text_color }}
//                                                         >
//                                                             {selectedRestaurant?.name}
//                                                         </h3>

//                                                         {/* Mock Bio */}
//                                                         <p
//                                                             className="text-sm mb-4 opacity-90"
//                                                             style={{ color: template.preview.headings_text_color }}
//                                                         >
//                                                             Delicious food & great atmosphere
//                                                         </p>

//                                                         {/* Mock Button */}
//                                                         <div
//                                                             className={`px-4 py-2 text-sm font-medium transition-all ${template.preview.button_style === "pill"
//                                                                 ? "rounded-full"
//                                                                 : template.preview.button_style === "square"
//                                                                     ? "rounded-md"
//                                                                     : "rounded-xl"
//                                                                 }`}
//                                                             style={{
//                                                                 backgroundColor: template.preview.button_variant === "solid"
//                                                                     ? template.preview.accent_color
//                                                                     : "transparent",
//                                                                 color: template.preview.button_variant === "solid"
//                                                                     ? template.preview.button_text_icons_color
//                                                                     : template.preview.accent_color,
//                                                                 border: template.preview.button_variant === "outline"
//                                                                     ? `2px solid ${template.preview.accent_color}`
//                                                                     : "none"
//                                                             }}
//                                                         >
//                                                             View Menu
//                                                         </div>
//                                                     </div>

//                                                     {/* Overlay on hover */}
//                                                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
//                                                 </div>

//                                                 {/* Template Info */}
//                                                 <div className="p-4">
//                                                     <div className="flex items-start justify-between mb-2">
//                                                         <div>
//                                                             <h4 className="font-semibold text-slate-900">{template.name}</h4>
//                                                             <span className="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full mt-1">
//                                                                 {template.category}
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                     <p className="text-sm text-slate-600 mb-4">{template.description}</p>

//                                                     <Button
//                                                         onClick={() => applyTemplate(template)}
//                                                         disabled={saving}
//                                                         className={cn(SaveChangesBtnClasses, "w-full !h-[40px] !text-sm")}
//                                                         size="sm"
//                                                     >
//                                                         {saving ? "Applying..." : "Apply Template"}
//                                                     </Button>
//                                                 </div>
//                                             </motion.div>
//                                         ))}
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </TabsContent>
// }
