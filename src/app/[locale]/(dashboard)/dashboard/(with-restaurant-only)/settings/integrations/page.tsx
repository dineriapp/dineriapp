"use client"

import LoadingUI from "@/components/loading-ui"
import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { useUserStore } from "@/stores/auth-store"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store"
import { Globe2, Lock } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface IntegrationFormData {
    google_place_id: string
}

export default function IntegrationsPage() {
    const { selectedRestaurant, updateSelectedRestaurant } = useRestaurantStore()
    const { prismaUser } = useUserStore()
    const openPopup = useUpgradePopupStore(state => state.open)
    const isBasicPlan = prismaUser?.subscription_plan === "basic"
    const t = useTranslations("Settings.integrations");

    const [formData, setFormData] = useState<IntegrationFormData>({
        google_place_id: "",
    })

    const [initialData, setInitialData] = useState<IntegrationFormData>(formData)
    const [saving, setSaving] = useState(false)

    // Load data from restaurant store
    useEffect(() => {
        if (selectedRestaurant) {
            const data: IntegrationFormData = {
                google_place_id: selectedRestaurant.google_place_id || "",
            }

            setFormData(data)
            setInitialData(data)
        }
    }, [selectedRestaurant])

    // Check if form has changes
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

    const resetForm = () => {
        setFormData(initialData)
        toast.success(t("form.reset.title"), {
            description: t("form.reset.description"),
        })
    }

    const saveSettings = async () => {
        if (!selectedRestaurant) {
            toast.error(t("form.noRestaurant"))
            return
        }

        try {
            setSaving(true)

            const response = await fetch(`/api/restaurants/${selectedRestaurant.id}/integrations`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || t("form.error.description"))
            }

            const result = await response.json()

            // Update store with response data
            updateSelectedRestaurant(result.data)

            // Update initial data to reflect saved state
            setInitialData(formData)

            toast.success(t("form.save.title"), {
                description: t("form.save.description"),
            })
        } catch (error: any) {
            console.error(t("form.error.title"), error)
            toast.error(t("form.error.title"), {
                description: error.message || t("form.error.description"),
            })
        } finally {
            setSaving(false)
        }
    }

    if (!selectedRestaurant) {
        return (
            <LoadingUI text={t("loading.text")} />
        )
    }

    return (
        <>
            <Card className=" pt-0 box-shad-every-2 shadow-md border-gray-200">
                <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                    <CardTitle className="text-gray-900">
                        {t("googlePlaces.title")}
                    </CardTitle>
                    <CardDescription>
                        {t("googlePlaces.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="googlePlaceId">
                            {t("googlePlaces.label")}
                        </Label>
                        {isBasicPlan ? (
                            <div
                                onClick={() => {
                                    openPopup(t("googlePlaces.upgradeMessage"))
                                }}
                                className="relative cursor-pointer group"
                            >
                                <Input
                                    id="googlePlaceId"
                                    readOnly
                                    value={formData.google_place_id}
                                    placeholder={t("googlePlaces.upgradePlaceholder")}
                                    className="pl-10 opacity-60 cursor-not-allowed group-hover:opacity-80 transition"
                                />
                                <Globe2 className="absolute left-3 top-3 h-4 w-4 text-emerald-500" />
                                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-sm text-muted-foreground">
                                    <Lock className="h-4 w-4 text-red-500" />
                                    <span className="text-xs">
                                        {t("googlePlaces.basicPlanTag")}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <Globe2 className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                                <Input
                                    id="googlePlaceId"
                                    value={formData.google_place_id}
                                    onChange={(e) => {
                                        if (!isBasicPlan) {
                                            setFormData((prev) => ({ ...prev, google_place_id: e.target.value }))
                                        }
                                    }}
                                    onFocus={() => {
                                        if (isBasicPlan) openPopup(t("googlePlaces.upgradeMessage"))
                                    }}
                                    placeholder={t("googlePlaces.placeholder")}
                                    className="pl-10 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            {t("googlePlaces.finder.text")}{" "}
                            <a
                                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline"
                            >
                                {t("googlePlaces.finder.link")}
                            </a>
                        </p>
                    </div>

                    {formData.google_place_id && (
                        <div
                            className={`rounded-lg p-4 space-y-2 border ${isBasicPlan
                                ? "bg-yellow-50 border-yellow-200"
                                : "bg-emerald-50 border-emerald-200"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <Globe2
                                    className={`h-5 w-5 mt-0.5 ${isBasicPlan ? "text-yellow-600" : "text-emerald-600"
                                        }`}
                                />
                                <div>
                                    <h4
                                        className={`font-medium ${isBasicPlan ? "text-yellow-900" : "text-emerald-900"
                                            }`}
                                    >
                                        {t("googlePlaces.integrationDetected.title")}
                                    </h4>
                                    <p
                                        className={`text-sm mt-1 ${isBasicPlan ? "text-yellow-800" : "text-emerald-700"
                                            }`}
                                    >
                                        {isBasicPlan
                                            ? t("googlePlaces.integrationDetected.basicDescription")
                                            : t("googlePlaces.integrationDetected.premiumDescription")}
                                    </p>
                                    <p
                                        className={`text-xs mt-2 font-mono ${isBasicPlan ? "text-yellow-700" : "text-emerald-600"
                                            }`}
                                    >
                                        {t("googlePlaces.integrationDetected.placeId")} {formData.google_place_id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            {/* Floating Save Button */}
            <UnsavedChangesPanel
                hasChanges={hasChanges}
                saving={saving}
                resetForm={resetForm}
                saveSettings={saveSettings}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />
        </>
    )
}
