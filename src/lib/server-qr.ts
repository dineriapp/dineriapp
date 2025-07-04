import QRCode from 'qrcode';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';

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


export class ServerQRCodeGenerator {
    static async generateBasicQR(url: string, options: QRCodeOptions = {}): Promise<string> {
        const buffer = await QRCode.toBuffer(url, {
            width: options.size || 300,
            margin: options.margin || 2,
            color: {
                dark: options.color?.dark || '#000000',
                light: options.color?.light || '#FFFFFF',
            },
            errorCorrectionLevel: options.errorCorrectionLevel || 'M',
        });

        const base64 = buffer.toString('base64');
        return `data:image/png;base64,${base64}`;
    }

    static async generateBrandedQR(url: string, options: QRCodeGenerationOptions = {}): Promise<string> {
        const originalSize = options.size || 1000;
        const includeFrame = options.includeFrame || false;
        const frameHeight = includeFrame ? 80 : 0;
        const qrSize = includeFrame ? originalSize * 0.85 : originalSize;

        const canvas = createCanvas(originalSize, originalSize + frameHeight);
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;

        const qrBuffer = await QRCode.toBuffer(url, {
            width: qrSize,
            color: {
                dark: options.accentColor || '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H',
        });

        const qrImage = await loadImage(qrBuffer);

        // Fill white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR
        const qrX = Math.round((canvas.width - qrSize) / 2);
        const qrY = Math.round((canvas.height - frameHeight - qrSize) / 2);
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        // Logo
        if (options.logoUrl) {
            try {
                await this.addLogo(ctx, options.logoUrl, qrX + qrSize / 2, qrY + qrSize / 2, qrSize * 0.2);
            } catch (e) {
                console.warn('Logo failed to load:', e);
            }
        }

        // Frame text
        if (includeFrame && options.frameText) {
            const textY = canvas.height - 80;
            this.addFrameText(ctx, options.frameText, canvas.width, textY, options.accentColor);
        }

        // Convert to data URL
        const buffer = canvas.toBuffer('image/png');
        const base64 = buffer.toString('base64');
        return `data:image/png;base64,${base64}`;
    }

    private static async addLogo(
        ctx: CanvasRenderingContext2D,
        logoUrl: string,
        centerX: number,
        centerY: number,
        size: number
    ) {
        const logoImage = await loadImage(logoUrl);

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, 2 * Math.PI);
        ctx.clip();

        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.drawImage(logoImage, centerX - size / 2, centerY - size / 2, size, size);

        ctx.restore();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2 + 2, 0, 2 * Math.PI);
        ctx.stroke();
    }

    private static addFrameText(
        ctx: CanvasRenderingContext2D,
        text: string,
        canvasWidth: number,
        y: number,
        color?: string
    ) {
        ctx.fillStyle = color || '#000000';
        ctx.font = 'bold 50px Sans';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvasWidth / 2, y);
    }
}
