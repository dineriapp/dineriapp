'use client'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { SubscriptionPlan } from '@/generated/prisma'
import { useUpgradePopupStore } from '@/stores/upgrade-popup-store'
import {
    CheckIcon
} from 'lucide-react'

export const UpgradePopup = () => {
    const { isOpen, message, close } = useUpgradePopupStore()

    if (!isOpen) return null

    // Mock pricing data
    const PLANS = [
        {
            plan: SubscriptionPlan.pro,
            name: 'Pro Plan',
            price: '$29/mo',
            features: ['Up to 20 links', 'Custom domains', 'Advanced analytics', 'Priority support'],
            cta: 'Upgrade to Pro'
        },
        {
            plan: SubscriptionPlan.enterprise,
            name: 'Enterprise Plan',
            price: 'Custom Pricing',
            features: ['Unlimited links', 'Dedicated account manager', 'Custom branding', 'API access'],
            cta: 'Contact Sales'
        }
    ]

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="sm:max-w-2xl p-0 border-0 bg-transparent">
                <Card className="bg-white dark:bg-gray-900 gap-2 rounded-xl shadow-2xl overflow-hidden">
                    <DialogHeader className="px-6 pb-0 pt-0">
                        <div className="flex justify-between items-center">
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                                Upgrade Your Plan
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="px-6 pb-2">
                        <p className="text-gray-600 dark:text-gray-300">{message}</p>
                    </div>

                    <Separator />

                    <div className="px-6 py-3 max-h-[60dvh] sm:max-h-[70dvh] overflow-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {PLANS.map((plan) => (
                                <Card
                                    key={plan.plan}
                                    className="border border-gray-200 gap-0 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                                <CardDescription className="mt-1">{plan.price}</CardDescription>
                                            </div>
                                            {plan.plan === SubscriptionPlan.pro && (
                                                <span className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                    POPULAR
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pb-4">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="bg-teal-500/10 p-1 rounded-full mr-3">
                                                        <CheckIcon className="h-4 w-4 text-teal-500" />
                                                    </div>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            size="lg"
                                            className={`w-full ${plan.plan === SubscriptionPlan.pro
                                                ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700'
                                                : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700'
                                                }`}
                                            onClick={() => {
                                                console.log(`Upgrading to ${plan.plan}`)
                                                close()
                                            }}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-4 text-center">
                            <Button
                                variant="link"
                                onClick={close}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Maybe later
                            </Button>
                        </div>
                    </div>
                </Card>
            </DialogContent>
        </Dialog>
    )
}