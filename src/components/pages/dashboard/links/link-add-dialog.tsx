import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"; // adjust paths
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ALL_ICON_SLUGS, getLucideIconBySlug, IconSlug } from "@/lib/get-icons";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

interface LinkDialogProps {
    type: "add" | "edit";
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    restaurantName: string;

    // values and setters from parent
    title: string;
    setTitle: (val: string) => void;
    url: string;
    setUrl: (val: string) => void;
    icon: IconSlug;
    setIcon: (val: IconSlug) => void;

    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isPending?: boolean;
    triggerButton?: React.ReactNode; // optional for "add" dialog
    disabled?: boolean;
}

const LinkDialog: React.FC<LinkDialogProps> = ({
    type,
    isOpen,
    onOpenChange,
    restaurantName,
    title,
    setTitle,
    url,
    setUrl,
    icon,
    setIcon,
    onCancel,
    onSubmit,
    isPending = false,
    triggerButton,
    disabled = false,
}) => {

    const t = useTranslations("LinksPage.LinkDialog")

    const renderTrigger = () => {
        if (type === "add") {
            return (
                <DialogTrigger asChild>
                    {triggerButton || (
                        <Button
                            size="lg"
                            disabled={disabled}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                        >
                            <Plus className="h-4 w-4" />
                            {t("trigger.addNewLink")}
                        </Button>
                    )}
                </DialogTrigger>
            );
        }
        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {renderTrigger()}
            <DialogContent>
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{type === "add" ? t("title.add") : t("title.edit")}</DialogTitle>
                        <DialogDescription>
                            {type === "add"
                                ? t("description.add", { restaurantName: restaurantName })
                                :
                                t("description.edit", { restaurantName: restaurantName })
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                {t("label.linkTitle")}
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("placeholder.linkTitle")}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url">
                                {t("label.url")}
                            </Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder={t("placeholder.url")}
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
                            onClick={onCancel}
                            className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                            disabled={isPending}
                        >
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || !url.trim() || isPending || (type === "add" && disabled)}
                            className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                        >
                            {isPending
                                ? type === "add"
                                    ? t("buttons.adding")
                                    : t("buttons.saving")
                                : type === "add"
                                    ? t("buttons.addLink")
                                    : t("buttons.saveChanges")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LinkDialog;
