"use client";

import type React from "react";

import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  Users,
  Upload,
} from "lucide-react";
import Link from "next/link";
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
  resume: z.any(),
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

const jobListings = [
  {
    id: 1,
    label: "Label",
    labelColor: "bg-blue-100 text-blue-600",
    title: "Senior Product Designer",
    description:
      "Maecenas accumsan lacus vel facilisis. Ullamcorper sit amet risus nullam eget",
    employmentType: "Full Time",
    location: "Remote",
    salary: "$100-$200K",
    company: "TechCorp Inc.",
    postedDate: "2 days ago",
    requirements: [
      "5+ years of product design experience",
      "Proficiency in Figma, Sketch, and Adobe Creative Suite",
      "Strong understanding of user-centered design principles",
      "Experience with design systems and component libraries",
      "Excellent communication and collaboration skills",
    ],
    responsibilities: [
      "Lead design projects from concept to completion",
      "Collaborate with cross-functional teams to define product requirements",
      "Create wireframes, prototypes, and high-fidelity designs",
      "Conduct user research and usability testing",
      "Maintain and evolve the design system",
    ],
    benefits: [
      "Competitive salary and equity package",
      "Comprehensive health, dental, and vision insurance",
      "Flexible work arrangements and unlimited PTO",
      "Professional development budget",
      "State-of-the-art equipment and tools",
    ],
  },
  {
    id: 2,
    label: "Customer Experience",
    labelColor: "bg-green-100 text-green-600",
    title: "Customer Support Expert",
    description:
      "Maecenas accumsan lacus vel facilisis. Ullamcorper sit amet risus nullam eget",
    employmentType: "Part Time",
    location: "In House",
    salary: "$200-$300K",
    company: "ServicePro Solutions",
    postedDate: "1 week ago",
    requirements: [
      "3+ years of customer support experience",
      "Excellent written and verbal communication skills",
      "Experience with CRM systems and support tools",
      "Problem-solving mindset and patience",
      "Ability to work in a fast-paced environment",
    ],
    responsibilities: [
      "Provide exceptional customer support via multiple channels",
      "Resolve customer issues and escalate when necessary",
      "Document customer interactions and feedback",
      "Collaborate with product team to improve user experience",
      "Train new support team members",
    ],
    benefits: [
      "Flexible part-time schedule",
      "Health insurance coverage",
      "Professional development opportunities",
      "Team building events and activities",
      "Performance-based bonuses",
    ],
  },
  {
    id: 3,
    label: "Engineering",
    labelColor: "bg-orange-100 text-orange-600",
    title: "Frontend UX Engineer",
    description:
      "Maecenas accumsan lacus vel facilisis. Ullamcorper sit amet risus nullam eget",
    employmentType: "Full Time",
    location: "Remote",
    salary: "$50-$75K",
    company: "DevStudio Labs",
    postedDate: "3 days ago",
    requirements: [
      "4+ years of frontend development experience",
      "Proficiency in React, TypeScript, and modern CSS",
      "Experience with design systems and component libraries",
      "Understanding of UX principles and accessibility",
      "Strong portfolio demonstrating technical and design skills",
    ],
    responsibilities: [
      "Develop responsive and accessible user interfaces",
      "Collaborate with designers to implement pixel-perfect designs",
      "Build and maintain component libraries",
      "Optimize applications for performance and scalability",
      "Mentor junior developers and conduct code reviews",
    ],
    benefits: [
      "Remote-first culture with flexible hours",
      "Comprehensive benefits package",
      "Learning and development stipend",
      "Latest technology and equipment",
      "Annual company retreats",
    ],
  },
];

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const jobId = Number.parseInt(params.id);
  const job = jobListings.find((j) => j.id === jobId);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
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
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-gray-700">{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{job.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700">
                {job.location === "Remote" ? "Remote" : "In office"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{job.employmentType}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-2xl font-bold text-gray-900">{job.salary}</div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Role</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>{job.description}</p>
              <p>
                As a {job.title} at {job.company}, you'll be a trusted partner
                working in a dynamic environment. You'll play a key role in
                managing day-to-day operations, keeping teams focused and
                organized while supporting the wider team experience.
              </p>
              <p>
                You'll own calendars, logistics and coordination across key
                meetings and projects. Beyond that, you'll help drive culture
                through onboarding, events, and team programs, working closely
                with leadership and operations teams.
              </p>
              <p>
                This role requires someone who is thoughtful, proactive,
                detail-oriented, and able to work independently - someone who
                thrives in a fast-paced environment and enjoys wearing multiple
                hats.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About {job.company}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                {job.company} is a leading technology company focused on
                creating innovative solutions that transform how people work and
                collaborate. We're committed to building a diverse, inclusive
                workplace where everyone can thrive.
              </p>
              <p>
                Our team of passionate professionals works together to deliver
                exceptional products and services to our global customer base.
                We value creativity, collaboration, and continuous learning.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What You'll Own
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Executive & Administrative Support
                </h3>
                <ul className="space-y-1 text-gray-700">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index}>• {responsibility}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Requirements
            </h2>
            <ul className="space-y-2 text-gray-700">
              {job.requirements.map((requirement, index) => (
                <li key={index}>• {requirement}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
            <ul className="space-y-2 text-gray-700">
              {job.benefits.map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Work Environment
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We offer a flexible work environment that supports both remote
                and in-office collaboration. Our modern offices are equipped
                with the latest technology and designed to foster creativity and
                productivity.
              </p>
              <p>
                Whether you prefer working from home, the office, or a
                combination of both, we provide the tools and support you need
                to do your best work.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Growth Opportunities
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We're committed to your professional development and offer
                numerous opportunities for growth, including mentorship
                programs, skill development workshops, and career advancement
                paths.
              </p>
              <p>
                Our learning and development budget ensures you have access to
                the resources you need to expand your skills and advance your
                career.
              </p>
            </div>
          </section>

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
                  {job.company}. We've received your application and will review
                  it carefully. If your qualifications match our needs, we'll be
                  in touch shortly.
                </p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 bg-transparent">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          {...register("fullName")}
                          className="mt-1"
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          className="mt-1"
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
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          {...register("phone")}
                          className="mt-1"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="experience">
                          Years of Experience *
                        </Label>
                        <select
                          id="experience"
                          {...register("experience")}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select experience</option>
                          <option value="0-1">0-1 years</option>
                          <option value="2-3">2-3 years</option>
                          <option value="4-5">4-5 years</option>
                          <option value="6-10">6-10 years</option>
                          <option value="10+">10+ years</option>
                        </select>
                        {errors.experience && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.experience.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="education">Education Level *</Label>
                        <select
                          id="education"
                          {...register("education")}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select education</option>
                          <option value="high-school">High School</option>
                          <option value="associate">Associate Degree</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">PhD</option>
                        </select>
                        {errors.education && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.education.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="noticePeriod">Notice Period *</Label>
                        <select
                          id="noticePeriod"
                          {...register("noticePeriod")}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select notice period</option>
                          <option value="immediately">Immediately</option>
                          <option value="1-week">1 week</option>
                          <option value="2-weeks">2 weeks</option>
                          <option value="1-month">1 month</option>
                          <option value="2-months">2 months</option>
                          <option value="3-months">3 months</option>
                        </select>
                        {errors.noticePeriod && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.noticePeriod.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        {...register("address")}
                        className="mt-1"
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
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          className="mt-1"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          {...register("state")}
                          className="mt-1"
                        />
                        {errors.state && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.state.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          {...register("zipCode")}
                          className="mt-1"
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
                        <Label htmlFor="portfolio">
                          Portfolio URL (Optional)
                        </Label>
                        <Input
                          id="portfolio"
                          type="url"
                          placeholder="https://your-portfolio.com"
                          {...register("portfolio")}
                          className="mt-1"
                        />
                        {errors.portfolio && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.portfolio.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="linkedIn">
                          LinkedIn Profile (Optional)
                        </Label>
                        <Input
                          id="linkedIn"
                          type="url"
                          placeholder="https://linkedin.com/in/yourprofile"
                          {...register("linkedIn")}
                          className="mt-1"
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
                        <Label htmlFor="github">
                          GitHub Profile (Optional)
                        </Label>
                        <Input
                          id="github"
                          type="url"
                          placeholder="https://github.com/yourusername"
                          {...register("github")}
                          className="mt-1"
                        />
                        {errors.github && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.github.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="salaryExpectations">
                          Salary Expectations *
                        </Label>
                        <Input
                          id="salaryExpectations"
                          placeholder="e.g. $80,000 - $100,000"
                          {...register("salaryExpectations")}
                          className="mt-1"
                        />
                        {errors.salaryExpectations && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.salaryExpectations.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="resume">Resume/CV *</Label>
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
                      <Label htmlFor="coverLetter">Cover Letter *</Label>
                      <Textarea
                        id="coverLetter"
                        rows={6}
                        placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                        {...register("coverLetter")}
                        className="mt-1"
                      />
                      {errors.coverLetter && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.coverLetter.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-semibold mb-4">
                        Equal Opportunity Information (Optional)
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        We are an equal opportunity employer and value diversity
                        at our company. We do not discriminate on the basis of
                        race, religion, color, national origin, gender, sexual
                        orientation, age, marital status, veteran status, or
                        disability status.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <select
                            id="gender"
                            {...register("gender")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="non-binary">Non-binary</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="ethnicity">Ethnicity</Label>
                          <select
                            id="ethnicity"
                            {...register("ethnicity")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Prefer not to say</option>
                            <option value="asian">Asian</option>
                            <option value="black">
                              Black or African American
                            </option>
                            <option value="hispanic">Hispanic or Latino</option>
                            <option value="native">
                              Native American or Alaska Native
                            </option>
                            <option value="pacific">
                              Native Hawaiian or Pacific Islander
                            </option>
                            <option value="white">White</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="veteranStatus">Veteran Status</Label>
                          <select
                            id="veteranStatus"
                            {...register("veteranStatus")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Prefer not to say</option>
                            <option value="yes">I am a veteran</option>
                            <option value="no">I am not a veteran</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="disability">Disability Status</Label>
                          <select
                            id="disability"
                            {...register("disability")}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Prefer not to say</option>
                            <option value="yes">I have a disability</option>
                            <option value="no">
                              I don't have a disability
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-5 "
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
