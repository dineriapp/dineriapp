"use client"

import { UnsavedChangesPanel } from "@/components/pages/dashboard/unsaved-cahnges-penal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { Link } from "@/i18n/navigation"
import { changePassword } from "@/lib/auth/auth-client"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

interface PasswordFormData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

const initialFormData: PasswordFormData = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
}

export default function ChangePasswordPage() {
    const [formData, setFormData] = useState<PasswordFormData>(initialFormData)
    const [saving, setSaving] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<Partial<PasswordFormData>>({})
    const t = useTranslations("Settings.change-password")

    // Check if form has changes
    const hasChanges = Object.values(formData).some((value) => value.trim() !== "")

    const handleInputChange = (field: keyof PasswordFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<PasswordFormData> = {}

        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = t("form.errors.currentPassword_required")
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = t("form.errors.newPassword_required")
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = t("form.errors.newPassword_length")
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword =
                t("form.errors.newPassword_invalid")
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = t("form.errors.confirmPassword_required")
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = t("form.errors.confirmPassword_mismatch")
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = t("form.errors.newPassword_same_as_current")
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChangePassword = async () => {
        if (!validateForm()) {
            toast.error(t("toasts.fix_errors"))
            return
        }

        try {
            setSaving(true)

            // ✅ Better Auth: change password

            const { error } = await changePassword(
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                }
            )

            if (error) {
                throw error
            }

            toast.success(t("toasts.change_success_title"), {
                description: t("toasts.change_success_description"),
            })

            // Clear form
            setFormData(initialFormData)
            setErrors({})
        } catch (error: any) {
            console.error(t("toasts.change_error_title"), error)
            toast.error(t("toasts.change_error_title"), {
                description: error.message || t("toasts.change_error_description"),
            })
        } finally {
            setSaving(false)
        }
    }

    const handleResetForm = () => {
        setFormData(initialFormData)
        setErrors({})
        toast.success(t("toasts.form_reset_title"), {
            description: t("toasts.form_reset_description"),
        })
    }

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        if (password.length === 0) return { strength: 0, label: "", color: "" }

        let strength = 0
        if (password.length >= 8) strength += 25
        if (/[a-z]/.test(password)) strength += 25
        if (/[A-Z]/.test(password)) strength += 25
        if (/\d/.test(password)) strength += 25

        if (strength <= 25) return { strength, label: t("passwordStrength.weak"), color: "bg-red-500" }
        if (strength <= 50) return { strength, label: t("passwordStrength.fair"), color: "bg-orange-500" }
        if (strength <= 75) return { strength, label: t("passwordStrength.good"), color: "bg-yellow-500" }
        return { strength, label: t("passwordStrength.strong"), color: "bg-green-500" }
    }

    const passwordStrength = getPasswordStrength(formData.newPassword)

    return (
        <>
            <Card className=" border-gray-200 pt-0 box-shad-every-2 shadow-md">
                <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                    <div className="flex items-center gap-2">
                        <div>
                            <CardTitle className="text-gray-900">
                                {t("page.title")}
                            </CardTitle>
                            <CardDescription>
                                {t("page.description")}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label htmlFor="current-password">
                            {t("form.labels.currentPassword")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="current-password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                placeholder={t("form.placeholders.currentPassword")}
                                className={`pr-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.currentPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </Button>
                        </div>
                        {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword}</p>}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="new-password">
                            {t("form.labels.newPassword")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                placeholder={t("form.placeholders.newPassword")}
                                className={`pr-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </Button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        {t("passwordStrength.label")}
                                    </span>
                                    <span
                                        className={`font-medium ${passwordStrength.strength <= 25
                                            ? "text-red-600"
                                            : passwordStrength.strength <= 50
                                                ? "text-orange-600"
                                                : passwordStrength.strength <= 75
                                                    ? "text-yellow-600"
                                                    : "text-green-600"
                                            }`}
                                    >
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${passwordStrength.strength}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
                        <p className="text-xs text-muted-foreground">
                            {t("form.help.passwordRequirements")}
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                            {t("form.labels.confirmPassword")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                placeholder={t("form.placeholders.confirmPassword")}
                                className={`pr-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                                    }`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    {/* Forgot Password Link */}
                    <Link href={"/forgot-password"} className="flex justify-end pt-2">
                        <Button
                            variant="link"
                            className="text-emerald-600 hover:text-emerald-700 p-0 h-auto"
                        >
                            {t("links.forgotPassword")}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            {/* Floating Save Button */}
            <UnsavedChangesPanel
                hasChanges={hasChanges}
                saving={saving}
                resetForm={handleResetForm}
                saveSettings={handleChangePassword}
                UnsavedChangesUi={UnsavedChangesUi}
                ResetChangesBtnClasses={ResetChangesBtnClasses}
                SaveChangesBtnClasses={SaveChangesBtnClasses}
            />

        </>
    )
}
