import { NextResponse } from "next/server"

export type ApiResponse<T = any> = { data: T; error?: never } | { data?: never; error: string }

export function createSuccessResponse<T>(data: T) {
    return NextResponse.json({ data })
}

export function createErrorResponse(error: string, status = 500) {
    return NextResponse.json({ error }, { status })
}

// Helper function to format URL
export function formatUrl(url: string): string {
    const trimmedUrl = url.trim()
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        return `https://${trimmedUrl}`
    }
    return trimmedUrl
}
