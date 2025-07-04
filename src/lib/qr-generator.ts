import QRCode from 'qrcode';

export interface QRCodeOptions {
    size?: number;
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeGenerationOptions extends QRCodeOptions {
    restaurantName?: string;
    logoUrl?: string;
    accentColor?: string;
    includeFrame?: boolean;
    frameText?: string;
}

export class QRCodeGenerator {
    static async generateBasicQR(
        url: string,
        options: QRCodeOptions = {}
    ): Promise<string> {
        const defaultOptions = {
            width: options.size || 300,
            margin: options.margin || 2,
            color: {
                dark: options.color?.dark || '#000000',
                light: options.color?.light || '#FFFFFF',
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
        };

        try {
            return await QRCode.toDataURL(url, defaultOptions);
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    static async generateBrandedQR(
        url: string,
        options: QRCodeGenerationOptions = {}
    ): Promise<string> {
        const originalSize = options.size || 1000;
        const includeFrame = options.includeFrame || false;
        const frameHeight = includeFrame ? 80 : 0;

        const qrSize = includeFrame ? originalSize * 0.85 : originalSize;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        canvas.width = originalSize;
        canvas.height = originalSize + frameHeight;

        // Generate base QR code
        const qrDataUrl = await this.generateBasicQR(url, {
            size: qrSize,
            color: {
                dark: options.accentColor || '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H',
        });

        return new Promise((resolve, reject) => {
            const qrImage = new Image();
            qrImage.onload = async () => {
                // Fill background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw QR code
                const qrX = (canvas.width - qrSize) / 2;
                const qrY = (canvas.height - frameHeight - qrSize) / 2;
                ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

                // Add logo
                if (options.logoUrl) {
                    try {
                        await this.addLogoToQR(ctx, options.logoUrl, qrX + qrSize / 2, qrY + qrSize / 2, qrSize * 0.2);
                    } catch (error) {
                        console.warn('Failed to add logo to QR code:', error);
                    }
                }

                // Add frame text
                if (includeFrame && options.frameText) {
                    const textY = canvas.height - 80;
                    this.addFrameText(ctx, options.frameText, canvas.width, textY, options.accentColor);
                }

                resolve(canvas.toDataURL('image/png'));
            };

            qrImage.onerror = () => reject(new Error('Failed to load QR code image'));
            qrImage.src = qrDataUrl;
        });
    }
    private static async addLogoToQR(
        ctx: CanvasRenderingContext2D,
        logoUrl: string,
        centerX: number,
        centerY: number,
        logoSize: number
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const logoImage = new Image();
            logoImage.crossOrigin = 'anonymous';
            logoImage.onload = () => {
                // Create circular clipping path
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
                ctx.clip();

                // Fill white background
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                // Draw logo
                ctx.drawImage(
                    logoImage,
                    centerX - logoSize / 2,
                    centerY - logoSize / 2,
                    logoSize,
                    logoSize
                );

                ctx.restore();

                // Add border around logo
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(centerX, centerY, logoSize / 2 + 2, 0, 2 * Math.PI);
                ctx.stroke();

                resolve();
            };
            logoImage.onerror = () => reject(new Error('Failed to load logo'));
            logoImage.src = logoUrl;
        });
    }

    private static addFrameText(
        ctx: CanvasRenderingContext2D,
        text: string,
        canvasWidth: number,
        y: number,
        color?: string
    ): void {
        ctx.fillStyle = color || '#000000';
        ctx.font = 'bold 50px Inter';
        ctx.textAlign = 'center';

        ctx.fillText(text, canvasWidth / 2, y);
    }

    static downloadQRCode(dataUrl: string, filename: string = 'qr-code.png'): void {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static async generateMultipleFormats(
        url: string,
        options: QRCodeGenerationOptions = {}
    ): Promise<{
        png: string;
        svg: string;
        pdf?: string;
    }> {
        const png = await this.generateBrandedQR(url, options);

        // Generate SVG version
        const svg = await QRCode.toString(url, {
            type: 'svg',
            width: options.size || 300,
            margin: options.margin || 2,
            color: {
                dark: options.accentColor || '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        });

        return { png, svg };
    }
}
