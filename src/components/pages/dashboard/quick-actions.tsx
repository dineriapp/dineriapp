import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { useSession } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { Plus, QrCode, Settings, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

const QuickActions = () => {
    const t = useTranslations("dashboard.quickActions")
    const { data: session } = useSession()

    const isPro = session?.user.subscription_plan !== "basic"

    return (
        <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="font-poppins">
                <CardTitle className="text-slate-900">{t("title")}</CardTitle>
                <CardDescription className="text-slate-500">
                    {t("description")}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 gap-4">

                    <Link href="/dashboard/links">
                        <Button className="w-full justify-start !px-5 rounded-full font-poppins h-[44px] bg-[#009A5E] hover:bg-[#009A5E]/80 hover:scale-[1.02] transition-all">
                            <Plus className="h-4 w-4" />
                            {t("buttons.addNewLink")}
                        </Button>
                    </Link>

                    <Link href="/dashboard/settings">
                        <Button
                            variant="outline"
                            className="w-full justify-start hover:scale-[1.02] !px-5 rounded-full font-poppins h-[44px]"
                        >
                            <Settings className="h-4 w-4" />
                            {t("buttons.editProfile")}
                        </Button>
                    </Link>

                    {/* QR CODE */}
                    <Link href={isPro ? "/dashboard/qr-codes" : "#"} className={cn(!isPro && "cursor-not-allowed!")}>
                        <Button
                            variant="outline"
                            disabled={!isPro}
                            className={cn("relative w-full justify-start hover:scale-[1.02] !px-5 rounded-full font-poppins h-[44px]", !isPro && "cursor-not-allowed!")}
                        >
                            {!isPro && (
                                <div className="absolute right-2 bg-[#f4b400] text-white text-[10px] px-1 py-[1px] rounded font-semibold">
                                    PRO
                                </div>
                            )}
                            <QrCode className="h-4 w-4" />
                            {t("buttons.generateQrCode")}
                        </Button>
                    </Link>

                    {/* ANALYTICS */}
                    <Link href={isPro ? "/dashboard/stats" : "#"} className={cn(!isPro && "cursor-not-allowed!")}>
                        <Button
                            variant="outline"
                            disabled={!isPro}
                            className={cn("relative w-full justify-start hover:scale-[1.02] !px-5 rounded-full font-poppins h-[44px]", !isPro && "cursor-not-allowed!")}
                        >
                            {!isPro && (
                                <div className="absolute right-2 bg-[#f4b400] text-white text-[10px] px-1 py-[1px] rounded font-semibold">
                                    PRO
                                </div>
                            )}
                            <TrendingUp className="h-4 w-4" />
                            {t("buttons.viewAnalytics")}
                        </Button>
                    </Link>

                </div>
            </CardContent>
        </Card>
    )
}

export default QuickActions
