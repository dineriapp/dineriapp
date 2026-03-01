import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
    const t = await getTranslations("restaurant_not_found_page")
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-blue-600 p-4">
            <div className="text-center text-white">
                <h1 className="mb-4 text-2xl font-bold">
                    {t("title")}
                </h1>
                <p className="mb-8 text-center opacity-90">
                    {t("description")}

                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-teal-600 transition-transform hover:scale-105"
                >
                    {t("return_home")}
                </Link>
            </div>
        </div>
    )
}
