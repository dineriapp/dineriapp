"use client";

import type { Faq, FaqCategory, SubscriptionPlan } from "@prisma/client";
import type React from "react";

import LoadingUI from "@/components/loading-ui";
import EditCategoryDialog from "@/components/pages/dashboard/faq/edit-category-dialog";
import EditFAQDialog from "@/components/pages/dashboard/faq/edit-faq-dialog";
import { FaqCategories } from "@/components/pages/dashboard/faq/faq-categories";
import { FaqCategoryActions } from "@/components/pages/dashboard/faq/faq-category-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Locale } from "@/i18n/routing";
import { useSession } from "@/lib/auth/auth-client";
import {
  useCreateFaq,
  useCreateFaqCategory,
  useDeleteFaq,
  useDeleteFaqCategory,
  useFaqCategories,
  useReorderFaq,
  useReorderFaqCategory,
  useUpdateFaq,
  useUpdateFaqCategory,
} from "@/lib/faq-queries";
import {
  faq_container_animation,
  faq_item_animation,
  FAQ_TEMPLATES,
} from "@/lib/reuseable-data";
import { isLimitReached, STRIPE_PLANS } from "@/lib/stripe-plans";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { useUpgradePopupStore } from "@/stores/upgrade-popup-store";
import { Eye, HelpCircle, Search, Star } from "lucide-react";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

// Animation variants

