import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface FaqTemplate {
    category: string;
    faqs: { question: string }[];
}

interface FaqCategoryActionsProps {
    prismaUser: any;
    STRIPE_PLANS: Record<string, any>;
    categories: any[];
    restaurantId?: string;
    isFaqCategoryLimitReached: boolean;

    // Templates
    FAQ_TEMPLATES: FaqTemplate[];

    // Mutations
    createCategoryMutation: { isPending: boolean };
    createFaqMutation: { isPending: boolean };

    // Popup handler
    openPopup: (msg: string) => void;

    // Add category handlers
    handleAddCategory: (e: React.FormEvent) => Promise<boolean>;
    handleAddFromTemplate: (template: FaqTemplate) => void;
    resetForm: () => void;

    // Form state
    newCategoryName: string;
    setNewCategoryName: (val: string) => void;
    newCategoryDescription: string;
    setNewCategoryDescription: (val: string) => void;
}

export const FaqCategoryActions = ({
    prismaUser,
    STRIPE_PLANS,
    categories,
    restaurantId,
    isFaqCategoryLimitReached,
    FAQ_TEMPLATES,
    createCategoryMutation,
    createFaqMutation,
    openPopup,
    handleAddCategory,
    handleAddFromTemplate,
    resetForm,
    newCategoryName,
    setNewCategoryName,
    newCategoryDescription,
    setNewCategoryDescription,
}: FaqCategoryActionsProps) => {
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
    const t = useTranslations("faqs.faqActions")
    const checkLimitAndPopup = () => {
        const plan = prismaUser?.subscription_plan ?? "basic";
        const limit = STRIPE_PLANS[plan].limits?.faqCategories;
        const planName = STRIPE_PLANS[plan].name;

        if (limit !== undefined && categories.length >= limit) {
            openPopup(
                `${t("limitReachedMessage", {
                    limit: limit,
                    planName: planName
                })}`
            );
            return true;
        }
        return false;
    };

    return (
        <div className="flex items-center gap-2">
            {/* Quick Setup */}
            {isFaqCategoryLimitReached ? (
                <Button
                    onClick={() => !checkLimitAndPopup()}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 text-main-blue hover:text-main-blue border-[1px] border-main-blue cursor-pointer hover:opacity-75 !bg-transparent rounded-full !px-5 font-poppins h-[42px]"
                >
                    <Lightbulb className="h-4 w-4" />
                    {t("quickSetup")}
                </Button>
            ) : (
                <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex items-center gap-2 text-main-blue hover:text-main-blue border-[1px] border-main-blue cursor-pointer hover:opacity-75 !bg-transparent rounded-full !px-5 font-poppins h-[42px]"
                        >
                            <Lightbulb className="h-4 w-4" />
                            {t("quickSetup")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden">
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle>
                                {t("quickSetupTitle")}
                            </DialogTitle>
                            <DialogDescription>
                                {t("quickSetupDescription")}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="grid gap-4 pr-2 md:grid-cols-1">
                                {FAQ_TEMPLATES.map((template, index) => (
                                    <Card
                                        key={index}
                                        className="cursor-pointer full py-4 h-full gap-1 transition-all hover:shadow-lg"
                                    >
                                        <CardHeader className="pb-3 gap-2 px-4">
                                            <CardTitle className="text-lg leading-[1.3]">
                                                {template.category}
                                            </CardTitle>
                                            <CardDescription>
                                                {t("commonQuestions", { count: template.faqs.length })}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0 flex px-4 flex-col h-full items-start justify-between">
                                            <div className="mb-4 space-y-1 pl-4">
                                                <ul className="list-disc">
                                                    {template.faqs.slice(0, 2).map((faq, faqIndex) => (
                                                        <li key={faqIndex} className="text-sm text-slate-500">
                                                            {faq.question}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {template.faqs.length > 2 && (
                                                    <p className="text-sm text-slate-500">
                                                        {t("moreQuestions", { count: template.faqs.length - 2 })}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-full">
                                                <Button
                                                    onClick={() => handleAddFromTemplate(template)}
                                                    className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                                                    disabled={createCategoryMutation.isPending || createFaqMutation.isPending}
                                                >
                                                    {createCategoryMutation.isPending || createFaqMutation.isPending
                                                        ? t("adding")
                                                        : t("addThisCategory")}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Add Category */}
            {isFaqCategoryLimitReached ? (
                <Button
                    size="lg"
                    disabled={!restaurantId}
                    onClick={() => !checkLimitAndPopup()}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                >
                    <Plus className="h-4 w-4" />
                    {t("addCategory")}
                </Button>
            ) : (
                <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="lg"
                            disabled={!restaurantId}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-75 !bg-main-blue rounded-full !px-5 font-poppins h-[42px]"
                        >
                            <Plus className="h-4 w-4" />
                            {t("addCategory")}

                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={async (e) => {
                            const success = await handleAddCategory(e)

                            if (success) {
                                setIsAddCategoryDialogOpen(false)
                                resetForm()
                            }
                        }}>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("addCategoryTitle")}
                                </DialogTitle>
                                <DialogDescription>
                                    {t("addCategoryDescription")}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="categoryName">
                                        {t("categoryNameLabel")}
                                    </Label>
                                    <Input
                                        id="categoryName"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder={t("categoryNamePlaceholder")}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoryDescription">
                                        {t("categoryDescriptionLabel")}
                                    </Label>
                                    <Textarea
                                        id="categoryDescription"
                                        value={newCategoryDescription}
                                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                                        placeholder={t("categoryDescriptionPlaceholder")}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddCategoryDialogOpen(false);
                                        resetForm();
                                    }}
                                    disabled={createCategoryMutation.isPending}
                                    className="hover:opacity-75 cursor-pointer h-[40px] rounded-full font-poppins !px-5"
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        !newCategoryName ||
                                        createCategoryMutation.isPending ||
                                        !restaurantId
                                    }
                                    className="hover:opacity-75 !bg-main-blue h-[40px] cursor-pointer rounded-full font-poppins !px-5"
                                >
                                    {createCategoryMutation.isPending ? t("addingCategory") : t("addCategory")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};
