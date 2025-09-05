"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UnsavedChangesUi from "@/components/unsaved-changes-ui"
import { ResetChangesBtnClasses, SaveChangesBtnClasses } from "@/lib/utils"
import { supabase } from "@/supabase/clients/client"
import { Eye, EyeOff, Lock, RotateCcw, Save } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
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
            newErrors.currentPassword = "Current password is required"
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required"
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters long"
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword =
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your new password"
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = "New password must be different from current password"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChangePassword = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting")
            return
        }

        try {
            setSaving(true)

            // First, verify the current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: (await supabase.auth.getUser()).data.user?.email || "",
                password: formData.currentPassword,
            })

            if (signInError) {
                setErrors({ currentPassword: "Current password is incorrect" })
                toast.error("Current password is incorrect")
                return
            }

            // Update the password
            const { error: updateError } = await supabase.auth.updateUser({
                password: formData.newPassword,
            })

            if (updateError) {
                throw updateError
            }

            toast.success("Password changed successfully", {
                description: "Your password has been updated securely",
            })

            // Clear form
            setFormData(initialFormData)
            setErrors({})
        } catch (error: any) {
            console.error("Password change error:", error)
            toast.error("Failed to change password", {
                description: error.message || "An unexpected error occurred",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleResetForm = () => {
        setFormData(initialFormData)
        setErrors({})
        toast.success("Form reset", {
            description: "All fields have been cleared",
        })
    }

    // const handleForgotPassword = async () => {
    //     try {
    //         const {
    //             data: { user },
    //         } = await supabase.auth.getUser()

    //         if (!user?.email) {
    //             toast.error("Unable to send reset email")
    //             return
    //         }

    //         const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    //             redirectTo: `${window.location.origin}/forgot-password`,
    //         })

    //         if (error) {
    //             throw error
    //         }

    //         toast.success("Password reset email sent", {
    //             description: "Check your email for password reset instructions",
    //         })
    //     } catch (error: any) {
    //         console.error("Password reset error:", error)
    //         toast.error("Failed to send reset email", {
    //             description: error.message || "Please try again later",
    //         })
    //     }
    // }

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        if (password.length === 0) return { strength: 0, label: "", color: "" }

        let strength = 0
        if (password.length >= 8) strength += 25
        if (/[a-z]/.test(password)) strength += 25
        if (/[A-Z]/.test(password)) strength += 25
        if (/\d/.test(password)) strength += 25

        if (strength <= 25) return { strength, label: "Weak", color: "bg-red-500" }
        if (strength <= 50) return { strength, label: "Fair", color: "bg-orange-500" }
        if (strength <= 75) return { strength, label: "Good", color: "bg-yellow-500" }
        return { strength, label: "Strong", color: "bg-green-500" }
    }

    const passwordStrength = getPasswordStrength(formData.newPassword)

    return (
        <>
            <Card className=" border-gray-200 pt-0 box-shad-every-2 shadow-md">
                <CardHeader className="bg-gray-50/50 py-4 font-poppins">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-gray-600" />
                        <div>
                            <CardTitle className="text-gray-900">Change Password</CardTitle>
                            <CardDescription>Update your account password securely</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="current-password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                placeholder="Enter your current password"
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
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showNewPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                placeholder="Enter your new password"
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
                                    <span className="text-gray-600">Password strength:</span>
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
                            Password must be at least 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                placeholder="Confirm your new password"
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
                            Forgot your current password?
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Floating Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: hasChanges ? 1 : 0,
                    y: hasChanges ? 0 : 20,
                }}
                className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 flex items-end sm:items-center sm:flex-row-reverse flex-col gap-2 sm:gap-2"
            >
                <UnsavedChangesUi />
                <div className="flex gap-2">
                    <Button
                        onClick={handleResetForm}
                        disabled={saving || !hasChanges}
                        size="lg"
                        variant="outline"
                        className={ResetChangesBtnClasses}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleChangePassword}
                        disabled={saving || !hasChanges}
                        size="lg"
                        className={SaveChangesBtnClasses}
                    >
                        <Save className="h-4 w-4" />
                        {saving ? "Changing..." : "Change Password"}
                    </Button>
                </div>
            </motion.div>
        </>
    )
}
