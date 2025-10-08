import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "next-intl"

interface EditCategoryDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    name: string
    setName: (value: string) => void
    description: string
    setDescription: (value: string) => void
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    resetForm: () => void
    isPending: boolean
}

export default function EditCategoryDialog({
    open,
    setOpen,
    name,
    setName,
    description,
    setDescription,
    handleSubmit,
    resetForm,
    isPending,
}: EditCategoryDialogProps) {
    const t = useTranslations("faqs.editCategoryDialog")
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
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
                            <Label htmlFor="editCategoryName">
                                {t("categoryNameLabel")}
                            </Label>
                            <Input
                                id="editCategoryName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editCategoryDescription">
                                {t("categoryDescriptionLabel")}
                            </Label>
                            <Textarea
                                id="editCategoryDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false)
                                resetForm()
                            }}
                            disabled={isPending}
                            className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name || isPending}
                            className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                        >
                            {isPending ? t("saving") : t("saveChanges")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
