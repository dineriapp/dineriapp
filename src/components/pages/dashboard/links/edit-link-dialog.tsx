import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_ICON_SLUGS, getLucideIconBySlug, IconSlug } from "@/lib/get-icons";
import { useTranslations } from "next-intl";
import React from "react";

interface EditLinkDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    restaurantName: string;
    title?: string;
    setTitle: (value: string) => void;
    url?: string;
    setUrl: (value: string) => void;
    icon?: IconSlug;
    setIcon: (value: IconSlug) => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending?: boolean;
}

const EditLinkDialog: React.FC<EditLinkDialogProps> = ({
    isOpen,
    onOpenChange,
    restaurantName,
    title = "",
    setTitle,
    url,
    setUrl,
    icon = "link", // default icon slug
    setIcon,
    onCancel,
    onSubmit,
    isPending = false,
}) => {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(e);
    };
    const t = useTranslations("LinksPage.EditLinkDialog")
    const handleCancel = () => {
        onCancel();
        setTitle("");
        setUrl("");
        setIcon(icon);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {t("title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("description", { restaurantName: restaurantName })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">
                                {t("label.linkTitle")}
                            </Label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-url">
                                {t("label.url")}

                            </Label>
                            <Input
                                id="edit-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">
                                {t("label.icon")}
                            </Label>
                            <Select value={icon} onValueChange={(val) => setIcon(val as IconSlug)}>
                                <SelectTrigger id="icon" className="w-full">
                                    <SelectValue placeholder={t("placeholder.selectIcon")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {ALL_ICON_SLUGS.map((slug) => (
                                        <SelectItem key={slug} value={slug}>
                                            {getLucideIconBySlug(slug, { className: "w-4 h-4" })} {slug}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                            disabled={isPending}
                        >
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || !url?.trim() || isPending}
                            className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                        >
                            {isPending ? t("buttons.saving") : t("buttons.saveChanges")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditLinkDialog;
