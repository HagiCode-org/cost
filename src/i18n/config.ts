import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enUS from "./locales/en-US.json"
import zhCN from "./locales/zh-CN.json"

export const supportedLanguages = ["zh-CN", "en-US"] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const defaultLanguage: SupportedLanguage = "zh-CN"

const resources = {
  "zh-CN": { translation: zhCN },
  "en-US": { translation: enUS },
} as const

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

export default i18n
