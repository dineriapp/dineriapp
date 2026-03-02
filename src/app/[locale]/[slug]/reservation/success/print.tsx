"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function PrintButton() {
  const t = useTranslations("Common");

  return (
    <button
      onClick={() => window.print()}
      className="bg-[#009a5e] text-white text-center px-4 py-3 rounded-md hover:bg-emerald-700 transition font-semibold text-sm shadow-sm"
    >
      {t("printButton")}
    </button>
  );
}
