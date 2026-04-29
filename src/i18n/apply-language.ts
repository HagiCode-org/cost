import i18n, {
  getResolvedLanguage,
  persistLanguagePreference,
  resolveSupportedLanguage,
  syncLanguageQueryParam,
  type SupportedLanguage,
} from "@/i18n/config"
import { injectAllSchemas } from "@/lib/seo/schema-generator"
import { updateSEO } from "@/lib/seo/utils"
import { setLocale, type AppDispatch } from "@/lib/store"

export async function applyLanguagePreference(
  language: SupportedLanguage,
  {
    dispatch,
    updateUrl = true,
  }: {
    dispatch?: AppDispatch
    updateUrl?: boolean
  } = {},
): Promise<SupportedLanguage> {
  const nextLanguage = resolveSupportedLanguage(language)

  await i18n.changeLanguage(nextLanguage)
  dispatch?.(setLocale(nextLanguage))
  persistLanguagePreference(nextLanguage)

  if (updateUrl) {
    syncLanguageQueryParam(nextLanguage)
  }

  updateSEO(nextLanguage)
  injectAllSchemas(nextLanguage)

  return getResolvedLanguage()
}
