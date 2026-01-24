"use client";


import { ArrowLeft, Building2, Clock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";;
import { use } from "react";

import JobListings from "@/app/[locale]/Data/job-data";
import { FaEuroSign } from "react-icons/fa";
import JobForm from "./job-form";
import { useLocale } from "next-intl";
import { Locale } from "@/i18n/routing";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const jobId = id;
  const locale: Locale = useLocale() as Locale;
  const job = JobListings[locale]?.find((j) => j.id == jobId);

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-6 pb-8 pt-32 lg:pt-40 text-center">
        <h1 className="text-2xl font-bold text-red-600">
          {locale === "en"
            ? "Job not found"
            : locale === "de"
              ? "Stelle nicht gefunden"
              : locale === "es"
                ? "Trabajo no encontrado"
                : locale === "fr"
                  ? "Offre non trouvée"
                  : locale === "it"
                    ? "Offerta non trovata"
                    : locale === "nl"
                      ? "Vacature niet gevonden"
                      : "Job not found"}
        </h1>
        <Link
          href="/careers"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          {locale === "en"
            ? "← Back to Jobs"
            : locale === "de"
              ? "← Zurück zu den Stellen"
              : locale === "es"
                ? "← Volver a Trabajos"
                : locale === "fr"
                  ? "← Retour aux offres"
                  : locale === "it"
                    ? "← Torna alle offerte"
                    : locale === "nl"
                      ? "← Terug naar vacatures"
                      : "← Back to Jobs"}
        </Link>
      </div>
    );
  }
  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-6 pb-8 pt-32 lg:pt-40">
        <Link
          href="/careers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {locale === "en"
            ? "Back to Jobs"
            : locale === "de"
              ? "Zurück zu den Stellen"
              : locale === "es"
                ? "Volver a Trabajos"
                : locale === "fr"
                  ? "Retour aux offres"
                  : locale === "it"
                    ? "Torna alle offerte"
                    : locale === "nl"
                      ? "Terug naar vacatures"
                      : "Back to Jobs"}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
          <p className="mb-4">{job.description}</p>
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
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{job.employmentType}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaEuroSign className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">{job.salary}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === "de"
                ? "Die Rolle"
                : locale === "es"
                  ? "El Rol"
                  : locale === "fr"
                    ? "Le Rôle"
                    : locale === "it"
                      ? "Il Ruolo"
                      : locale === "nl"
                        ? "De Rol"
                        : "The Role"}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              {job?.roleParas?.map((para, index) => (
                <p key={`para-${index}`}>{para}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === "de"
                ? "Über uns"
                : locale === "es"
                  ? "Acerca de"
                  : locale === "fr"
                    ? "À propos"
                    : locale === "it"
                      ? "Chi siamo"
                      : locale === "nl"
                        ? "Over ons"
                        : "About"} {job.company}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              {job?.aboutParas?.map((para, index) => (
                <p key={`para-${index}`}>{para}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === "de"
                ? "Wofür Sie verantwortlich sind"
                : locale === "es"
                  ? "Lo que tendrás a tu cargo"
                  : locale === "fr"
                    ? "Ce dont vous serez responsable"
                    : locale === "it"
                      ? "Di cosa sarai responsabile"
                      : locale === "nl"
                        ? "Waar jij verantwoordelijk voor bent"
                        : "What You’ll Own"}
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {job.responsibilitiesTitle}
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
              {locale === "de"
                ? "Anforderungen"
                : locale === "es"
                  ? "Requisitos"
                  : locale === "fr"
                    ? "Exigences"
                    : locale === "it"
                      ? "Requisiti"
                      : locale === "nl"
                        ? "Vereisten"
                        : "Requirements"}
            </h2>
            <ul className="space-y-2 text-gray-700">
              {job.requirements.map((requirement, index) => (
                <li key={index}>• {requirement}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === "de"
                ? "Vorteile"
                : locale === "es"
                  ? "Beneficios"
                  : locale === "fr"
                    ? "Avantages"
                    : locale === "it"
                      ? "Benefici"
                      : locale === "nl"
                        ? "Voordelen"
                        : "Benefits"}
            </h2>
            <ul className="space-y-2 text-gray-700">
              {job.benefits.map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </section>

          {/* <section>
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
          </section> */}

          {/* <section>
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
          </section> */}

          {/* Application Form Section */}
          <JobForm id={jobId} title={job.title} />
        </div>
      </div>
    </div>
  );
}
