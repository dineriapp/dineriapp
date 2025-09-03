"use client";

import type React from "react";

import { Upload } from "lucide-react";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobListings from "@/app/Data/job-data";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your complete address"),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  zipCode: z.string().min(5, "Please enter a valid zip code"),
  experience: z.string().min(1, "Please select your experience level"),
  education: z.string().min(1, "Please select your education level"),
  coverLetter: z
    .string()
    .min(50, "Cover letter must be at least 50 characters"),
  resume: z.instanceof(File, { message: "Resume is required" }),
  portfolio: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  linkedIn: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  github: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  salaryExpectations: z
    .string()
    .min(1, "Please enter your salary expectations"),
  noticePeriod: z.string().min(1, "Please select your notice period"),
  gender: z.string().min(1, "Please select your gender"),
  ethnicity: z.string().optional(),
  veteranStatus: z.string().optional(),
  disability: z.string().optional(),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function JobForm({ id }: { id: number }) {
  const job = JobListings.find((j) => j.id == id);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    console.log("Application submitted:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Application submitted successfully!");
    setIsSubmitted(true);
    reset();
    setSelectedFile(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // This is the key fix - you need to set the value in the form
      setValue("resume", file, { shouldValidate: true });
    } else {
      // Clear the file if no file is selected
      setSelectedFile(null);
      setValue("resume", undefined as any, { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto lg:px-6 py-8">
        <div className="space-y-8">
          {/* Application Form Section */}
          <section id="apply" className="pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Apply for {job.title}
            </h2>

            {isSubmitted ? (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Application Submitted!
                </h3>
                <p className="text-green-700">
                  Thank you for applying to the {job.title} position at{" "}
                  {job.company}. We&apos;ve received your application and will
                  review it carefully. If your qualifications match our needs,
                  we&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 bg-transparent">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-3" htmlFor="fullName">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          {...register("fullName")}
                          placeholder="Full Name"
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
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          placeholder="example@example.com"
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
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          {...register("phone")}
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
                          Years of Experience *
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
                            <SelectValue placeholder="Select experience" className="" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="2-3">2-3 years</SelectItem>
                            <SelectItem value="4-5">4-5 years</SelectItem>
                            <SelectItem value="6-10">6-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
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
                          Education Level *
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
                            <SelectValue placeholder="Select education" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high-school">
                              High School
                            </SelectItem>
                            <SelectItem value="associate">
                              Associate Degree
                            </SelectItem>
                            <SelectItem value="bachelor">
                              Bachelor&apos;s Degree
                            </SelectItem>
                            <SelectItem value="master">
                              Master&apos;s Degree
                            </SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
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
                          Notice Period *
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
                            <SelectValue placeholder="Select notice period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediately">
                              Immediately
                            </SelectItem>
                            <SelectItem value="1-week">1 week</SelectItem>
                            <SelectItem value="2-weeks">2 weeks</SelectItem>
                            <SelectItem value="1-month">1 month</SelectItem>
                            <SelectItem value="2-months">2 months</SelectItem>
                            <SelectItem value="3-months">3 months</SelectItem>
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
                        Gender
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
                          <SelectValue placeholder="Prefer not to say" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-3" htmlFor="address">
                        Address *
                      </Label>
                      <Input
                        id="address"
                        {...register("address")}
                        className="mt-1 h-11"
                        placeholder="Street address"
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
                          City *
                        </Label>
                        <Input
                          id="city"
                          {...register("city")}
                          placeholder="City Name"
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
                          State *
                        </Label>
                        <Input
                          id="state"
                          {...register("state")}
                          placeholder="State Name"
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
                          ZIP Code *
                        </Label>
                        <Input
                          id="zipCode"
                          {...register("zipCode")}
                          placeholder="ZipCode"
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
                          Portfolio URL (Optional)
                        </Label>
                        <Input
                          id="portfolio"
                          type="url"
                          placeholder="https://your-portfolio.com"
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
                          LinkedIn Profile (Optional)
                        </Label>
                        <Input
                          id="linkedIn"
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
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
                          GitHub Profile (Optional)
                        </Label>
                        <Input
                          id="github"
                          type="url"
                          placeholder="https://github.com/yourusername"
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
                          Salary Expectations *
                        </Label>
                        <Input
                          id="salaryExpectations"
                          placeholder="e.g. $80,000 - $100,000"
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
                      <Label className="mb-3" htmlFor="resume">
                        Resume/CV *
                      </Label>
                      <div className="mt-1 flex items-center gap-4">
                        <input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          className="!h-[54px] font-poppins"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("resume")?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Button>
                        {selectedFile && (
                          <span className="text-sm text-gray-600">
                            {selectedFile.name}
                          </span>
                        )}
                      </div>
                      {errors.resume && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.resume.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-3" htmlFor="coverLetter">
                        Cover Letter *
                      </Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Tell us why you're interested in this role and what makes you a great fit..."
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
                        disabled={isSubmitting}
                        className="w-full bg-[#002147] hover:bg-main-hover/80 cursor-pointer transition-all font-poppins text-lg h-[60px] "
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
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
