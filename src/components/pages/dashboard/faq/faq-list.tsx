import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Faq } from "@prisma/client"
import { ArrowDown, ArrowUp, Edit, Eye, HelpCircle, Star, Trash2 } from "lucide-react"

interface FaqListProps {
    faqs: Faq[]
    onEdit: (faq: Faq) => void
    onDelete: (faqId: string) => void
    onReorder: (faqId: string, direction: "up" | "down") => void
    isDeleting?: boolean
    isReordering?: boolean
}

export default function FaqList({
    faqs,
    onEdit,
    onDelete,
    onReorder,
    isDeleting = false,
    isReordering = false,
}: FaqListProps) {
    if (!faqs || faqs.length === 0) {
        return (
            <div className="py-8 text-center">
                <HelpCircle className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-slate-500 mb-4">No FAQs in this category yet</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {faqs.map((faq, index) => (
                <div
                    key={faq.id}
                    className="flex items-start gap-3 rounded-lg border bg-white/90 p-4 backdrop-blur-sm transition-all hover:shadow-md hover:scale-[1.01]"
                >
                    {/* FAQ Text */}
                    <div className="min-w-0 flex-grow">
                        <div className="mb-2 flex items-center gap-2">
                            <h4 className="text-sm font-medium">{faq.question}</h4>
                            {faq.is_featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500">{faq.answer}</p>
                        {faq.view_count && faq.view_count > 0 && (
                            <div className="mt-2 flex items-center gap-1">
                                <Eye className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-400">{faq.view_count} views</span>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-shrink-0 items-center gap-1">
                        {/* Edit */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(faq)}
                            className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                        >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit FAQ</span>
                        </Button>

                        {/* Delete */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete FAQ</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the FAQ &quot;{faq.question}&quot;. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="font-poppins rounded-full !px-5">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(faq.id)}
                                        className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Move up */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReorder(faq.id, "up")}
                            disabled={index === 0 || isReordering}
                            className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                        >
                            <ArrowUp className="h-4 w-4" />
                            <span className="sr-only">Move up</span>
                        </Button>

                        {/* Move down */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReorder(faq.id, "down")}
                            disabled={index === faqs.length - 1 || isReordering}
                            className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                        >
                            <ArrowDown className="h-4 w-4" />
                            <span className="sr-only">Move down</span>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
