import Image from "next/image"
import { Star } from "lucide-react"

interface TestimonialCardProps {
    name: string
    role: string
    image: string
    content: string
    rating: number
}

export function TestimonialCard({ name, role, image, content, rating }: TestimonialCardProps) {
    return (
        <div className="rounded-xl border border-main-action bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex items-center gap-4">
                <Image src={image || "/placeholder.svg"} alt={name} width={50} height={50} className="rounded-full" />
                <div>
                    <h3 className="font-semibold text-slate-900">{name}</h3>
                    <p className="text-sm text-slate-500">{role}</p>
                </div>
            </div>

            <div className="mb-4 flex">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                ))}
            </div>

            <blockquote className="text-slate-600">&quot;{content}&quot;</blockquote>
        </div>
    )
}
