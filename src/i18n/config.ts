import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import { detectRegion, syncRegionPreferenceFromUrl, type SiteRegion } from "@/lib/region"

export const baseSourceLanguage = "en-US"
export const defaultLanguage = "zh-CN"
export const defaultNamespace = "translation"
export const supportedNamespaces = [defaultNamespace] as const
export type SupportedNamespace = (typeof supportedNamespaces)[number]

export const supportedLanguages = [
  "en-US",
  "zh-CN",
  "zh-Hant",
  "ja-JP",
  "ko-KR",
  "de-DE",
  "fr-FR",
  "es-ES",
  "pt-BR",
  "ru-RU",
] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export interface SupportedLanguageMetadata {
  value: SupportedLanguage
  label: string
  compactLabel: string
  nativeName: string
  hreflang: string
  ogLocale: string
}

export const supportedLanguageMetadata: readonly SupportedLanguageMetadata[] = [
  { value: "zh-CN", label: "中文", compactLabel: "中", nativeName: "简体中文", hreflang: "zh-CN", ogLocale: "zh_CN" },
  { value: "zh-Hant", label: "繁體", compactLabel: "繁", nativeName: "繁體中文", hreflang: "zh-Hant", ogLocale: "zh_TW" },
  { value: "en-US", label: "EN", compactLabel: "EN", nativeName: "English", hreflang: "en-US", ogLocale: "en_US" },
  { value: "ja-JP", label: "日本語", compactLabel: "JA", nativeName: "日本語", hreflang: "ja-JP", ogLocale: "ja_JP" },
  { value: "ko-KR", label: "한국어", compactLabel: "KO", nativeName: "한국어", hreflang: "ko-KR", ogLocale: "ko_KR" },
  { value: "de-DE", label: "Deutsch", compactLabel: "DE", nativeName: "Deutsch", hreflang: "de-DE", ogLocale: "de_DE" },
  { value: "fr-FR", label: "Français", compactLabel: "FR", nativeName: "Français", hreflang: "fr-FR", ogLocale: "fr_FR" },
  { value: "es-ES", label: "Español", compactLabel: "ES", nativeName: "Español", hreflang: "es-ES", ogLocale: "es_ES" },
  { value: "pt-BR", label: "Português", compactLabel: "PT", nativeName: "Português", hreflang: "pt-BR", ogLocale: "pt_BR" },
  { value: "ru-RU", label: "Русский", compactLabel: "RU", nativeName: "Русский", hreflang: "ru-RU", ogLocale: "ru_RU" },
] as const

export const languagePreferenceStorageKey = "cost-language"
export const languageQueryParam = "lang"

const chineseContentLanguages = new Set<SupportedLanguage>(["zh-CN", "zh-Hant"])

const languageAliases = new Map<string, SupportedLanguage>([
  ["cn", "zh-CN"],
  ["zh", "zh-CN"],
  ["zh-cn", "zh-CN"],
  ["zh-hans", "zh-CN"],
  ["zh-sg", "zh-CN"],
  ["zh-hant", "zh-Hant"],
  ["zh-hk", "zh-Hant"],
  ["zh-mo", "zh-Hant"],
  ["zh-tw", "zh-Hant"],
  ["en", "en-US"],
  ["en-us", "en-US"],
  ["en-gb", "en-US"],
  ["ja", "ja-JP"],
  ["ja-jp", "ja-JP"],
  ["jp", "ja-JP"],
  ["ko", "ko-KR"],
  ["ko-kr", "ko-KR"],
  ["kr", "ko-KR"],
  ["de", "de-DE"],
  ["de-de", "de-DE"],
  ["fr", "fr-FR"],
  ["fr-fr", "fr-FR"],
  ["es", "es-ES"],
  ["es-es", "es-ES"],
  ["pt", "pt-BR"],
  ["pt-br", "pt-BR"],
  ["ru", "ru-RU"],
  ["ru-ru", "ru-RU"],
])

type ResourceBundle = Record<string, unknown>

