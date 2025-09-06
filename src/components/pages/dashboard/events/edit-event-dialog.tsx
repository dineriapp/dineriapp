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
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleUpdateEvent}>
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogDescription>Update the event details</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editTitle">Event Title</Label>
                            <Input
                                id="editTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editDate">Date & Time</Label>
                            <Input
                                id="editDate"
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editTicketUrl">Ticket Link (Optional)</Label>
                            <Input
                                id="editTicketUrl"
                                type="url"
                                value={ticketUrl}
                                onChange={(e) => setTicketUrl(e.target.value)}
                                placeholder="https://ticketseller.com/your-event"
                            />
                            <p className="text-xs text-muted-foreground">
                                Add a link where customers can buy tickets
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
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title || !date || isPending}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                        >
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
