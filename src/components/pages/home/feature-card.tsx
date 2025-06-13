import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <div className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 text-teal-600 transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
            <p className="text-slate-600">{description}</p>
        </div>
    )
}
