"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Home, Utensils } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                    {/* 404 Illustration */}
                    <div className="mb-8">
                        <div className="text-8xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            404
                        </div>
                        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Utensils className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h1>
                        <p className="text-lg text-gray-600 mb-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
                        <p className="text-sm text-gray-500">Don&apos;t worry, let&apos;s get you back to managing your restaurant!</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-orange-50 hover:border-orange-300"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>

                        <Link href="/" className="w-full sm:w-auto">
                            <Button className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-blue-600 hover:to-teal-600 text-white shadow-lg">
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>
                    {/* Help Text */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                        <p className="text-sm text-orange-800">
                            <strong>Need help?</strong> If you believe this is an error, please contact our support team.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
