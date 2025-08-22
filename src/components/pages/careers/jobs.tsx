"use client";
import React from "react";

const Jobs = () => {
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
    },
  ];
  return (
    <div className="w-11/12 max-w-[1200px] mx-auto flex flex-col gap-y-5  lg:px-4 pb-12 lg:pt-10 pt-5">
      <h2 className="text-3xl font-bold text-center text-main font-inter">
        Current Openings
      </h2>
      {jobListings.length <= 0 ? (
        <p className="text-2xl text-main font-inter text-center">
          We don’t have any vacancies at the moment, but we’d love to welcome
          you in the future when new opportunities arise.
        </p>
      ) : (
        jobListings.map((job) => <JobCard key={job.id} job={job} />)
      )}
    </div>
  );
};

export default Jobs;

import { Clock, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Job {
  id: number;
  label: string;
  labelColor: string;
  title: string;
  description: string;
  employmentType: string;
  location: string;
  salary: string;
}

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  const jobLink = `/careers/${job.id}`;
  const router = useRouter();
  return (
    <Card className="w-full bg-white shadow-sm font-inter  transition-shadow duration-300 border-0 rounded-2xl overflow-hidden">
      <div className="p-4 md:p-6">
        {/* Label */}
        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${job.labelColor}`}
          >
            {job.label}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          {job.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
          {job.description}
        </p>

        {/* Job Details and View Job Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Job Details */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{job.employmentType}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">{job.salary}</span>
            </div>
          </div>

          {/* View Job Button */}
          <Button
            variant="ghost"
            onClick={() => router.push(jobLink)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium self-start sm:self-center"
          >
            View Job
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
