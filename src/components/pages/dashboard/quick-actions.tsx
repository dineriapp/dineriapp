import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, QrCode, Settings, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const QuickActions = () => {
    const t = useTranslations("dashboard.quickActions")
    return (
        <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className='font-poppins'>
                <CardTitle className="text-slate-900">
                    {t("title")}
                </CardTitle>
                <CardDescription className="text-slate-500">
                    {t("description")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4">
                    <Link href="/dashboard/links">
                        <Button className="w-full justify-start !px-5 rounded-full font-poppins h-[44px] bg-[#009A5E] hover:bg-[#009A5E]/80 cursor-pointer hover:scale-[1.02] transition-all group">
                            <Plus className="h-4 w-4" />
                            {t("buttons.addNewLink")}
                        </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                        <Button
                            className="w-full justify-start hover:scale-[1.02] !px-5 rounded-full font-poppins cursor-pointer h-[44px] transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                            variant="outline"
                        >
                            <Settings className="h-4 w-4 " />
                            {t("buttons.editProfile")}
                        </Button>
                    </Link>
                    <Link href="/dashboard/qr-codes">
                        <Button
                            className="w-full justify-start hover:scale-[1.02] !px-5 rounded-full font-poppins h-[44px] cursor-pointer transition-all border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                            variant="outline"
                        >
                            <QrCode className="h-4 w-4 " />
                            {t("buttons.generateQrCode")}
                        </Button>
                    </Link>
                    <Link href="/dashboard/stats">
                        <Button
                            className="w-full justify-start hover:scale-[1.02] !px-5 rounded-full font-poppins h-[44px] transition-all cursor-pointer border-slate-200 text-slate-700 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50/50"
                            variant="outline"
                        >
                            <TrendingUp className="h-4 w-4 " />
                            {t("buttons.viewAnalytics")}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

export default QuickActions
