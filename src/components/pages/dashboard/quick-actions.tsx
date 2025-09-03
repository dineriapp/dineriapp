import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, QrCode, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const QuickActions = () => {
    return (
        <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900">Quick Actions</CardTitle>
                <CardDescription className="text-slate-500">Common tasks and settings</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4">
                    <Link href="/dashboard/links">
                        <Button className="w-full justify-start bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-[1.02] transition-all group">
                            <Plus className="h-4 w-4 mr-2" />
                            Add new link
                        </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                        <Button
                            className="w-full justify-start hover:scale-[1.02] transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                            variant="outline"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Edit profile
                        </Button>
                    </Link>
                    <Link href="/dashboard/qr-codes">
                        <Button
                            className="w-full justify-start hover:scale-[1.02] transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                            variant="outline"
                        >
                            <QrCode className="h-4 w-4 mr-2" />
                            Generate QR code
                        </Button>
                    </Link>
                    <Link href="/dashboard/stats">
                        <Button
                            className="w-full justify-start hover:scale-[1.02] transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                            variant="outline"
                        >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View analytics
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default QuickActions
