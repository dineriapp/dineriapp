import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"

interface AddEventDialogProps {
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
    handleAddEvent: (e: React.FormEvent<HTMLFormElement>) => void
    resetForm: () => void
    isPending: boolean
}

export default function AddEventDialog({
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
    handleAddEvent,
    resetForm,
    isPending,
}: AddEventDialogProps) {
    const t = useTranslations("events.add_or_edit_events_dialog")
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                >
                    <Plus className="h-4 w-4" />
                    {t("dialog_add_title")}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleAddEvent}>
                    <DialogHeader>
                        <DialogTitle>
                            {t("dialog_add_title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("dialog_add_description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                {t("form_event_title")}
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t("form_event_title_placeholder")}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                {t("form_description")}
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t("form_description_placeholder")}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">
                                {t("form_date_time")}
                            </Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ticketUrl">
                                {t("form_ticket_link")}
                            </Label>
                            <Input
                                id="ticketUrl"
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
                                resetForm()
                            }}
                            className="hover:opacity-75 cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                            disabled={isPending}
                        >
                            {t("button_cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title || !date || isPending}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                        >
                            {isPending ? t("button_adding") : t("button_add_event")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
