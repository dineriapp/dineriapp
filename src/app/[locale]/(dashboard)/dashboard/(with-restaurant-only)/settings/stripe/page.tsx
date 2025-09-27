"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRestaurants } from "@/lib/restaurents-queries"
import { useRestaurantStore } from "@/stores/restaurant-store"
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2, Shield } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import LoadingUI from "@/components/loading-ui"
import { useTranslations } from "next-intl"

export default function StripeSettingsPage() {
    const { selectedRestaurant: restaurant, initializeRestaurants } = useRestaurantStore()
    const { refetch } = useRestaurants()
    const t = useTranslations("Settings.stripeSettings")

    const [saving, setSaving] = useState(false)
    const [showPublicKey, setShowPublicKey] = useState(false)
    const [showSecretKey, setShowSecretKey] = useState(false)

    const [formData, setFormData] = useState({
        stripe_public_key: "",
        stripe_secret_key: "",
    })


    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!restaurant) return

        // Validate Stripe keys format
        if (formData.stripe_public_key && !formData.stripe_public_key.startsWith("pk_")) {
            toast.error(t("errors.invalid_public.title"), {
                description: t("errors.invalid_public.description"),
            })
            return
        }

        if (formData.stripe_secret_key && !formData.stripe_secret_key.startsWith("sk_")) {
            toast.error(t("errors.invalid_secret.title"), {
                description: t("errors.invalid_secret.description"),
            })
            return
        }

        setSaving(true)

        try {
            const response = await fetch(`/api/restaurants/${restaurant.id}/stripe`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t("errors.update_failed.description"))
            }

            toast.success(t("toasts.update_success.title"), {
                description: t("toasts.update_success.description"),
            })

            // Clear form and refresh restaurant data
            setFormData({
                stripe_public_key: "",
                stripe_secret_key: "",
            })

            const result = await refetch()
            if (result.data?.restaurants) {
                initializeRestaurants(result.data.restaurants)
            }

        } catch (error) {
            console.error("Error updating Stripe settings:", error)
            toast.error(t("errors.update_failed.title"), {
                description: error instanceof Error ? error.message : t("errors.update_failed.description"),
            })
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveKeys = async () => {
        if (!restaurant) return

        setSaving(true)

        try {
            const response = await fetch(`/api/restaurants/${restaurant.id}/stripe`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t("errors.remove_failed.description"))
            }

            toast.success(t("toasts.remove_success.title"), {
                description: t("toasts.remove_success.description"),
            })

            const result = await refetch()
            if (result.data?.restaurants) {
                initializeRestaurants(result.data.restaurants)
            }

        } catch (error) {
            console.error(t("errors.remove_failed.title"), error)
            toast.error(t("errors.remove_failed.title"), {
                description: error instanceof Error ? error.message : t("errors.remove_failed.description"),
            })
        } finally {
            setSaving(false)
        }
    }

    if (!restaurant) {
        return (
            <LoadingUI text={t("loading.page")} />
        )
    }

    const hasKeys = restaurant.stripe_public_key_encrypted || restaurant.stripe_secret_key_encrypted || restaurant.stripe_webhook_secret_encrypted

    return (
        <Card className="pt-0 box-shad-every-2 shadow-md border-gray-200 gap-5">
            <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                <CardTitle className="text-gray-900">
                    {t("page.title")}
                </CardTitle>
                <CardDescription>
                    {t("page.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">

                {/* Security Notice */}
                <Alert className="">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        <strong>
                            {t("alerts.security_notice.title")}
                        </strong>
                        {t("alerts.security_notice.description")}
                    </AlertDescription>
                </Alert>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {t("status.title")}
                            {hasKeys ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            )}
                        </CardTitle>
                        <CardDescription>
                            {hasKeys ? t("status.configured") : t("status.not_configured")}
                        </CardDescription>
                    </CardHeader>
                    {hasKeys && (
                        <CardContent>
                            <div className="space-y-2">
                                {(restaurant.stripe_public_key_encrypted || restaurant.stripe_secret_key_encrypted || restaurant.stripe_webhook_secret_encrypted) && (
                                    <div className="space-y-2">
                                        <div className={`flex items-center gap-2 text-sm ${restaurant.stripe_public_key_encrypted ? 'text-green-600' : 'text-red-600'}`}>
                                            <CheckCircle className="h-4 w-4" />
                                            <span> {restaurant.stripe_public_key_encrypted ? t("status.public_key.configured") : t("status.public_key.not_configured")}</span>
                                        </div>

                                        <div className={`flex items-center gap-2 text-sm ${restaurant.stripe_secret_key_encrypted ? 'text-green-600' : 'text-red-600'}`}>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>{restaurant.stripe_secret_key_encrypted ? t("status.secret_key.configured") : t("status.secret_key.not_configured")}</span>
                                        </div>

                                        <div className={`flex items-center gap-2 text-sm ${restaurant.stripe_webhook_secret_encrypted ? 'text-green-600' : 'text-red-600'}`}>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>{restaurant.stripe_webhook_secret_encrypted ? t("status.webhook_secret.configured") : t("status.webhook_secret.not_configured")}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveKeys}
                                disabled={saving}
                                className="mt-4 hover:text-white text-white rounded-full font-poppins px-4 cursor-pointer hover:bg-destructive/70 text-xs border-red-200 bg-destructive"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {t("status.remove_keys_button")}
                            </Button>
                        </CardContent>
                    )}
                </Card>

                {/* Stripe Keys Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {hasKeys ? t("form.title_update") : t("status.title_add")}
                        </CardTitle>
                        <CardDescription>
                            {hasKeys
                                ? t("form.description_update")
                                : t("form.description_add")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="stripe_public_key">
                                    {t("form.labels.public_key")}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="stripe_public_key"
                                        type={showPublicKey ? "text" : "password"}
                                        value={formData.stripe_public_key}
                                        onChange={(e) => handleInputChange("stripe_public_key", e.target.value)}
                                        placeholder={t("form.placeholders.public_key")}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPublicKey(!showPublicKey)}
                                    >
                                        {showPublicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("form.helpers.public_key")}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stripe_secret_key">
                                    {t("form.labels.secret_key")}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="stripe_secret_key"
                                        type={showSecretKey ? "text" : "password"}
                                        value={formData.stripe_secret_key}
                                        onChange={(e) => handleInputChange("stripe_secret_key", e.target.value)}
                                        placeholder={t("form.placeholders.secret_key")}
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowSecretKey(!showSecretKey)}
                                    >
                                        {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("form.helpers.secret_key")}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving || (!formData.stripe_public_key && !formData.stripe_secret_key)}
                                    className="bg-main-green hover:bg-main-green/70 cursor-pointer px-5 font-poppins rounded-full text-white"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {hasKeys ? t("form.buttons.update") : t("form.buttons.save")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={() => setFormData({ stripe_public_key: "", stripe_secret_key: "" })}
                                    disabled={saving}
                                    className="bg-main-blue cursor-pointer px-5 font-poppins rounded-full text-white"
                                >
                                    {t("form.buttons.clear")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {
                                t("help.title")
                            }
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <ul className="text-sm text-muted-foreground space-y-2">
                            {t.raw("help.steps")?.map((item: string, idx: number) => (
                                <li dangerouslySetInnerHTML={{ __html: item }} key={`432432432423-2434-${idx}`}>

                                </li>
                            ))}
                        </ul>
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                <strong>
                                    {t("alerts.important_notice.title")}
                                </strong>
                                {t("alerts.important_notice.description")}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </CardContent>

        </Card >
    )
}
