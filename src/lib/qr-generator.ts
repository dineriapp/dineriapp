import QRCode from "qrcode"

export interface QRCodeOptions {
    size?: number
    margin?: number
    color?: {
        dark?: string
        light?: string
    }
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
}

export interface QRCodeGenerationOptions extends QRCodeOptions {
    restaurantName?: string
    logoUrl?: string
    accentColor?: string
    includeFrame?: boolean
    frameText?: string
}

export class QRCodeGenerator {
    static async generateQRCode(url: string, options: QRCodeOptions = {}): Promise<string> {
        try {
            const qrOptions = {
                width: options.size || 300,
                margin: options.margin || 2,
                color: {
                    dark: options.color?.dark || "#000000",
                    light: options.color?.light || "#FFFFFF",
                },
                errorCorrectionLevel: options.errorCorrectionLevel || ("M" as const),
            }

            const qrDataUrl = await QRCode.toDataURL(url, qrOptions)
            return qrDataUrl
        } catch (error) {
            console.error("Error generating QR code:", error)
            throw new Error("Failed to generate QR code")
        }
    }

    static async generateBrandedQRCode(url: string, options: QRCodeGenerationOptions = {}): Promise<string> {
        try {
            // First generate the basic QR code
            const qrDataUrl = await this.generateQRCode(url, {
                size: options.size || 300,
                margin: options.margin || 2,
                color: {
                    dark: options.accentColor || "#000000",
                    light: options.color?.light || "#FFFFFF",
                },
                errorCorrectionLevel: options.errorCorrectionLevel || "M",
            })

            // If no logo or frame is needed, return the basic QR code
            if (!options.logoUrl && !options.includeFrame) {
                return qrDataUrl
            }

            // Create a canvas to composite the QR code with logo and frame
            return await this.addBrandingToQR(qrDataUrl, options)
        } catch (error) {
            console.error("Error generating branded QR code:", error)
            throw new Error("Failed to generate branded QR code")
        }
    }

    private static async addBrandingToQR(qrDataUrl: string, options: QRCodeGenerationOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            if (!ctx) {
                reject(new Error("Canvas context not available"))
                return
            }

            const qrImage = new Image()
            qrImage.crossOrigin = "anonymous"

            qrImage.onload = async () => {
                try {
                    const size = options.size || 300
                    const frameHeight = options.includeFrame ? 60 : 0

                    canvas.width = size
                    canvas.height = size + frameHeight

                    // Draw QR code
                    ctx.drawImage(qrImage, 0, 0, size, size)

                    // Add logo if specified
                    if (options.logoUrl) {
                        await this.addLogoToCanvas(ctx, options.logoUrl, size)
                    }

                    // Add frame text if specified
                    if (options.includeFrame && options.frameText) {
                        this.addFrameToCanvas(ctx, options.frameText, size, options.accentColor)
                    }

                    resolve(canvas.toDataURL("image/png"))
                } catch (error) {
                    reject(error)
                }
            }

            qrImage.onerror = () => {
                reject(new Error("Failed to load QR code image"))
            }

            qrImage.src = qrDataUrl
        })
    }

    private static addLogoToCanvas(ctx: CanvasRenderingContext2D, logoUrl: string, qrSize: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const logo = new Image()
            logo.crossOrigin = "anonymous"

            logo.onload = () => {
                try {
                    const logoSize = qrSize * 0.2 // Logo should be 20% of QR code size
                    const logoX = (qrSize - logoSize) / 2
                    const logoY = (qrSize - logoSize) / 2

                    // Draw white background circle for logo
                    ctx.fillStyle = "#FFFFFF"
                    ctx.beginPath()
                    ctx.arc(qrSize / 2, qrSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI)
                    ctx.fill()

                    // Draw logo
                    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
                    resolve()
                } catch (error) {
                    reject(error)
                }
            }

            logo.onerror = () => {
                // If logo fails to load, continue without it
                resolve()
            }

            logo.src = logoUrl
        })
    }

    private static addFrameToCanvas(
        ctx: CanvasRenderingContext2D,
        frameText: string,
        qrSize: number,
        accentColor?: string,
    ): void {
        const frameHeight = 60
        const frameY = qrSize

        // Draw frame background
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, frameY, qrSize, frameHeight)

        // Draw frame text
        ctx.fillStyle = accentColor || "#000000"
        ctx.font = "bold 14px Arial, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Wrap text if too long
        const maxWidth = qrSize - 20
        const words = frameText.split(" ")
        let line = ""
        const lines: string[] = []

        for (const word of words) {
            const testLine = line + word + " "
            const metrics = ctx.measureText(testLine)

            if (metrics.width > maxWidth && line !== "") {
                lines.push(line.trim())
                line = word + " "
            } else {
                line = testLine
            }
        }
        lines.push(line.trim())

        // Draw lines
        const lineHeight = 18
        const startY = frameY + frameHeight / 2 - ((lines.length - 1) * lineHeight) / 2

        lines.forEach((line, index) => {
            ctx.fillText(line, qrSize / 2, startY + index * lineHeight)
        })
    }

    static downloadQRCode(dataUrl: string, filename = "qr-code.png"): void {
        const link = document.createElement("a")
        link.download = filename
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    static async convertToSVG(dataUrl: string): Promise<string> {
        // Convert PNG data URL to SVG (simplified version)
        // In a real implementation, you might want to use a library like canvas2svg
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                const svg = `
          <svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg">
            <image href="${dataUrl}" width="${img.width}" height="${img.height}"/>
          </svg>
        `
                const svgBlob = new Blob([svg], { type: "image/svg+xml" })
                const svgUrl = URL.createObjectURL(svgBlob)
                resolve(svgUrl)
            }
            img.src = dataUrl
        })
    }
}

export const QR_CODE_TYPES = {
    RESTAURANT_PAGE: "restaurant_page",
    MENU: "menu",
    EVENTS: "events",
    REVIEW: "review",
    SOCIAL: "social",
    CUSTOM: "custom",
} as const

export type QRCodeType = (typeof QR_CODE_TYPES)[keyof typeof QR_CODE_TYPES]

export interface QRCodeTemplate {
    id: string
    name: string
    description: string
    frameText: string
    type: QRCodeType
    urlPattern: string
}

export const QR_CODE_TEMPLATES: QRCodeTemplate[] = [
    {
        id: "main-page",
        name: "Restaurant Page",
        description: "Main restaurant page with all links",
        frameText: "Scan for Menu & More",
        type: QR_CODE_TYPES.RESTAURANT_PAGE,
        urlPattern: "/{slug}",
    },
    {
        id: "menu-direct",
        name: "Menu Direct",
        description: "Direct access to digital menu",
        frameText: "Scan for Menu",
        type: QR_CODE_TYPES.MENU,
        urlPattern: "/{slug}#menu",
    },
    {
        id: "events",
        name: "Events",
        description: "View upcoming events",
        frameText: "Scan for Events",
        type: QR_CODE_TYPES.EVENTS,
        urlPattern: "/{slug}#events",
    },
    {
        id: "review",
        name: "Leave Review",
        description: "Quick access to leave a review",
        frameText: "Scan to Leave Review",
        type: QR_CODE_TYPES.REVIEW,
        urlPattern: "/review/{slug}",
    },
    {
        id: "instagram",
        name: "Follow on Instagram",
        description: "Direct link to Instagram profile",
        frameText: "Follow Us on Instagram",
        type: QR_CODE_TYPES.SOCIAL,
        urlPattern: "{instagram_url}",
    },
]
