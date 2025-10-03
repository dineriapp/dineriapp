import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useTranslations } from "next-intl"

interface EditCategoryDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    categoryName: string
    setCategoryName: (value: string) => void
    categoryDescription: string
    setCategoryDescription: (value: string) => void
    showInQuickMenu: boolean
    setShowInQuickMenu: (value: boolean) => void
    handleEditCategory: (e: React.FormEvent<HTMLFormElement>) => void
    resetForm: () => void
    setSelectedCategory: (value: any) => void
    isPending: boolean
}

export default function EditCategoryDialog({
    open,
    setOpen,
    categoryName,
    setCategoryName,
    categoryDescription,
    setCategoryDescription,
    showInQuickMenu,
    setShowInQuickMenu,
    handleEditCategory,
    resetForm,
    setSelectedCategory,
    isPending,
}: EditCategoryDialogProps) {
    const t = useTranslations("MenuPage.EditCategoryDialog")
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleEditCategory}>
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
                            <Label htmlFor="editName">
                                {t("label.name")}
                            </Label>
                            <Input
                                id="editName"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editDescription">
                                {t("label.description")}
                            </Label>
                            <Textarea
                                id="editDescription"
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
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
                            onClick={() => {
                                setOpen(false)
                                setSelectedCategory(null)
                                resetForm()
                            }}
                            className="hover:opacity-75 cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                            disabled={isPending}
                        >
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!categoryName || isPending}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                        >
                            {isPending ? t("buttons.saving") : t("buttons.saveChanges")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
