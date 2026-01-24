"use client";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import JobListings from "@/app/[locale]/Data/job-data";
import FileDropzone from "@/components/shared/file-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Locale } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";



export default function JobForm({ id, title }: { id: number, title: string }) {
  const locale: Locale = useLocale() as Locale;
  const t = useTranslations("CareersSubPage.JobForm");
  const [filesUploading, setFilesUploading] = useState(false);

  const job = JobListings[locale]?.find((j) => j.id == id);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const applicationSchema = z.object({
    fullName: z.string().min(2, t("errors.fullNameMin")),
    email: z.string().email(t("errors.invalidEmail")),
    phone: z.string().min(10, t("errors.invalidPhone")),
    address: z.string().min(5, t("errors.addressMin")),
    city: z.string().min(2, t("errors.cityMin")),
    state: z.string().min(2, t("errors.stateMin")),
    zipCode: z.string().min(5, t("errors.zipCodeMin")),
    experience: z.string().min(1, t("errors.experienceRequired")),
    education: z.string().min(1, t("errors.educationRequired")),
    coverLetter: z.string().min(50, t("errors.coverLetterMin")),
    resume: z.string().url(t("errors.resumeRequired")),
    portfolio: z.string().url(t("errors.invalidUrl")).optional().or(z.literal("")),
    linkedIn: z.string().url(t("errors.invalidUrl")).optional().or(z.literal("")),
    github: z.string().url(t("errors.invalidUrl")).optional().or(z.literal("")),
    salaryExpectations: z.string().min(1, t("errors.salaryRequired")),
    noticePeriod: z.string().min(1, t("errors.noticePeriodRequired")),
    gender: z.string().min(1, t("errors.genderRequired")),
    ethnicity: z.string().optional(),
    veteranStatus: z.string().optional(),
    disability: z.string().optional(),
  });

  type ApplicationForm = z.infer<typeof applicationSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
  });

  if (!job) {
    notFound();
  }

  const onSubmit = async (data: ApplicationForm) => {
    try {
      const res = await fetch("/api/job-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, ...data }),
      });

      if (!res.ok) {
        throw new Error("Validation failed");
      }

      toast.success(t("toasts.applicationSuccess"));
      setIsSubmitted(true);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(t("toasts.applicationError"));
    }
  };


  return (
    <div className="min-h-screen ">
      <div className=" mx-auto lg:px-6 py-8">
        <div className="space-y-8">
          {/* Application Form Section */}
          <section id="apply" className="pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("applyFor", { title: job.title })}
            </h2>

            {isSubmitted ? (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Application Submitted!
                  {t("applicationSubmittedTitle")}
                </h3>
                <p className="text-green-700">
                  {t("applicationSubmittedText", { title: job.title, company: job.company })}
                </p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 bg-transparent">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-3" htmlFor="fullName">
                          {t("fields.fullName")} *
                        </Label>
                        <Input
                          id="fullName"
                          {...register("fullName")}
                          placeholder={t("placeholders.fullName")}
                          className="mt-1 h-[54px]  font-poppins"
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3" htmlFor="email">
                          {t("fields.email")} *
                        </Label>
                        <Input
                          id="email"
                          placeholder={t("placeholders.email")}
                          type="email"
                          {...register("email")}
                          className="mt-1 h-[54px]  font-poppins"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-3" htmlFor="phone">
                          {t("fields.phone")} *
                        </Label>
                        <Input
                          id="phone"
                          {...register("phone")}
                          placeholder={t("placeholders.phone")}
                          className="mt-1 h-[54px]  font-poppins"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3" htmlFor="experience">
                          {t("fields.experience")} *
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("experience", value, {
                              shouldValidate: true,
                            })
                          }
                          value={watch("experience")}
                        >
                          <SelectTrigger
                            id="experience"
                            className="mt-1 w-full !h-[54px] font-poppins"
                          >
                            <SelectValue
                              placeholder={t("select.experience.placeholder")}
                              className="" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">
                              {t("select.experience.options.0-1")}
                            </SelectItem>
                            <SelectItem value="2-3">
                              {t("select.experience.options.2-3")}
                            </SelectItem>
                            <SelectItem value="4-5">
                              {t("select.experience.options.4-5")}
                            </SelectItem>
                            <SelectItem value="6-10">
                              {t("select.experience.options.6-10")}
                            </SelectItem>
                            <SelectItem value="10+">
                              {t("select.experience.options.10+")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.experience && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.experience.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-3" htmlFor="education">
                          {t("fields.education")} *
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("education", value, {
                              shouldValidate: true,
                            })
                          }
                          value={watch("education")}
                        >
                          <SelectTrigger
                            id="education"
                            className="mt-1 w-full !h-[54px] font-poppins"
                          >
                            <SelectValue
                              placeholder={t("select.education.placeholder")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-school">
                              {t("select.education.options.high-school")}
                            </SelectItem>
                            <SelectItem value="associate">
                              {t("select.education.options.associate")}
                            </SelectItem>
                            <SelectItem value="bachelor">
                              {t("select.education.options.bachelor")}
                            </SelectItem>
                            <SelectItem value="master">
                              {t("select.education.options.master")}
                            </SelectItem>
                            <SelectItem value="phd">
                              {t("select.education.options.phd")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.education && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.education.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3" htmlFor="noticePeriod">
                          {t("fields.noticePeriod")} *
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue("noticePeriod", value, {
                              shouldValidate: true,
                            })
                          }
                          value={watch("noticePeriod")}
                        >
                          <SelectTrigger
                            id="noticePeriod"
                            className="mt-1 w-full !h-[54px] font-poppins"
                          >
                            <SelectValue
                              placeholder={t("select.noticePeriod.placeholder")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediately">
                              {t("select.noticePeriod.options.immediately")}
                            </SelectItem>
                            <SelectItem value="1-week">
                              {t("select.noticePeriod.options.1-week")}
                            </SelectItem>
                            <SelectItem value="2-weeks">
                              {t("select.noticePeriod.options.2-weeks")}
                            </SelectItem>
                            <SelectItem value="1-month">
                              {t("select.noticePeriod.options.1-month")}
                            </SelectItem>
                            <SelectItem value="2-months">
                              {t("select.noticePeriod.options.2-months")}
                            </SelectItem>
                            <SelectItem value="3-months">
                              {t("select.noticePeriod.options.3-months")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.noticePeriod && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.noticePeriod.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="  gap-4 w-full">
                      {/* Gender Field */}

                      <Label className="mb-3" htmlFor="gender">
                        {t("fields.gender")} *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("gender", value, { shouldValidate: true })
                        }
                        value={watch("gender")}
                      >
                        <SelectTrigger
                          id="gender"
                          className="mt-3 w-full !h-[54px] font-poppins"
                        >
                          <SelectValue
                            placeholder={t("select.gender.placeholder")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">
                            {t("select.gender.options.prefer-not-to-say")}
                          </SelectItem>
                          <SelectItem value="male">
                            {t("select.gender.options.male")}
                          </SelectItem>
                          <SelectItem value="female">
                            {t("select.gender.options.female")}
                          </SelectItem>
                          <SelectItem value="non-binary">
                            {t("select.gender.options.non-binary")}
                          </SelectItem>
                          <SelectItem value="other">
                            {t("select.gender.options.other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-3" htmlFor="address">
                        {t("fields.address")} *
                      </Label>
                      <Input
                        id="address"
                        {...register("address")}
                        className="mt-1 h-11"
                        placeholder={t("placeholders.address")}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="mb-3" htmlFor="city">
                          {t("fields.city")} *
                        </Label>
                        <Input
                          id="city"
                          {...register("city")}
                          placeholder={t("placeholders.city")}
                          className="mt-1 !h-[54px] font-poppins"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3" htmlFor="state">
                          {t("fields.state")} *
                        </Label>
                        <Input
                          id="state"
                          {...register("state")}
                          placeholder={t("placeholders.state")}
                          className="mt-1 !h-[54px] font-poppins"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.state.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3" htmlFor="zipCode">
                          {t("fields.zipCode")} *
                        </Label>
                        <Input
                          id="zipCode"
                          {...register("zipCode")}
                          placeholder={t("placeholders.zipCode")}
                          className="mt-1 !h-[54px] font-poppins"
                        />
                        {errors.zipCode && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-3" htmlFor="portfolio">
                          {t("fields.portfolio")}
                        </Label>
                        <Input
                          id="portfolio"
                          type="url"
                          placeholder={t("placeholders.portfolio")}
                          {...register("portfolio")}
                          className="mt-1 !h-[54px] font-poppins"
                        />
                        {errors.portfolio && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.portfolio.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3" htmlFor="linkedIn">
                          {t("fields.linkedin")}
                        </Label>
                        <Input
                          id="linkedIn"
                          type="url"
                          placeholder={t("placeholders.linkedin")}
                          {...register("linkedIn")}
                          className="mt-1 !h-[54px] font-poppins"
                        />
                        {errors.linkedIn && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.linkedIn.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-3" htmlFor="github">
                          {t("fields.github")}
                        </Label>
                        <Input
                          id="github"
                          type="url"
                          placeholder={t("placeholders.github")}
                          {...register("github")}
                          className="mt-1 !h-[54px] font-poppins"
                        />
                        {errors.github && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.github.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="mb-3" htmlFor="salaryExpectations">
                          {t("fields.salaryExpectations")} *
                        </Label>
                        <Input
                          id="salaryExpectations"
                          placeholder={t("placeholders.salary")}
                          {...register("salaryExpectations")}
                          className="mt-1 !h-[54px] font-poppins"
                        />
                        {errors.salaryExpectations && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.salaryExpectations.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3">
                        {t("fields.resume")} * {watch("resume") && (
                          <p className="text-sm text-muted-foreground">
                            <Check className="size-4 text-green-500" />
                          </p>
                        )}
                      </Label>

                      <FileDropzone
                        fileUploadDone={(urls) => {
                          // only 1 resume file
                          setValue("resume", urls[0], { shouldValidate: true });
                        }}
                        types=".pdf"
                        onUploadingChange={setFilesUploading}
                      />

                      {errors.resume && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.resume.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-3" htmlFor="coverLetter">
                        {t("fields.coverLetter")} *
                      </Label>
                      <Textarea
                        id="coverLetter"
                        placeholder={t("placeholders.coverLetter")}
                        {...register("coverLetter")}
                        className="mt-1 h-32 pt-4 font-poppins resize-none"
                      />
                      {errors.coverLetter && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.coverLetter.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting || filesUploading}
                        className="w-full bg-[#002147] hover:bg-main-hover/80 cursor-pointer transition-all font-poppins text-lg h-[60px] "
                      >
                        {isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
