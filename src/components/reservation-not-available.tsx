
import { Card, CardContent } from "@/components/ui/card"
import { Utensils } from "lucide-react"

export default function ReservationNotAvailable() {

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3 text-center">
                    {/* 404 Illustration */}
                    <div className="mb-4">
                        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <Utensils className="w-16 h-16 text-white" />
                        </div>
                        <div className="text-8xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            404
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h1>
                        <p className="text-lg text-gray-600 mb-2">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
