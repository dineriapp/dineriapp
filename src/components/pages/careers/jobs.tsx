"use client";



const Jobs = () => {
  const locale: Locale = useLocale() as Locale;
  const jobListings = {
    en: [
      {
        id: 1,
        label: "Marketing",
        labelColor: "bg-blue-100 text-blue-600",
        title: "Growth & Marketing Specialist",
        description:
          "Drive Dineri’s growth with creative campaigns and strategies that connect our platform with restaurants and their customers.",
        employmentType: "Part Time",
        location: "Remote",
        salary: "Salary: Reflecting experience & skills",
      },
      {
        id: 2,
        label: "Customer Success",
        labelColor: "bg-green-100 text-green-600",
        title: "Customer Success Manager",
        description:
          "Be the main partner for our restaurants, driving success and growth while delivering exceptional support.",
        employmentType: "Part Time",
        location: "Remote",
        salary: "Salary: Reflecting experience & skills",
      },
    ],
    de: [
      {
        id: 1,
        label: "Marketing",
        labelColor: "bg-blue-100 text-blue-600",
        title: "Wachstums- & Marketingspezialist",
        description:
          "Steigere das Wachstum von Dineri mit kreativen Kampagnen und Strategien, die unsere Plattform mit Restaurants und deren Kunden verbinden.",
        employmentType: "Teilzeit",
        location: "Remote",
        salary: "Gehalt: Abhängig von Erfahrung & Fähigkeiten",
      },
      {
        id: 2,
        label: "Kundenerfolg",
        labelColor: "bg-green-100 text-green-600",
        title: "Manager für Kundenerfolg",
        description:
          "Sei der wichtigste Partner für unsere Restaurants, fördere ihren Erfolg und ihr Wachstum und biete gleichzeitig außergewöhnlichen Support.",
        employmentType: "Teilzeit",
        location: "Remote",
        salary: "Gehalt: Abhängig von Erfahrung & Fähigkeiten",
      },
    ],
    es: [
      {
        id: 1,
        label: "Marketing",
        labelColor: "bg-blue-100 text-blue-600",
        title: "Especialista en Crecimiento y Marketing",
        description:
          "Impulsa el crecimiento de Dineri con campañas y estrategias creativas que conecten nuestra plataforma con los restaurantes y sus clientes.",
        employmentType: "Medio tiempo",
        location: "Remoto",
        salary: "Salario: Según experiencia y habilidades",
      },
      {
        id: 2,
        label: "Éxito del Cliente",
        labelColor: "bg-green-100 text-green-600",
        title: "Gerente de Éxito del Cliente",
        description:
          "Sé el socio principal de nuestros restaurantes, impulsando su éxito y crecimiento mientras brindas un soporte excepcional.",
        employmentType: "Medio tiempo",
        location: "Remoto",
        salary: "Salario: Según experiencia y habilidades",
      },
    ],
    fr: [
      {
        id: 1,
        label: "Marketing",
        labelColor: "bg-blue-100 text-blue-600",
        title: "Spécialiste Croissance & Marketing",
        description:
          "Accélérez la croissance de Dineri grâce à des campagnes créatives et des stratégies qui rapprochent notre plateforme des restaurants et de leurs clients.",
        employmentType: "Temps partiel",
        location: "Télétravail",
        salary: "Salaire : Selon expérience et compétences",
      },
      {
        id: 2,
        label: "Succès Client",
        labelColor: "bg-green-100 text-green-600",
        title: "Responsable Succès Client",
        description:
          "Devenez le partenaire principal de nos restaurants, favorisez leur succès et leur croissance tout en offrant un support exceptionnel.",
        employmentType: "Temps partiel",
        location: "Télétravail",
        salary: "Salaire : Selon expérience et compétences",
      },
    ],
    it: [
      {
        id: 1,
        label: "Marketing",
        labelColor: "bg-blue-100 text-blue-600",
        title: "Specialista in Crescita e Marketing",
        description:
          "Guida la crescita di Dineri con campagne creative e strategie che collegano la nostra piattaforma ai ristoranti e ai loro clienti.",
        employmentType: "Part-time",
        location: "Da remoto",
        salary: "Stipendio: In base a esperienza e competenze",
      },
      {
        id: 2,
        label: "Successo del Cliente",
        labelColor: "bg-green-100 text-green-600",
        title: "Customer Success Manager",
        description:
          "Sii il partner principale dei nostri ristoranti, guidando il loro successo e la loro crescita mentre offri un supporto eccezionale.",
        employmentType: "Part-time",
        location: "Da remoto",
        salary: "Stipendio: In base a esperienza e competenze",
      },
    ],
    nl: [
      {
        id: 1,
        label: "Marketing",
        labelColor: "bg-blue-100 text-blue-600",
        title: "Groei- & Marketingspecialist",
        description:
          "Stimuleer de groei van Dineri met creatieve campagnes en strategieën die ons platform verbinden met restaurants en hun klanten.",
        employmentType: "Deeltijd",
        location: "Op afstand",
        salary: "Salaris: Afhankelijk van ervaring & vaardigheden",
      },
      {
        id: 2,
        label: "Klantensucces",
        labelColor: "bg-green-100 text-green-600",
        title: "Customer Success Manager",
        description:
          "Wees de belangrijkste partner voor onze restaurants, stimuleer hun succes en groei en bied tegelijkertijd uitzonderlijke ondersteuning.",
        employmentType: "Deeltijd",
        location: "Op afstand",
        salary: "Salaris: Afhankelijk van ervaring & vaardigheden",
      },
    ],
  };


  return (
    <div className="w-full bg-[#FCF9EB]">

      <div className="w-11/12 max-w-[1280px] mx-auto flex flex-col gap-y-5  lg:px-4 pb-12 lg:pt-10 pt-5">
        <h2 className="text-3xl font-bold text-center text-main font-inter">
          {locale === "de"
            ? "Aktuelle Stellenangebote"
            : locale === "es"
              ? "Ofertas actuales"
              : locale === "fr"
                ? "Postes actuels"
                : locale === "it"
                  ? "Posizioni aperte"
                  : locale === "nl"
                    ? "Huidige vacatures"
                    : "Current Openings"}
        </h2>
        {jobListings[locale].length <= 0 ? (
          <p className="text-2xl text-main font-inter text-center">
            {locale === "de"
              ? "Wir haben im Moment keine offenen Stellen, aber wir würden uns freuen, Sie in Zukunft willkommen zu heißen, wenn neue Möglichkeiten entstehen."
              : locale === "es"
                ? "No tenemos vacantes en este momento, pero nos encantaría darle la bienvenida en el futuro cuando surjan nuevas oportunidades."
                : locale === "fr"
                  ? "Nous n'avons pas de postes vacants pour le moment, mais nous serions ravis de vous accueillir à l'avenir lorsque de nouvelles opportunités se présenteront."
                  : locale === "it"
                    ? "Al momento non abbiamo posizioni aperte, ma saremmo felici di accoglierti in futuro quando si presenteranno nuove opportunità."
                    : locale === "nl"
                      ? "We hebben momenteel geen vacatures, maar we verwelkomen je graag in de toekomst wanneer er nieuwe kansen ontstaan."
                      : "We don’t have any vacancies at the moment, but we’d love to welcome you in the future when new opportunities arise."}
          </p>

        ) : (
          jobListings[locale].map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
};

export default Jobs;

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Locale } from "@/i18n/routing";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { FaEuroSign } from "react-icons/fa";

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
  const locale = useLocale()
  const router = useRouter();
  return (
    <Card className="w-full bg-[white] box-shad-every border-[4px] border-[#000000] shadow-md font-inter  transition-shadow duration-300 rounded-2xl overflow-hidden">
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
              <FaEuroSign className="w-4 h-4" />
              <span className="text-sm font-medium">{job.salary}</span>
            </div>
          </div>

          {/* View Job Button */}
          <Button
            variant="ghost"
            onClick={() => router.push(jobLink)}
            className="text-white bg-[#009A5E] hover:text-white hover:bg-[#009A5E]/80 rounded-full h-[50px] !px-[28px] gap-0 cursor-pointer text-lg font-medium self-start sm:self-center"
          >
            {locale === "en" ? "View Job" :
              locale === "de" ? "Stellenanzeige ansehen" :
                locale === "es" ? "Ver oferta" :
                  locale === "fr" ? "Voir le poste" :
                    locale === "it" ? "Visualizza offerta" :
                      locale === "nl" ? "Bekijk vacature" :
                        "View Job"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
