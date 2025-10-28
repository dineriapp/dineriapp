"use client"
import { Link } from "@/i18n/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { useTranslations } from "next-intl";

const TopBar = () => {
  const t = useTranslations("TopBar");
  const { data: session } = useSession();

  return (
    <div className="p-5 bg-[#009A5E] w-full flex justify-center">
      <p className="text-center max-w-[1200px] text-[#FFFFFF] font-inter font-[500] text-base">
        {!session ? (
          <>
            {t("message")}
            <Link
              href="/login"
              className="underline ml-2 underline-offset-2 hover:opacity-70 transition-all"
            >
              {t("setup")}
            </Link>{" "}
            {t("cta")}
          </>
        ) : (
          <>
            {t("loggedInMessage")}
            <Link
              href="/dashboard"
              className="underline ml-2 underline-offset-2 hover:opacity-70 transition-all"
            >
              {t("goToDashboard")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default TopBar;
