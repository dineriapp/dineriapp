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

interface EditEventDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    setTitle: (value: string) => void
    description: string
    setDescription: (value: string) => void
    date: string
    setDate: (value: string) => void
    ticketUrl: string
    setTicketUrl: (value: string) => void
    handleUpdateEvent: (e: React.FormEvent<HTMLFormElement>) => void
    resetForm: () => void
    setEditingEvent: (value: any) => void
    isPending: boolean
}

export default function EditEventDialog({
    open,
    setOpen,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    ticketUrl,
    setTicketUrl,
    handleUpdateEvent,
    resetForm,
    setEditingEvent,
    isPending,
}: EditEventDialogProps) {
    const t = useTranslations("events.add_or_edit_events_dialog")

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleUpdateEvent}>
                    <DialogHeader>
                        <DialogTitle>
                            {t("dialog_edit_title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("dialog_edit_description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editTitle">
                                {t("form_event_title")}
                            </Label>
                            <Input
                                id="editTitle"
                                value={title}
                                placeholder={t("form_event_title_placeholder")}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editDescription">
                                {t("form_description")}
                            </Label>
                            <Textarea
                                id="editDescription"
                                placeholder={t("form_description_placeholder")}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editDate">
                                {t("form_date_time")}
                            </Label>
                            <Input
                                id="editDate"
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editTicketUrl">
                                {t("form_ticket_link")}
                            </Label>
                            <Input
                                id="editTicketUrl"
                                type="url"
                                value={ticketUrl}
                                onChange={(e) => setTicketUrl(e.target.value)}
                                placeholder={t("form_ticket_link_placeholder")}

                            />
                            <p className="text-xs text-muted-foreground">
                                {t("form_ticket_link_hint")}
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false)
                                setEditingEvent(null)
                                resetForm()
                            }}
                            className="hover:opacity-75 h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                            disabled={isPending}
                        >
                            {t("button_cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title || !date || isPending}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                        >
                            {isPending ? t("button_saving") : t("button_edit_save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
