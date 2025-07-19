import { Card, CardContent } from "@/components/ui/card";

export default function OrderSuccessLoading() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