export default function FAQPage() {
  const { restaurants, selectedRestaurant } = useRestaurantStore();
  const { data: session } = useSession();

  const t = useTranslations("faqs");
  const locale = useLocale() as Locale;
  const openPopup = useUpgradePopupStore((state) => state.open);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [isAddFAQDialogOpen, setIsAddFAQDialogOpen] = useState(false);
  const [isEditFAQDialogOpen, setIsEditFAQDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | null>(
    null,
  );
  const [selectedFAQ, setSelectedFAQ] = useState<Faq | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newFAQQuestion, setNewFAQQuestion] = useState("");
  const [newFAQAnswer, setNewFAQAnswer] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const restaurantId = selectedRestaurant?.id;

  const {
    data: categories = [],
    isLoading,
    error,
  } = useFaqCategories(restaurantId);
  const createCategoryMutation = useCreateFaqCategory(restaurantId);
  const updateCategoryMutation = useUpdateFaqCategory(restaurantId);
  const deleteCategoryMutation = useDeleteFaqCategory(restaurantId);
  const reorderCategoryMutation = useReorderFaqCategory(restaurantId);
  const createFaqMutation = useCreateFaq(restaurantId);
  const updateFaqMutation = useUpdateFaq(restaurantId);
  const deleteFaqMutation = useDeleteFaq(restaurantId);
  const reorderFaqMutation = useReorderFaq(restaurantId);

  // Memoized filtered categories for better performance
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;

    return categories.filter((category) => {
      const categoryMatch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const faqMatch = category.faqs?.some(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      return categoryMatch || faqMatch;
    });
  }, [categories, searchTerm]);

  // Memoized statistics for better performance
  const statistics = useMemo(() => {
    const totalFAQs = categories.reduce(
      (total, cat) => total + (cat.faqs?.length || 0),
      0,
    );
    const featuredFAQs = categories.reduce(
      (total, cat) =>
        total + (cat.faqs?.filter((faq) => faq.is_featured).length || 0),
      0,
    );

    return {
      totalCategories: categories.length,
      totalFAQs,
      featuredFAQs,
    };
  }, [categories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !restaurantId) return false;

    try {
      await createCategoryMutation.mutateAsync({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });

      return true;
    } catch {
      return false;
    }
  };

  const handleEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newCategoryName.trim()) return;

    updateCategoryMutation.mutate(
      {
        id: selectedCategory.id,
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsEditCategoryDialogOpen(false);
          setSelectedCategory(null);
          setNewCategoryName("");
          setNewCategoryDescription("");
        },
      },
    );
  };

  const handleAddFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newFAQQuestion.trim() || !newFAQAnswer.trim())
      return;

    createFaqMutation.mutate({
      category_id: selectedCategory.id,
      question: newFAQQuestion.trim(),
      answer: newFAQAnswer.trim(),
      is_featured: isFeatured,
    });
  };

  useEffect(() => {
    if (createFaqMutation.isSuccess) {
      resetForm();
      setIsAddFAQDialogOpen(false);
    }
  }, [createFaqMutation.isSuccess]);

  const handleEditFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFAQ || !newFAQQuestion.trim() || !newFAQAnswer.trim()) return;

    updateFaqMutation.mutate(
      {
        id: selectedFAQ.id,
        question: newFAQQuestion.trim(),
        answer: newFAQAnswer.trim(),
        is_featured: isFeatured,
      },
      {
        onSuccess: () => {
          setIsEditFAQDialogOpen(false);
          setSelectedFAQ(null);
          setSelectedCategory(null);
          resetForm();
        },
      },
    );
  };

  const handleAddFromTemplate = async (templateCategory: any) => {
    if (!restaurantId) return;

    try {
      // First create the category
      const categoryResult = await createCategoryMutation.mutateAsync({
        name: templateCategory.category,
        description: templateCategory.description,
      });

      // Then add all FAQs to the category
      for (const [index, faq] of templateCategory.faqs.entries()) {
        await createFaqMutation.mutateAsync({
          category_id: categoryResult.id,
          question: faq.question,
          answer: faq.answer,
          is_featured: index === 0, // Make first FAQ featured
        });
      }
    } catch {
      // Error handling is done in the mutations
    }
  };

  const resetForm = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setNewFAQQuestion("");
    setNewFAQAnswer("");
    setIsFeatured(false);
    setSelectedCategory(null);
    setSelectedFAQ(null);
  };

  // Show loading state when FAQs are being fetched
  if (isLoading || !selectedRestaurant || !restaurants) {
    return <LoadingUI text={t("loading")} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto flex justify-center px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            {t("errorTitle")}
          </h2>
          <p className="text-slate-500">
            {t("errorMessage", { restaurantName: selectedRestaurant.name })}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  const isFaqCategoryLimitReached = isLimitReached({
    userPlan: session?.user?.subscription_plan as SubscriptionPlan,
    resourceType: "faq_categories",
    currentCount: categories.length,
  });

  return (
    <>
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-wrap"
        >
          <div>
            <h1 className=" text-4xl font-bold text-main-blue">
              {t("faqManagement")}
            </h1>
            <p className="mt-2 text-slate-500">
              {t.rich("createManageFaqs", {
                restaurantName: selectedRestaurant.name,
                b: (chunks) => <b>{chunks}</b>,
              })}
            </p>
          </div>

          <FaqCategoryActions
            prismaUser={session?.user}
            STRIPE_PLANS={STRIPE_PLANS}
            categories={categories}
            restaurantId={restaurantId}
            isFaqCategoryLimitReached={isFaqCategoryLimitReached}
            FAQ_TEMPLATES={FAQ_TEMPLATES[locale]}
            createCategoryMutation={createCategoryMutation}
            createFaqMutation={createFaqMutation}
            openPopup={openPopup}
            handleAddCategory={handleAddCategory}
            handleAddFromTemplate={handleAddFromTemplate}
            resetForm={resetForm}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newCategoryDescription={newCategoryDescription}
            setNewCategoryDescription={setNewCategoryDescription}
          />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={faq_container_animation}
          initial="hidden"
          animate="show"
          className="mb-8 grid gap-6 md:grid-cols-2 900:grid-cols-3"
        >
          <motion.div variants={faq_item_animation}>
            <Card className="bg-gradient-to-br box-shad-every-2 from-white to-white transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {t("totalCategories")}
                </CardTitle>
                <HelpCircle className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-700">
                  {statistics.totalCategories}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t("faqCategories")}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={faq_item_animation}>
            <Card className="bg-gradient-to-br box-shad-every-2 from-white to-white transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {t("totalFaqs")}
                </CardTitle>
                <Eye className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">
                  {statistics.totalFAQs}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t("questionsAnswered")}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={faq_item_animation}>
            <Card className="bg-gradient-to-br box-shad-every-2 from-white to-white transition-all hover:shadow-lg hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {t("featuredFaqs")}
                </CardTitle>
                <Star className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">
                  {statistics.featuredFAQs}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t("popularQuestions")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative bg-white rounded-full">
            <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 transition-all rounded-full focus:ring-2 font-poppins h-[50px] focus:ring-teal-500"
            />
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <FaqCategories
          filteredCategories={filteredCategories}
          categories={categories}
          prismaUser={session?.user}
          STRIPE_PLANS={STRIPE_PLANS}
          container={faq_container_animation}
          item={faq_item_animation}
          setSelectedCategory={setSelectedCategory}
          setNewCategoryName={setNewCategoryName}
          setNewCategoryDescription={setNewCategoryDescription}
          setIsEditCategoryDialogOpen={setIsEditCategoryDialogOpen}
          deleteCategoryMutation={deleteCategoryMutation}
          reorderCategoryMutation={reorderCategoryMutation}
          isAddFAQDialogOpen={isAddFAQDialogOpen}
          setIsAddFAQDialogOpen={setIsAddFAQDialogOpen}
          handleAddFAQ={handleAddFAQ}
          newFAQQuestion={newFAQQuestion}
          setNewFAQQuestion={setNewFAQQuestion}
          newFAQAnswer={newFAQAnswer}
          setNewFAQAnswer={setNewFAQAnswer}
          isFeatured={isFeatured}
          setIsFeatured={setIsFeatured}
          resetForm={resetForm}
          createFaqMutation={createFaqMutation}
          openPopup={openPopup}
          selectedCategory={selectedCategory}
          setSelectedFAQ={setSelectedFAQ}
          setIsEditFAQDialogOpen={setIsEditFAQDialogOpen}
          deleteFaqMutation={deleteFaqMutation}
          reorderFaqMutation={reorderFaqMutation}
          setSearchTerm={setSearchTerm}
        />
      </main>

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        open={isEditCategoryDialogOpen}
        setOpen={setIsEditCategoryDialogOpen}
        name={newCategoryName}
        setName={setNewCategoryName}
        description={newCategoryDescription}
        setDescription={setNewCategoryDescription}
        handleSubmit={handleEditCategory}
        resetForm={resetForm}
        isPending={updateCategoryMutation.isPending}
      />

      {/* Edit FAQ Dialog */}
      <EditFAQDialog
        open={isEditFAQDialogOpen}
        setOpen={setIsEditFAQDialogOpen}
        question={newFAQQuestion}
        setQuestion={setNewFAQQuestion}
        answer={newFAQAnswer}
        setAnswer={setNewFAQAnswer}
        isFeatured={isFeatured}
        setIsFeatured={setIsFeatured}
        handleEditFAQ={handleEditFAQ}
        resetForm={resetForm}
        isPending={updateFaqMutation.isPending}
      />
    </>
  );
}
