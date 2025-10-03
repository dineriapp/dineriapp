import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"; // adjust paths
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface AddCategoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    restaurantId?: string | number;

    // state from parent
    categoryName: string;
    setCategoryName: (val: string) => void;
    categoryDescription: string;
    setCategoryDescription: (val: string) => void;
    showInQuickMenu: boolean;
    setShowInQuickMenu: (val: boolean) => void;

    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isPending?: boolean;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
    isOpen,
    onOpenChange,
    restaurantId,
    categoryName,
    setCategoryName,
    categoryDescription,
    setCategoryDescription,
    showInQuickMenu,
    setShowInQuickMenu,
    onSubmit,
    onCancel,
    isPending = false,
}) => {
    const t = useTranslations("MenuPage.AddCategoryDialog")
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    disabled={!restaurantId}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                >
                    <Plus className="h-4 w-4" />
                    {t("trigger")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {t("title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                {t("label.name")}
                            </Label>
                            <Input
                                id="name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder={t("placeholder.name")}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                {t("label.description")}
                            </Label>
                            <Textarea
                                id="description"
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
                                placeholder={t("placeholder.description")}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="showQuickMenu">
                                {t("label.showQuickMenu")}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {t("helperText.showQuickMenu")}
                            </p>
                            <Switch
                                id="showQuickMenu"
                                checked={showInQuickMenu}
                                onCheckedChange={setShowInQuickMenu}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="hover:opacity-75 cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                            disabled={isPending}
                        >
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!categoryName || isPending || !restaurantId}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                        >
                            {isPending ? t("buttons.adding") : t("buttons.addCategory")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCategoryDialog;
