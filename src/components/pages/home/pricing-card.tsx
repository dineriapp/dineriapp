import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface PricingCardProps {
    name: string
    price: string
    period?: string
    description: string
    features: string[]
    highlight?: boolean
}

export function PricingCard({ name, price, period, description, features, highlight = false }: PricingCardProps) {
    return (
        <div
            className={`relative rounded-xl p-8 transition-all duration-200 ${highlight
                    ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg shadow-blue-600/10 transform hover:-translate-y-1"
                    : "bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
        >
            {highlight && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-teal-500 px-3 py-1 text-xs font-medium text-white">
                    Most Popular
                </div>
            )}

            <h3 className="text-2xl font-bold">{name}</h3>

            <div className="my-4">
                <span className="text-4xl font-bold">{price}</span>
                {period && <span className={`text-sm ${highlight ? "text-white/80" : "text-slate-500"}`}>/{period}</span>}
            </div>

            <p className={`mb-6 ${highlight ? "text-white/90" : "text-slate-600"}`}>{description}</p>

            <ul className="mb-8 space-y-4">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <Check className={`h-5 w-5 ${highlight ? "text-teal-300" : "text-teal-500"}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Link href="/auth/signup">
                <Button
                    className={`w-full ${highlight
                            ? "bg-white text-blue-600 hover:bg-slate-100"
                            : "bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700"
                        }`}
                >
                    Get started
                </Button>
            </Link>
        </div>
    )
}
