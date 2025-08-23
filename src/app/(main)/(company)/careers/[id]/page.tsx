"use client";

import type React from "react";

import { ArrowLeft, MapPin, Building2, Clock, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import JobForm from "./job-form";
import JobListings from "@/app/Data/job-data";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const jobId = id;
  const job = JobListings.find((j) => j.id == jobId);

  console.log(job);

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Job not found</h1>
        <Link
          href="/careers"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          ← Back to Jobs
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen ">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link
          href="/careers"
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
                As a {job.title} at {job.company}, you&apos;ll be a trusted
                partner working in a dynamic environment. You&apos;ll play a key
                role in managing day-to-day operations, keeping teams focused
                and organized while supporting the wider team experience.
              </p>
              <p>
                You&apos;ll own calendars, logistics and coordination across key
                meetings and projects. Beyond that, you&apos;ll help drive
                culture through onboarding, events, and team programs, working
                closely with leadership and operations teams.
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
                collaborate. We&apos;re committed to building a diverse,
                inclusive workplace where everyone can thrive.
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
              What You&apos;ll Own
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
                We&apos;re committed to your professional development and offer
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
          <JobForm id={jobId} />
        </div>
      </div>
    </div>
  );
}
