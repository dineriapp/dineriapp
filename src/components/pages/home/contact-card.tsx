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
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-main-action/10 to-main/10 text-main-action">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-main">{title}</h3>
            <p className="text-main-text">{description}</p>
        </div>
    )

    if (link) {
        return (
            <Link
                href={link}
                className="rounded-xl border border-main-background bg-white shadow-sm transition-all hover:shadow-md hover:border-[#e2e8f0]"
            >
                <CardContent />
            </Link>
        )
    }

    return (
        <div className="rounded-xl border border-main-background bg-white shadow-sm">
            <CardContent />
        </div>
    )
}
