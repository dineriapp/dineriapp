import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

const UnsavedChangesUi = () => {
  const t = useTranslations("UnsavedChangesPanel")

  return (
    <div className="border bg-white !px-5 rounded-full font-poppins !h-[44px] flex items-center justify-center py-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span className="leading-[1]">{t("unsaved_changes_message")}</span>
      </div>
    </div>
  )
}

export default UnsavedChangesUi
