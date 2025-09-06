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
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                >
                    <Plus className="h-4 w-4" />
                    Add Event
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleAddEvent}>
                    <DialogHeader>
                        <DialogTitle>Add Event</DialogTitle>
                        <DialogDescription>Create a new event for your restaurant</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Wine Tasting Night"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add details about your event"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date & Time</Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ticketUrl">Ticket Link (Optional)</Label>
                            <Input
                                id="ticketUrl"
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
                                resetForm()
                            }}
                            className="hover:opacity-75 cursor-pointer rounded-full h-[40px] font-poppins !px-5"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title || !date || isPending}
                            className="hover:opacity-75 !bg-main-blue cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                        >
                            {isPending ? "Adding..." : "Add Event"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
