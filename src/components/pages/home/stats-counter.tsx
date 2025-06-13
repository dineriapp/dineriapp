"use client"

import { useEffect, useRef, useState } from "react"

interface StatsCounterProps {
    value: string
    label: string
}

export function StatsCounter({ value, label }: StatsCounterProps) {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 },
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [])

    return (
        <div ref={ref} className="text-center">
            <div
                className={`text-2xl font-bold text-slate-900 transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
            >
                {value}
            </div>
            <div className="text-sm text-slate-500">{label}</div>
        </div>
    )
}
