"use client"

import { ColorSelector } from "@/app/[locale]/(dashboard)/_components/color-selection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "@/lib/auth/auth-client"
import { uploadImage } from "@/supabase/clients/client"
import { Loader2, Settings } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"


const colorPresets = [
    { color: "#3B82F6" },
    // { color: "#EF4444" },
    // { color: "#10B981" },
    // { color: "#F59E0B" },
    // { color: "#8B5CF6" },
    // { color: "#EC4899" },
]

interface RestaurantCustomizerProps {
    stylesData: any
    customBgUrl: string
    restaurentOwnerID: string
    restaurentID: string
    updateStylesData: (key: string, value: string) => void
}

export default function RestaurantCustomizer({ stylesData, customBgUrl, updateStylesData, restaurentOwnerID, restaurentID }: RestaurantCustomizerProps) {
    const t = useTranslations("restaurant_customizer")
    const { data: session } = useSession()
    const [isSaving, setIsSaving] = useState(false)
    const [initialStylesData, setInitialStylesData] = useState<any>(null)
    const [uploading, setUploading] = useState(false)
    useEffect(() => {
        if (!initialStylesData) {
            setInitialStylesData(stylesData)
        }
    }, [stylesData, initialStylesData])



    if (!session?.user || session?.user?.id !== restaurentOwnerID) {
        return null
    }
    if (!session?.user) return null

    const handleSaveChanges = async () => {
        setIsSaving(true)
        try {

            const payload = {

                headerBg: stylesData.headerBg,
                headerText: stylesData.headerText,
                headerCartButtonBG: stylesData.headerCartButtonBG,
                headerCartButtonBorder: stylesData.headerCartButtonBorder,
                headerCartButtonCountBG: stylesData.headerCartButtonCountBG,
                headerCartButtonCountBorder: stylesData.headerCartButtonCountBorder,
                textColor: stylesData.textColor,
                bgColor: stylesData.bgColor,
                infoIconsColor: stylesData.infoIconsColor,
                tabsButtonBG: stylesData.tabsButtonBG,
                tabsButtonDefault: stylesData.tabsButtonDefault,
                tabsBorderColor: stylesData.tabsBorderColor,
                tabsTextColor: stylesData.tabsTextColor,
                tabsTextDefaultColor: stylesData.tabsTextDefaultColor,
                cardsBG: stylesData.cardsBG,
                cardsText: stylesData.cardsText,
                cardsBadgesBg: stylesData.cardsBadgesBg,
                cardsBadgesTextColor: stylesData.cardsBadgesTextColor,
            }

            const response = await fetch(`/api/restaurants/${restaurentID}/update-styles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...payload, restaurantId: restaurentID, menuPageBackgroundImage: customBgUrl }),
            })

            if (response.ok) {
                // setInitialStylesData(JSON.parse(JSON.stringify(stylesData)))

                toast.success(t("toast_success"))
            } else {
                toast.error(t("toast_error"))
            }
        } catch (error) {
            console.error("Error saving styles:", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="fixed bottom-6 cursor-pointer right-6 rounded-full h-14 !px-6 shadow-lg" size="lg">
                    <Settings className="w-5 h-5" />
                    {t("button_customize")}
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-96  overflow-y-auto">
                <SheetHeader className="bg-gray-100">
                    <SheetTitle className="text-xl">
                        {t("title_customize_styles")}
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-10">
                    {/* Background Image URL */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 text-sm font-medium">
                            {t("background_image_url_label")}
                        </Label>
                        <Input
                            type="file"
                            accept="image/*"
                            className="disabled:opacity-40"
                            disabled={uploading}
                            onDrop={async (e) => {
                                e.preventDefault(); // prevent browser default behavior
                                setUploading(true);

                                const file = e.dataTransfer.files?.[0];
                                if (!file) return;

                                const uploadedUrl = await uploadImage(file);
                                if (uploadedUrl) {
                                    updateStylesData("bg_image_url", uploadedUrl);
                                }
                                setUploading(false);
                            }}
                            onChange={async (e) => {
                                setUploading(true)
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const uploadedUrl = await uploadImage(file);
                                if (uploadedUrl) {
                                    updateStylesData("bg_image_url", uploadedUrl);
                                    setUploading(false)
                                } else {
                                    setUploading(false)
                                }

                            }}
                        />
                        {customBgUrl && (
                            <>
                                <p className="text-sm font-semibold">
                                    {t("background_image_preview")}
                                </p>
                                <div className="w-full relative">
                                    {uploading && <div className="absolute w-full flex-col gap-1 text-sm h-full bg-white top-0 left-0 flex items-center justify-center">
                                        <Loader2 className="animate-spin" />
                                        {t("uploading")}
                                    </div>}
                                    <img
                                        src={customBgUrl}
                                        alt="Selected background"
                                        className="w-full max-w-md mt-2 aspect-[4/1.04] object-cover rounded shadow border"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Header Colors */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            {t("header_section_title")}
                        </h3>
                        <ColorSelector
                            label={t("header_background")}
                            value={stylesData.headerBg}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerBg", val)}
                        />
                        <ColorSelector
                            label={t("header_text")}
                            value={stylesData.headerText}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerText", val)}
                        />
                        <ColorSelector
                            label={t("header_cart_button_bg")}
                            value={stylesData.headerCartButtonBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonBG", val)}
                        />
                        <ColorSelector
                            label={t("header_cart_button_border")}
                            value={stylesData.headerCartButtonBorder}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonBorder", val)}
                        />
                        <ColorSelector
                            label={t("header_cart_button_count_bg")}
                            value={stylesData.headerCartButtonCountBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonCountBG", val)}
                        />
                        <ColorSelector
                            label={t("header_cart_button_count_border")}
                            value={stylesData.headerCartButtonCountBorder}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonCountBorder", val)}
                        />
                    </div>

                    {/* Overall Colors */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            {t("overall_section_title")}
                        </h3>
                        <ColorSelector
                            label={t("overall_text_color")}
                            value={stylesData.textColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("textColor", val)}
                        />
                        <ColorSelector
                            label={t("overall_bg_color")}
                            value={stylesData.bgColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("bgColor", val)}
                        />
                        <ColorSelector
                            label={t("overall_info_icons_color")}
                            value={stylesData.infoIconsColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("infoIconsColor", val)}
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            {t("category_tabs_section_title")}
                        </h3>
                        <ColorSelector
                            label={t("tabs_active_bg")}
                            value={stylesData.tabsButtonBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsButtonBG", val)}
                        />
                        <ColorSelector
                            label={t("tabs_default_bg")}
                            value={stylesData.tabsButtonDefault}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsButtonDefault", val)}
                        />
                        <ColorSelector
                            label={t("tabs_active_text")}
                            value={stylesData.tabsTextColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsTextColor", val)}
                        />
                        <ColorSelector
                            label={t("tabs_default_text")}
                            value={stylesData.tabsTextDefaultColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsTextDefaultColor", val)}
                        />
                    </div>

                    {/* Cards */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                            {t("cards_section_title")}
                        </h3>
                        <ColorSelector
                            label={t("cards_bg")}
                            value={stylesData.cardsBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsBG", val)}
                        />
                        <ColorSelector
                            label={t("cards_text")}
                            value={stylesData.cardsText}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsText", val)}
                        />
                        <ColorSelector
                            label={t("cards_badge_bg")}
                            value={stylesData.cardsBadgesBg}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsBadgesBg", val)}
                        />
                        <ColorSelector
                            label={t("cards_badge_text")}
                            value={stylesData.cardsBadgesTextColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsBadgesTextColor", val)}
                        />
                    </div>
                    {/* Save Changes Button */}
                    <div className="pt-6 border-t">
                        <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full" size="lg">
                            {isSaving ? t("button_saving") : t("button_save_changes")}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
