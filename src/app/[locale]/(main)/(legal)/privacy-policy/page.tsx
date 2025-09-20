import { useTranslations } from "next-intl";
import React from "react";

const PrivacyPolicy = () => {
  const t = useTranslations("legalPages.Privacy");

  return (
    <div className="lg:px-8 lg:py-8 py-8 px-0">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">{t("title")}</h1>

      <p className="text-slate-600 mb-6 leading-relaxed">
        {t("intro")}
      </p>

      <p className="text-sm text-slate-500 mb-8">
        {t("lastUpdated")}
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.1.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.1.p1")}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t.rich("sections.1.list.0", {
                link: (chunks) => (
                  <a
                    href="https://www.allaboutcookies.org/"
                    className="text-main-action hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {chunks}
                  </a>
                )
              })}</li>
              {
                t.raw("sections.1.list")?.map((item: string, idx: number) => {
                  if (idx === 0) return null
                  return <li key={idx}>
                    {item}
                  </li>
                })
              }

            </ul>
            <p>
              {t("sections.1.p2")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.2.title")}
          </h2>
          <div className="text-slate-600 leading-relaxed">
            <p>
              {t("sections.2.p1")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.3.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.3.p1")}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {
                t.raw("sections.3.list")?.map((item: string, idx: number) => {
                  return <li key={idx}>
                    {item}
                  </li>
                })
              }
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.4.title")}
          </h2>
          <div className="text-slate-600 leading-relaxed">
            <p>
              {t("sections.4.p1")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.5.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.5.p1")}
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              {
                t.raw("sections.5.list")?.map((item: string, idx: number) => {
                  return <li key={idx}>
                    {item}
                  </li>
                })
              }
            </ul>
          </div>
        </section>

        {/* New Sections Added */}

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.6.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.6.p1")}
            </p>
            <p>
              {t("sections.6.p2")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.7.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.7.p1")}
            </p>
            <p>
              {t("sections.7.p2")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.8.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.8.p1")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.9.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.9.p1")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.10.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.10.p1")}
            </p>
            <p>
              {t("sections.10.p2")}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            {t("sections.11.title")}
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              {t("sections.11.p1")}
            </p>
            <p>{t("sections.11.email")}</p>
            <p>{t("sections.11.phone")}</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
