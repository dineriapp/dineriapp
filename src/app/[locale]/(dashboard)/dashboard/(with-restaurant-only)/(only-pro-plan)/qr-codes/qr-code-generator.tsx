"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLinks } from "@/lib/link-queries";
import { QRCodeGenerator } from "@/lib/qr-generator";
import { useCreateQRCode } from "@/lib/qr-queries";
import { Download, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";

interface QRCodeGeneratorProps {
  restaurant: any;
}

export function QRCodeGeneratorComponent({ restaurant }: QRCodeGeneratorProps) {
  const t = useTranslations("qr-codes-page.qrCodeGenerator");
  const [formData, setFormData] = useState({
    name: "",
    type: "restaurant_page" as "restaurant_page" | "link" | "custom",
    link_id: "",
    custom_url: "",
    size: 1000,
    color: "#000000",
    include_logo: true,
    include_frame: true,
    frame_text: t("form.frameTextPlaceholder"),
  });

  const { data: links } = useLinks(restaurant.id);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [currentuuid, setUID] = useState("");
  const createQRCodeMutation = useCreateQRCode(restaurant?.id || "");

  useEffect(() => {
    generatePreview();
  }, [formData, restaurant]);

  const generatePreview = async () => {
    if (!restaurant) return;

    setGenerating(true);
    const qrId = uuidv4();
    try {
      // Generate QR code image with scan URL
      const targetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/qr-codes/scan/${qrId}`;

      if (targetUrl) {
        // For preview, use the actual target URL instead of scan URL
        const dataUrl = await QRCodeGenerator.generateBrandedQR(targetUrl, {
          size: formData.size,
          accentColor: formData.color,
          logoUrl: formData.include_logo ? restaurant.logo_url : undefined,
          includeFrame: formData.include_frame,
          frameText: formData.include_frame ? formData.frame_text : undefined,
          restaurantName: restaurant.name,
        });
        setUID(qrId);
        setQrDataUrl(dataUrl);
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      // Fallback to basic QR code
      try {
        const targetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/qr-codes/scan/${qrId}`;

        if (targetUrl) {
          const basicQR = await QRCodeGenerator.generateBasicQR(targetUrl, {
            size: formData.size,
            color: {
              dark: formData.color,
              light: "#FFFFFF",
            },
          });
          setUID(qrId);
          setQrDataUrl(basicQR);
        }
      } catch (fallbackError) {
        console.error("Error generating fallback QR code:", fallbackError);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;

    if (!formData.name.trim()) {
      toast.error(t("errors.nameRequired"));
      return;
    }

    if (formData.type === "link" && !formData.link_id) {
      toast.error(t("errors.linkRequired"));
      return;
    }

    if (formData.type === "custom" && !formData.custom_url.trim()) {
      toast.error(t("errors.customUrlRequired"));
      return;
    }

    try {
      await createQRCodeMutation.mutateAsync({
        ...formData,
        dataUrl: qrDataUrl,
        id: currentuuid,
      });

      // Reset form
      setFormData({
        name: "",
        type: "restaurant_page",
        link_id: "",
        custom_url: "",
        size: 300,
        color: "#000000",
        include_logo: true,
        include_frame: false,
        frame_text: t("form.frameTextPlaceholder"),
      });
    } catch {
      // Error handling is done in the mutation
    }
  };

  const downloadPreview = () => {
    if (!qrDataUrl) {
      toast.error(t("preview.downloadError"));
      return;
    }

    const link = document.createElement("a");
    link.download = `${formData.name || "qr-code"}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("preview.downloadSuccess"));
  };

  return (
    <div className="grid gap-6 900:grid-cols-2">
      <Card className="pt-0">
        <CardHeader className="bg-gray-100/50 py-4 font-poppins">
          <CardTitle>{t("preview.title")}</CardTitle>
          <CardDescription>{t("preview.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("form.nameLabel")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("form.namePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t("form.typeLabel")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value,
                    link_id: "",
                    custom_url: "",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant_page">
                    {t("form.typeOptions.restaurant_page")}
                  </SelectItem>
                  <SelectItem value="link">
                    {t("form.typeOptions.link")}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t("form.typeOptions.custom")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "link" && (
              <div className="space-y-2 w-full">
                <Label htmlFor="link">{t("form.linkLabel")}</Label>
                <Select
                  value={formData.link_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, link_id: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.linkPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {links?.map((link) => (
                      <SelectItem key={link.id} value={link.id}>
                        {link.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === "custom" && (
              <div>
                <Label htmlFor="custom_url">{t("form.customUrlLabel")}</Label>
                <Input
                  id="custom_url"
                  type="url"
                  value={formData.custom_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      custom_url: e.target.value,
                    }))
                  }
                  placeholder={t("form.customUrlPlaceholder")}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {/* <div className="space-y-2 w-full">
                                <Label htmlFor="size">Size (px)</Label>
                                <Input
                                    id="size"
                                    type="number"
                                    min="100"
                                    max="1000"
                                    value={formData.size}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, size: Number.parseInt(e.target.value) }))}
                                />
                            </div> */}
              <div className="space-y-2 w-full">
                <Label htmlFor="color">{t("form.colorLabel")}</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include_logo"
                checked={formData.include_logo}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, include_logo: checked }))
                }
              />
              <Label htmlFor="include_logo">{t("form.includeLogo")}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include_frame"
                checked={formData.include_frame}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, include_frame: checked }))
                }
              />
              <Label htmlFor="include_frame">{t("form.includeFrame")}</Label>
            </div>

            {formData.include_frame && (
              <div>
                <Label htmlFor="frame_text" className="mb-2">
                  {t("form.frameTextLabel")}
                </Label>
                <Input
                  id="frame_text"
                  value={formData.frame_text}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      frame_text: e.target.value,
                    }))
                  }
                  placeholder={t("form.frameTextPlaceholder")}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-full font-poppins cursor-pointer h-[44px]"
              disabled={createQRCodeMutation.isPending}
            >
              {createQRCodeMutation.isPending
                ? t("form.submitting")
                : t("form.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full h-full pt-0">
        <CardHeader className="bg-gray-100/50 py-4 font-poppins">
          <CardTitle>{t("preview.title")}</CardTitle>
          <CardDescription>{t("preview.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 items-center space-y-4">
          {generating ? (
            <div className="flex items-center min-h-[360px] justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <QrCode className="mx-auto h-8 w-8 text-gray-400 animate-pulse" />
                <p className="mt-2 text-sm text-gray-500">
                  {t("preview.generating")}
                </p>
              </div>
            </div>
          ) : qrDataUrl ? (
            <div className="text-center min-h-[360px] ">
              <div className="w-full">
                <img
                  src={qrDataUrl || "/placeholder.svg"}
                  alt="QR Code Preview"
                  className="w-full border rounded-lg shadow-sm"
                  style={{
                    width: Math.min(formData.size, 300),
                    height: Math.min(formData.size, 300),
                  }}
                />
              </div>
              <div className="flex gap-2 mt-4 w-full">
                <Button
                  onClick={downloadPreview}
                  variant="default"
                  className="w-full cursor-pointer hover:bg-main-green/70 rounded-full bg-main-green text-white h-[44px]"
                >
                  <Download className="h-4 w-4" />
                  {t("preview.download")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center min-h-[360px] justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <QrCode className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {t("preview.empty")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
