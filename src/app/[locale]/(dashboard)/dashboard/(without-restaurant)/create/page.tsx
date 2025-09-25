"use client";

import { createRestaurant } from "@/actions/create-restaurant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Check, Loader2, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Reuse the same schema for client-side validation



export default function CreateRestaurantPage() {
  const router = useRouter();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const t = useTranslations("CreateRestaurantPage")
  const f = useTranslations("CreateRestaurantPage.form")

  const formSchema = z.object({
    name: z
      .string()
      .min(1, f("errors.name_required"))
      .max(100),
    slug: z
      .string()
      .min(3, f("errors.slug_required"))
      .max(50)
      .regex(/^[a-z0-9-]+$/, f("errors.slug_invalid")),
    bio: z.string().max(200).optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    handleSubmit
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const name = watch("name");
  const slug = watch("slug");
  const bio = watch("bio", "");

  // Generate slug from name when name changes
  if (name && !isSlugManuallyEdited) {
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    if (generatedSlug !== slug) {
      setValue("slug", generatedSlug);
    }
  }
  const OnSubmit = (values: FormValues) => {
    console.log(values)
    setError("")
    startTransition(() => {
      const formdata = new FormData()
      formdata.append("name", values.name)
      formdata.append("slug", values.slug)
      formdata.append("bio", values.bio || "")

      createRestaurant(formdata).then((res) => {
        if (res?.error) {
          setError(res.error)
        } else {
          router.push("/dashboard")
        }
      })
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-[1200px] mx-auto px-4 py-10 lg:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {t("page.title")}
            </h1>
            <p className="mt-2 text-slate-600">
              {t("page.subtitle")}
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-teal-600">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">
                    {t("card.title")}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {t("card.description")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(OnSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    {f("labels.name")}
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder={f("placeholders.name")}
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 !h-[44px]"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-slate-700">
                    {f("labels.slug")}
                  </Label>
                  <div className="flex items-center">
                    <span className="text-slate-500 mr-2">dineri.app/</span>
                    <Input
                      id="slug"
                      {...register("slug")}
                      placeholder={f("placeholders.slug")}
                      className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 !h-[44px]"
                      onChange={(e) => {
                        setIsSlugManuallyEdited(true);
                        register("slug").onChange(e);
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-slate-500">
                      {f("help.slug")}
                    </p>
                    {errors.slug && (
                      <p className="text-xs text-red-500">{errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-700">
                    {f("labels.bio")}
                  </Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder={f("placeholders.bio")}
                    maxLength={200}
                    rows={3}
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 resize-none"
                  />
                  <div className="text-xs text-right text-slate-500">
                    {f("help.bio_count", { count: bio?.length || 0 })}
                  </div>
                </div>
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-slate-100 pt-6">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-200  bg-main-blue text-white !h-[44px] font-poppins !px-5 rounded-full hover:bg-main-blue/80"
                    onClick={() => router.push("/dashboard")}
                  >
                    {f("buttons.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-main-green rounded-full h-[44px] font-poppins cursor-pointer hover:bg-main-green/90"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {f("buttons.submitting")}
                      </>
                    ) : (
                      <span className="flex items-center">
                        {f("buttons.submit")}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>

          <div className="mt-8 rounded-lg border border-teal-100 bg-teal-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-teal-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-teal-800">
                  {t("tip.title")}
                </h3>
                <div className="mt-2 text-sm text-teal-700">
                  <p>
                    {t("tip.text")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}