const generatedLocaleModules = import.meta.glob("./generated-locales/*/*.json", {
  eager: true,
  import: "default",
}) as Record<string, ResourceBundle>

export function normalizeSupportedLanguage(value: unknown): SupportedLanguage | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const exact = supportedLanguages.find((language) => language === trimmed)
  if (exact) {
    return exact
  }

  return languageAliases.get(trimmed.toLowerCase()) ?? null
}

export function resolveSupportedLanguage(
  value: unknown,
  fallback: SupportedLanguage = defaultLanguage,
): SupportedLanguage {
  return normalizeSupportedLanguage(value) ?? fallback
}

export function getSupportedLanguageMetadata(language: SupportedLanguage): SupportedLanguageMetadata {
  return supportedLanguageMetadata.find((item) => item.value === language) ?? supportedLanguageMetadata[0]
}

export function resolveContentLanguage(language: SupportedLanguage): "zh-CN" | "en-US" {
  return chineseContentLanguages.has(language) ? "zh-CN" : "en-US"
}

function buildI18nResources() {
  return Object.entries(generatedLocaleModules).reduce<Record<SupportedLanguage, Record<string, ResourceBundle>>>(
    (resourceMap, [modulePath, resource]) => {
      const match = modulePath.match(/\.\/generated-locales\/([^/]+)\/(.+)\.json$/u)
      if (!match) {
        return resourceMap
      }

      const language = normalizeSupportedLanguage(match[1])
      if (!language) {
        return resourceMap
      }

      const namespace = match[2]
      resourceMap[language] ??= {}
      resourceMap[language][namespace] = resource
      return resourceMap
    },
    {} as Record<SupportedLanguage, Record<string, ResourceBundle>>,
  )
}

export const resources = buildI18nResources()

export function getStoredLanguage(storage: Storage | undefined = globalThis.localStorage): SupportedLanguage | null {
  try {
    return normalizeSupportedLanguage(storage?.getItem(languagePreferenceStorageKey))
  } catch {
    return null
  }
}

export function persistLanguagePreference(
  language: SupportedLanguage,
  storage: Storage | undefined = globalThis.localStorage,
) {
  try {
    storage?.setItem(languagePreferenceStorageKey, language)
  } catch {
    // Ignore storage failures so private browsing modes can still switch language.
  }
}

export function resolveInitialLanguage({
  search = globalThis.location?.search ?? "",
  storage = globalThis.localStorage,
  navigatorLanguages = globalThis.navigator?.languages ?? [globalThis.navigator?.language].filter(Boolean),
}: {
  search?: string
  storage?: Storage
  navigatorLanguages?: readonly string[]
} = {}): SupportedLanguage {
  const queryLanguage = normalizeSupportedLanguage(new URLSearchParams(search).get(languageQueryParam))
  if (queryLanguage) {
    return queryLanguage
  }

  const storedLanguage = getStoredLanguage(storage)
  if (storedLanguage) {
    return storedLanguage
  }

  for (const navigatorLanguage of navigatorLanguages) {
    const normalized = normalizeSupportedLanguage(navigatorLanguage)
    if (normalized) {
      return normalized
    }
  }

  return defaultLanguage
}

export function syncLanguageQueryParam(
  language: SupportedLanguage,
  {
    location = globalThis.location,
    history = globalThis.history,
  }: {
    location?: Location
    history?: History
  } = {},
) {
  if (!location || !history?.replaceState) {
    return
  }

  const url = new URL(location.href)
  url.searchParams.set(languageQueryParam, language)
  history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`)
}

syncRegionPreferenceFromUrl()

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: [...supportedLanguages],
    lng: resolveInitialLanguage(),
    defaultNS: defaultNamespace,
    ns: [...supportedNamespaces],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
      lookupQuerystring: languageQueryParam,
      lookupLocalStorage: languagePreferenceStorageKey,
    },
  })

export function getResolvedLanguage(): SupportedLanguage {
  const language = i18n.resolvedLanguage ?? i18n.language ?? defaultLanguage

  return resolveSupportedLanguage(language)
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
