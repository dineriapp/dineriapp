// "use client";
// import React from "react";

// export default function PrintButton() {
//     return (
//         <button
//             onClick={() => window.print()}
//             className="bg-blue-600 text-white text-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
//         >
//             Print Confirmation
//         </button>
//     );
// }

//new code

"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function PrintButton() {
  const t = useTranslations("Common");

  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 text-white text-center px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
    >
      {t("printButton")}
    </button>
  );
}
