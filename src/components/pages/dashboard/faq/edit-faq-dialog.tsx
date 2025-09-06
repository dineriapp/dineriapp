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
import { Switch } from "@/components/ui/switch"
import { Star } from "lucide-react"

interface EditFAQDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    question: string
    setQuestion: (value: string) => void
    answer: string
    setAnswer: (value: string) => void
    isFeatured: boolean
    setIsFeatured: (value: boolean) => void
    handleEditFAQ: (e: React.FormEvent<HTMLFormElement>) => void
    resetForm: () => void
    isPending: boolean
}

export default function EditFAQDialog({
    open,
    setOpen,
    question,
    setQuestion,
    answer,
    setAnswer,
    isFeatured,
    setIsFeatured,
    handleEditFAQ,
    resetForm,
    isPending,
}: EditFAQDialogProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl">
                <form onSubmit={handleEditFAQ}>
                    <DialogHeader>
                        <DialogTitle>Edit FAQ</DialogTitle>
                        <DialogDescription>Update the FAQ details</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="editFAQQuestion">Question</Label>
                            <Input
                                id="editFAQQuestion"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="editFAQAnswer">Answer</Label>
                            <Textarea
                                id="editFAQAnswer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editFeatured"
                                checked={isFeatured}
                                onCheckedChange={setIsFeatured}
                            />
                            <Label htmlFor="editFeatured" className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Mark as featured (show prominently)
                            </Label>
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
                            className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!question || !answer || isPending}
                            className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                        >
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
