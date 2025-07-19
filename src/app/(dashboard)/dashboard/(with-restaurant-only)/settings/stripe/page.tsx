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

export default function StripeSettingsPage() {
    const { selectedRestaurant: restaurant, initializeRestaurants } = useRestaurantStore()
    const { refetch } = useRestaurants()

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
            toast.error("Invalid Public Key", {
                description: "Stripe public key should start with 'pk_'",
            })
            return
        }

        if (formData.stripe_secret_key && !formData.stripe_secret_key.startsWith("sk_")) {
            toast.error("Invalid Secret Key", {
                description: "Stripe secret key should start with 'sk_'",
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
                throw new Error(data.error || "Failed to update Stripe settings")
            }

            toast.success("Success", {
                description: "Stripe settings updated successfully",
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
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to update Stripe settings",
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
                throw new Error(data.error || "Failed to remove Stripe keys")
            }

            toast.success("Success", {
                description: "Stripe keys removed successfully",
            })

            const result = await refetch()
            if (result.data?.restaurants) {
                initializeRestaurants(result.data.restaurants)
            }

        } catch (error) {
            console.error("Error removing Stripe keys:", error)
            toast.error("Error", {
                description: error instanceof Error ? error.message : "Failed to remove Stripe keys",
            })
        } finally {
            setSaving(false)
        }
    }

    if (!restaurant) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const hasKeys = restaurant.stripe_public_key_encrypted || restaurant.stripe_secret_key_encrypted || restaurant.stripe_webhook_secret_encrypted

    return (
        <Card className="shadow-sm border-gray-200 gap-5 pt-0">
            <CardHeader className="bg-gray-50/50 py-4">
                <CardTitle className="text-gray-900">Stripe Settings</CardTitle>
                <CardDescription>Configure your Stripe payment processing keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">

                {/* Security Notice */}
                <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Your keys are secure:</strong> We encrypt and store your Stripe keys using industry-standard
                        encryption. Your actual keys are never stored in plain text and cannot be viewed by anyone, including our
                        team.
                    </AlertDescription>
                </Alert>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Current Status
                            {hasKeys ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                            )}
                        </CardTitle>
                        <CardDescription>
                            {hasKeys ? "Stripe keys are configured and encrypted" : "No Stripe keys configured"}
                        </CardDescription>
                    </CardHeader>
                    {hasKeys && (
                        <CardContent>
                            <div className="space-y-2">
                                {(restaurant.stripe_public_key_encrypted || restaurant.stripe_secret_key_encrypted || restaurant.stripe_webhook_secret_encrypted) && (
                                    <div className="space-y-2">
                                        <div className={`flex items-center gap-2 text-sm ${restaurant.stripe_public_key_encrypted ? 'text-green-600' : 'text-red-600'}`}>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Public Key: {restaurant.stripe_public_key_encrypted ? 'Configured' : 'Not Configured'}</span>
                                        </div>

                                        <div className={`flex items-center gap-2 text-sm ${restaurant.stripe_secret_key_encrypted ? 'text-green-600' : 'text-red-600'}`}>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Secret Key: {restaurant.stripe_secret_key_encrypted ? 'Configured' : 'Not Configured'}</span>
                                        </div>

                                        <div className={`flex items-center gap-2 text-sm ${restaurant.stripe_webhook_secret_encrypted ? 'text-green-600' : 'text-red-600'}`}>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Webhook Secret: {restaurant.stripe_webhook_secret_encrypted ? 'Configured' : 'Not Configured'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveKeys}
                                disabled={saving}
                                className="mt-4 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Remove Keys
                            </Button>
                        </CardContent>
                    )}
                </Card>

                {/* Stripe Keys Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>{hasKeys ? "Update" : "Add"} Stripe Keys</CardTitle>
                        <CardDescription>
                            {hasKeys
                                ? "Enter new keys to update your current configuration"
                                : "Enter your Stripe API keys to enable payment processing"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="stripe_public_key">Stripe Publishable Key</Label>
                                <div className="relative">
                                    <Input
                                        id="stripe_public_key"
                                        type={showPublicKey ? "text" : "password"}
                                        value={formData.stripe_public_key}
                                        onChange={(e) => handleInputChange("stripe_public_key", e.target.value)}
                                        placeholder="pk_test_... or pk_live_..."
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
                                <p className="text-xs text-muted-foreground">This key is safe to use in your frontend code</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                                <div className="relative">
                                    <Input
                                        id="stripe_secret_key"
                                        type={showSecretKey ? "text" : "password"}
                                        value={formData.stripe_secret_key}
                                        onChange={(e) => handleInputChange("stripe_secret_key", e.target.value)}
                                        placeholder="sk_test_... or sk_live_..."
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
                                <p className="text-xs text-muted-foreground">This key must be kept secret and only used on the server</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving || (!formData.stripe_public_key && !formData.stripe_secret_key)}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {hasKeys ? "Update Keys" : "Save Keys"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData({ stripe_public_key: "", stripe_secret_key: "" })}
                                    disabled={saving}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>How to get your Stripe keys</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>
                                1. Log in to your{" "}
                                <a
                                    href="https://dashboard.stripe.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Stripe Dashboard
                                </a>
                            </p>
                            <p>
                                2. Navigate to <strong>Developers → API keys</strong>
                            </p>
                            <p>
                                3. Copy your <strong>Publishable key</strong> (starts with pk_)
                            </p>
                            <p>
                                4. Reveal and copy your <strong>Secret key</strong> (starts with sk_)
                            </p>
                            <p>
                                5. For live payments, make sure to use your <strong>live keys</strong> instead of test keys
                            </p>
                        </div>
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                <strong>Important:</strong> Never share your secret key publicly. Only enter it in secure, trusted
                                applications like this one.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </CardContent>

        </Card >
    )
}
