"use client";

import { createRestaurant } from "@/actions/create-restaurant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Check, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Reuse the same schema for client-side validation
const formSchema = z.object({
  name: z.string().min(1, "Restaurant name is required").max(100),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  bio: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function SubmitButton({ loading }: { loading: boolean }) {

  return (
    <Button
      type="submit"
      className="flex-1 bg-gradient-to-r from-teal-600 !min-h-[44px] to-blue-600 hover:from-teal-700 hover:to-blue-700 group"
      disabled={loading}
    >
      {loading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Creating...
        </span>
      ) : (
        <span className="flex items-center">
          Create Restaurant Profile
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </span>
      )}
    </Button>
  );
}

export default function CreateRestaurantPage() {
  const router = useRouter();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

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
            <h1 className="text-3xl font-bold text-slate-900">Create Your Restaurant</h1>
            <p className="mt-2 text-slate-600">Set up your restaurant profile to get started with dineri.app</p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-blue-100 text-teal-600">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">Restaurant Details</CardTitle>
                  <CardDescription className="text-slate-500">
                    Tell us about your restaurant to create your profile
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit(OnSubmit)}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    Restaurant Name
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g. Trattoria Milano"
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 !h-[44px]"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-slate-700">
                    Page URL
                  </Label>
                  <div className="flex items-center">
                    <span className="text-slate-500 mr-2">dineri.app/</span>
                    <Input
                      id="slug"
                      {...register("slug")}
                      placeholder="your-restaurant"
                      className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 !h-[44px]"
                      required
                      onChange={(e) => {
                        setIsSlugManuallyEdited(true);
                        register("slug").onChange(e);
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-slate-500">
                      Only use letters, numbers, and hyphens
                    </p>
                    {errors.slug && (
                      <p className="text-xs text-red-500">{errors.slug.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-700">
                    Short Description
                  </Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell customers about your restaurant in a few words (max 200 characters)"
                    maxLength={200}
                    rows={3}
                    className="border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 resize-none"
                  />
                  <div className="text-xs text-right text-slate-500">
                    {bio?.length || 0}/200 characters
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
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-200 text-slate-700 !h-[44px] hover:bg-slate-50"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
                  </Button>
                  <SubmitButton loading={isPending} />
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
                <h3 className="text-sm font-medium text-teal-800">Pro Tip</h3>
                <div className="mt-2 text-sm text-teal-700">
                  <p>
                    Choose a memorable and easy-to-type URL for your restaurant. This will make it easier for customers
                    to find and share your profile.
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