import { motion } from "framer-motion";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    HelpCircle,
    Edit,
    Trash2,
    ArrowUp,
    ArrowDown,
    Plus,
    Star,
    Search,
} from "lucide-react";
import FaqList from "./faq-list";

// Types
interface FaqCategoriesProps {
    filteredCategories: any[];
    categories: any[];
    prismaUser: any;
    STRIPE_PLANS: Record<string, any>;
    container: any;
    item: any;
    setSelectedCategory: (cat: any) => void;
    setNewCategoryName: (name: string) => void;
    setNewCategoryDescription: (desc: string) => void;
    setIsEditCategoryDialogOpen: (open: boolean) => void;
    deleteCategoryMutation: any;
    reorderCategoryMutation: any;
    isAddFAQDialogOpen: boolean;
    setIsAddFAQDialogOpen: (open: boolean) => void;
    handleAddFAQ: (e: React.FormEvent) => void;
    newFAQQuestion: string;
    setNewFAQQuestion: (val: string) => void;
    newFAQAnswer: string;
    setNewFAQAnswer: (val: string) => void;
    isFeatured: boolean;
    setIsFeatured: (val: boolean) => void;
    resetForm: () => void;
    createFaqMutation: any;
    openPopup: (msg: string) => void;
    selectedCategory: any;
    setSelectedFAQ: (faq: any) => void;
    setIsEditFAQDialogOpen: (open: boolean) => void;
    deleteFaqMutation: any;
    reorderFaqMutation: any;
    setSearchTerm: (term: string) => void;
}

