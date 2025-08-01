"use client"

import { ColorSelector } from "@/app/(dashboard)/_components/color-selection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/supabase/clients/client"
import { Session } from "@supabase/supabase-js"
import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"


const colorPresets = [
    { color: "#3B82F6" },
    { color: "#EF4444" },
    { color: "#10B981" },
    { color: "#F59E0B" },
    { color: "#8B5CF6" },
    { color: "#EC4899" },
]

interface RestaurantCustomizerProps {
    stylesData: any
    customBgUrl: string
    restaurentOwnerID: string
    restaurentID: string
    updateStylesData: (key: string, value: string) => void
}

export default function RestaurantCustomizer({ stylesData, customBgUrl, updateStylesData, restaurentOwnerID, restaurentID }: RestaurantCustomizerProps) {

    const [session, setSession] = useState<Session | null>(null);
    const [isSaving, setIsSaving] = useState(false)
    const [initialStylesData, setInitialStylesData] = useState<any>(null)

    useEffect(() => {
        if (!initialStylesData) {
            setInitialStylesData(stylesData)
        }
    }, [stylesData, initialStylesData])

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
        };

        getSession();
    }, [supabase]);

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

                toast.success("Styles saved successfully!")
            } else {
                toast.error("Failed to save styles")
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
                    Customise
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-96  overflow-y-auto">
                <SheetHeader className="bg-gray-100">
                    <SheetTitle className="text-xl">Customize Styles</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-10">
                    {/* Background Image URL */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 text-sm font-medium">Background Image URL</Label>
                        <Input
                            value={customBgUrl}
                            onChange={(e) => updateStylesData("bg_image_url", e.target.value)}
                            placeholder="Enter image URL"
                        />
                    </div>

                    {/* Header Colors */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Header</h3>
                        <ColorSelector
                            label="Header Background"
                            value={stylesData.headerBg}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerBg", val)}
                        />
                        <ColorSelector
                            label="Header Text"
                            value={stylesData.headerText}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerText", val)}
                        />
                        <ColorSelector
                            label="Cart Button Background"
                            value={stylesData.headerCartButtonBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonBG", val)}
                        />
                        <ColorSelector
                            label="Cart Button Border"
                            value={stylesData.headerCartButtonBorder}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonBorder", val)}
                        />
                        <ColorSelector
                            label="Cart Button Count Badge Background"
                            value={stylesData.headerCartButtonCountBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonCountBG", val)}
                        />
                        <ColorSelector
                            label="Cart Button Count Badge Border"
                            value={stylesData.headerCartButtonCountBorder}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("headerCartButtonCountBorder", val)}
                        />
                    </div>

                    {/* Overall Colors */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Overall</h3>
                        <ColorSelector
                            label="Text Color"
                            value={stylesData.textColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("textColor", val)}
                        />
                        <ColorSelector
                            label="Background Color"
                            value={stylesData.bgColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("bgColor", val)}
                        />
                        <ColorSelector
                            label="Info Icons Color"
                            value={stylesData.infoIconsColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("infoIconsColor", val)}
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Category Tabs</h3>
                        <ColorSelector
                            label="Active Tab Background"
                            value={stylesData.tabsButtonBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsButtonBG", val)}
                        />
                        <ColorSelector
                            label="Default Tab Background"
                            value={stylesData.tabsButtonDefault}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsButtonDefault", val)}
                        />
                        <ColorSelector
                            label="Active Tab Text"
                            value={stylesData.tabsTextColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsTextColor", val)}
                        />
                        <ColorSelector
                            label="Default Tab Text"
                            value={stylesData.tabsTextDefaultColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("tabsTextDefaultColor", val)}
                        />
                    </div>

                    {/* Cards */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Cards</h3>
                        <ColorSelector
                            label="Card Background"
                            value={stylesData.cardsBG}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsBG", val)}
                        />
                        <ColorSelector
                            label="Card Text"
                            value={stylesData.cardsText}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsText", val)}
                        />
                        <ColorSelector
                            label="Badge Background"
                            value={stylesData.cardsBadgesBg}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsBadgesBg", val)}
                        />
                        <ColorSelector
                            label="Badge Text"
                            value={stylesData.cardsBadgesTextColor}
                            colors={["#FFFFFF", "#000000", ...colorPresets.map((item) => item.color)]}
                            onChange={(val) => updateStylesData("cardsBadgesTextColor", val)}
                        />
                    </div>
                    {/* Save Changes Button */}
                    <div className="pt-6 border-t">
                        <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full" size="lg">
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
