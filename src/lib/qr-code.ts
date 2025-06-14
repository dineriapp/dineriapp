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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const size = options.size || 300;
    const margin = options.margin || 20;
    const totalSize = size + (margin * 2);

    canvas.width = totalSize;
    canvas.height = totalSize + (options.includeFrame ? 60 : 0);

    // Generate base QR code
    const qrDataUrl = await this.generateBasicQR(url, {
      size,
      color: {
        dark: options.accentColor || '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction for logo overlay
    });

    return new Promise((resolve, reject) => {
      const qrImage = new Image();
      qrImage.onload = async () => {
        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code
        ctx.drawImage(qrImage, margin, margin, size, size);

        // Add logo if provided
        if (options.logoUrl) {
          try {
            await this.addLogoToQR(ctx, options.logoUrl, margin + size / 2, margin + size / 2, size * 0.2);
          } catch (error) {
            console.warn('Failed to add logo to QR code:', error);
          }
        }

        // Add frame text if requested
        if (options.includeFrame && options.frameText) {
          this.addFrameText(ctx, options.frameText, totalSize, margin + size + 20, options.accentColor);
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
    ctx.font = 'bold 16px Inter, sans-serif';
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

export const QR_CODE_TYPES = {
  RESTAURANT_PAGE: 'restaurant_page',
  MENU: 'menu',
  EVENTS: 'events',
  REVIEW: 'review',
  SOCIAL: 'social',
  CUSTOM: 'custom',
} as const;

export type QRCodeType = typeof QR_CODE_TYPES[keyof typeof QR_CODE_TYPES];

export interface QRCodeTemplate {
  id: string;
  name: string;
  description: string;
  frameText: string;
  type: QRCodeType;
  urlPattern: string; // e.g., "/{slug}", "/{slug}/menu"
}

export const QR_CODE_TEMPLATES: QRCodeTemplate[] = [
  {
    id: 'main-page',
    name: 'Restaurant Page',
    description: 'Main restaurant page with all links',
    frameText: 'Scan for Menu & More',
    type: QR_CODE_TYPES.RESTAURANT_PAGE,
    urlPattern: '/{slug}',
  },
  {
    id: 'menu-direct',
    name: 'Menu Direct',
    description: 'Direct access to digital menu',
    frameText: 'Scan for Menu',
    type: QR_CODE_TYPES.MENU,
    urlPattern: '/{slug}#menu',
  },
  {
    id: 'events',
    name: 'Events',
    description: 'View upcoming events',
    frameText: 'Scan for Events',
    type: QR_CODE_TYPES.EVENTS,
    urlPattern: '/{slug}#events',
  },
  {
    id: 'review',
    name: 'Leave Review',
    description: 'Quick access to leave a review',
    frameText: 'Scan to Leave Review',
    type: QR_CODE_TYPES.REVIEW,
    urlPattern: '/review/{slug}',
  },
  {
    id: 'instagram',
    name: 'Follow on Instagram',
    description: 'Direct link to Instagram profile',
    frameText: 'Follow Us on Instagram',
    type: QR_CODE_TYPES.SOCIAL,
    urlPattern: '{instagram_url}',
  },
];