export const FaqCategories: React.FC<FaqCategoriesProps> = ({
    filteredCategories,
    categories,
    prismaUser,
    STRIPE_PLANS,
    container,
    item,
    setSelectedCategory,
    setNewCategoryName,
    setNewCategoryDescription,
    setIsEditCategoryDialogOpen,
    deleteCategoryMutation,
    reorderCategoryMutation,
    isAddFAQDialogOpen,
    setIsAddFAQDialogOpen,
    handleAddFAQ,
    newFAQQuestion,
    setNewFAQQuestion,
    newFAQAnswer,
    setNewFAQAnswer,
    isFeatured,
    setIsFeatured,
    resetForm,
    createFaqMutation,
    openPopup,
    selectedCategory,
    setSelectedFAQ,
    setIsEditFAQDialogOpen,
    deleteFaqMutation,
    reorderFaqMutation,
    setSearchTerm,
}) => {
    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {filteredCategories.length > 0 ? (
                filteredCategories.map((category, categoryIndex) => {
                    const plan = prismaUser?.subscription_plan ?? "basic";
                    const planName = STRIPE_PLANS[plan].name;
                    const faqLimit = STRIPE_PLANS[plan].limits?.faqsPerCategory ?? Infinity;
                    const isLimited = (category.faqs?.length ?? 0) >= faqLimit;

                    return (
                        <motion.div key={category.id} variants={item} className="space-y-4">
                            <Card className="bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <HelpCircle className="h-5 w-5 text-teal-600" />
                                            {category.name}
                                            <span className="ml-2 rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
                                                {category.faqs?.length || 0} FAQs
                                            </span>
                                        </CardTitle>
                                        {category.description && (
                                            <CardDescription>{category.description}</CardDescription>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Edit Category */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setNewCategoryName(category.name);
                                                setNewCategoryDescription(category.description || "");
                                                setIsEditCategoryDialogOpen(true);
                                            }}
                                            className="h-8 w-8 p-0 bg-main-blue text-white hover:text-white hover:bg-main-blue/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                        >
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit category</span>
                                        </Button>

                                        {/* Delete Category */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 bg-destructive text-white hover:text-white hover:bg-destructive/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                                    disabled={deleteCategoryMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete category</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the category &quot;{category.name}&quot; and all its FAQs ({
                                                            category.faqs?.length || 0
                                                        } questions). This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="font-poppins rounded-full !px-5">
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                                                        className="bg-destructive text-white font-poppins rounded-full !px-5 hover:opacity-80 hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        {/* Reorder Buttons */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => reorderCategoryMutation.mutate({ categoryId: category.id, direction: "up" })}
                                            disabled={categoryIndex === 0 || reorderCategoryMutation.isPending}
                                            className="h-8 w-8 p-0 bg-main-green text-white hover:text-white hover:bg-main-green/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                            <span className="sr-only">Move up</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => reorderCategoryMutation.mutate({ categoryId: category.id, direction: "down" })}
                                            disabled={categoryIndex === filteredCategories.length - 1 || reorderCategoryMutation.isPending}
                                            className="h-8 w-8 p-0 bg-main-text text-white hover:text-white hover:bg-main-text/70 cursor-pointer rounded-full transition-transform hover:scale-110"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                            <span className="sr-only">Move down</span>
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">
                                        {isLimited ? (
                                            <Button
                                                variant="outline"
                                                className="w-full justify-center transition-all rounded-full border-main-blue font-poppins h-[40px] hover:text-white hover:bg-main-blue cursor-pointer bg-transparent"
                                                onClick={() =>
                                                    openPopup(
                                                        `You are limited to ${faqLimit} FAQs per category on the ${planName} plan. Upgrade to Pro or Enterprise to add more.`
                                                    )
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add FAQ to {category.name}
                                            </Button>
                                        ) : (
                                            <Dialog open={isAddFAQDialogOpen} onOpenChange={setIsAddFAQDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-center transition-all rounded-full border-main-blue font-poppins h-[40px] hover:text-white hover:bg-main-blue cursor-pointer bg-transparent"
                                                        onClick={() => setSelectedCategory(category)}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add FAQ to {category.name}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <form onSubmit={handleAddFAQ}>
                                                        <DialogHeader>
                                                            <DialogTitle>Add FAQ</DialogTitle>
                                                            <DialogDescription>
                                                                Add a new question and answer to {selectedCategory?.name}
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="faqQuestion">Question</Label>
                                                                <Input
                                                                    id="faqQuestion"
                                                                    value={newFAQQuestion}
                                                                    onChange={(e) => setNewFAQQuestion(e.target.value)}
                                                                    placeholder="e.g. Do you take reservations?"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="faqAnswer">Answer</Label>
                                                                <Textarea
                                                                    id="faqAnswer"
                                                                    value={newFAQAnswer}
                                                                    onChange={(e) => setNewFAQAnswer(e.target.value)}
                                                                    placeholder="Provide a clear and helpful answer"
                                                                    rows={4}
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                                                                <Label htmlFor="featured" className="flex items-center gap-2">
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
                                                                    setIsAddFAQDialogOpen(false);
                                                                    resetForm();
                                                                }}
                                                                className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                                                                disabled={createFaqMutation.isPending}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                disabled={!newFAQQuestion || !newFAQAnswer || createFaqMutation.isPending || !selectedCategory}
                                                                className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                                                            >
                                                                {createFaqMutation.isPending ? "Adding..." : "Add FAQ"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        {/* FAQ List */}
                                        <FaqList
                                            faqs={category.faqs}
                                            onEdit={(faq) => {
                                                setSelectedCategory(category);
                                                setSelectedFAQ(faq);
                                                setNewFAQQuestion(faq.question);
                                                setNewFAQAnswer(faq.answer);
                                                setIsFeatured(faq.is_featured);
                                                setIsEditFAQDialogOpen(true);
                                            }}
                                            onDelete={(faqId) => deleteFaqMutation.mutate(faqId)}
                                            onReorder={(faqId, direction) => reorderFaqMutation.mutate({ faqId, direction })}
                                            isDeleting={deleteFaqMutation.isPending}
                                            isReordering={reorderFaqMutation.isPending}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })
            ) : categories.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-16 text-center">
                    <HelpCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">No FAQs yet</h3>
                    <p className="mb-6 text-slate-500 max-w-[330px] mx-auto">
                        Get started by adding FAQ categories or using our quick setup templates
                    </p>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center">
                    <Search className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">No results found</h3>
                    <p className="text-slate-500">
                        Try adjusting your search terms or {" "}
                        <button onClick={() => setSearchTerm("")} className="text-teal-600 hover:underline">
                            clear the search
                        </button>
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};
