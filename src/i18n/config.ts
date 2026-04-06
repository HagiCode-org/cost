import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import { detectRegion, syncRegionPreferenceFromUrl, type SiteRegion } from "@/lib/region"

import enUS from "./locales/en-US.json"
import zhCN from "./locales/zh-CN.json"

export const supportedLanguages = ["zh-CN", "en-US"] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const defaultLanguage: SupportedLanguage = "zh-CN"

const resources = {
  "zh-CN": { translation: zhCN },
  "en-US": { translation: enUS },
} as const

syncRegionPreferenceFromUrl()

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: [...supportedLanguages],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupQuerystring: "lang",
      lookupLocalStorage: "cost-language",
    },
  })

export function getResolvedLanguage(): SupportedLanguage {
  const language = i18n.resolvedLanguage ?? i18n.language ?? defaultLanguage

  if (language === "en-US" || language.startsWith("en")) {
    return "en-US"
  }

  return "zh-CN"
}

export function getResolvedExperienceContext(): {
  language: SupportedLanguage
  region: SiteRegion
} {
  return {
    language: getResolvedLanguage(),
    region: detectRegion(),
  }
}

export default i18n
