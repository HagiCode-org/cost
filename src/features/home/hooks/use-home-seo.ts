import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { resolveSupportedLanguage } from "@/i18n/config"
import { injectAllSchemas } from "@/lib/seo/schema-generator"
import { updateSEO } from "@/lib/seo/utils"
import { setLocale, useAppDispatch } from "@/lib/store"

export function useHomeSEO() {
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const language = resolveSupportedLanguage(i18n.resolvedLanguage)
    dispatch(setLocale(language))
    updateSEO(language)
    injectAllSchemas(language)
  }, [dispatch, i18n.resolvedLanguage])
}
