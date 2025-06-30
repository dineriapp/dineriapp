"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Save } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"

export default function ChangePasswordPage() {
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const handleInputChange = (setter: any, value: string) => {
        setter(value)
        setHasChanges(true)
    }

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            toast.error("All fields are required")
            return
        }

        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords don't match")
            return
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long")
            return
        }

        try {
            setSaving(true)
            await new Promise((resolve) => setTimeout(resolve, 1500))

            toast.success("Password changed successfully", {
                description: "Your password has been updated",
            })

            // Clear form
            setOldPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
            setHasChanges(false)
        } catch (error: any) {
            toast.error("Error changing password", {
                description: error.message || "An error occurred while changing your password",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleForgotPassword = () => {
        toast.info("Password reset email sent", {
            description: "Check your email for password reset instructions",
        })
    }

    return (
        <>
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="bg-gray-50/50">
                    <CardTitle className="text-gray-900">Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="old-password">Current Password</Label>
                        <Input
                            id="old-password"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => handleInputChange(setOldPassword, e.target.value)}
                            placeholder="Enter your current password"
                            className="focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => handleInputChange(setNewPassword, e.target.value)}
                            placeholder="Enter your new password"
                            className="focus:border-emerald-500 focus:ring-emerald-500"
                        />
                        <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                        <Input
                            id="confirm-new-password"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => handleInputChange(setConfirmNewPassword, e.target.value)}
                            placeholder="Confirm your new password"
                            className="focus:border-emerald-500 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <Button
                            variant="link"
                            onClick={handleForgotPassword}
                            className="text-emerald-600 hover:text-emerald-700 p-0"
                        >
                            Forgot Password?
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Floating Save Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: hasChanges ? 1 : 0,
                    y: hasChanges ? 0 : 20,
                }}
                className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 flex items-end sm:items-center sm:flex-row-reverse flex-col gap-2 sm:gap-4"
            >
                <div className="rounded-lg border bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>You have unsaved changes</span>
                    </div>
                </div>
                <Button
                    onClick={handleChangePassword}
                    disabled={saving || !hasChanges}
                    size="lg"
                    className="bg-emerald-600 shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Changing..." : "Change Password"}
                </Button>
            </motion.div>
        </>
    )
}
