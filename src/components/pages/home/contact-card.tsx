import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface ContactCardProps {
    icon: LucideIcon
    title: string
    description: string
    link?: string
}

export function ContactCard({ icon: Icon, title, description, link }: ContactCardProps) {
    const CardContent = () => (
        <div className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-teal-600">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-slate-600">{description}</p>
        </div>
    )

    if (link) {
        return (
            <Link
                href={link}
                className="rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300"
            >
                <CardContent />
            </Link>
        )
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <CardContent />
        </div>
    )
}
