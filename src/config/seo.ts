import { supportedLanguages, type SupportedLanguage } from "@/i18n/config"

export interface AlternateLink {
  locale: SupportedLanguage
  hrefLang: string
  url: string
}

export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  imagePath: string
  path: string
  locale: string
  siteName: string
  alternates: AlternateLink[]
  ogLocaleAlternates: string[]
  image: string
  url: string
}

interface LocaleSEOContent {
  title: string
  description: string
  keywords: string[]
  imagePath: string
  path: string
  locale: string
  siteName: string
}

const FALLBACK_SITE_URL = "https://cost.hagicode.com"
const defaultLanguage: SupportedLanguage = "zh-CN"

export const siteConfig = {
  name: "Cost",
  organizationName: "HagiCode",
  origin: import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL,
  basePath: import.meta.env.BASE_URL || "/",
  author: "HagiCode",
  defaultLanguage,
  description:
    "Estimate how much leverage AI gives your work through salary, model efficiency, and daily token usage benchmarks.",
}

const seoContentByLocale: Record<SupportedLanguage, LocaleSEOContent> = {
  "zh-CN": {
    title: "Agent 时代，你会不会被淘汰？ | HagiCode",
    description:
      "输入你的年薪、熟悉模型、效率倍数和日均 Token 用量，算一算你和 AI 加起来是否等于过去两个人甚至更多。",
    keywords: ["Agent", "AI 效率倍数", "Token 成本", "模型成本", "职场效率", "AI 协作", "HagiCode"],
    imagePath: "og-image.svg",
    path: "",
    locale: "zh_CN",
    siteName: "我会被AI替代吗",
  },
  "en-US": {
    title: "Will Agent-Era Leverage Replace You? | HagiCode",
    description:
      "Enter your salary, favorite model, productivity multiplier, and daily token usage to estimate whether you plus AI now equals two people or more.",
    keywords: ["Agent", "AI productivity", "token cost", "model pricing", "AI collaboration", "career leverage", "HagiCode"],
    imagePath: "og-image.svg",
    path: "?lang=en-US",
    locale: "en_US",
    siteName: "Will AI Replace Me?",
  },
}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "")
}

function normalizeBasePath(basePath: string) {
  if (!basePath || basePath === "/") {
    return "/"
  }

  const trimmed = basePath.replace(/^\/+|\/+$/g, "")
  return `/${trimmed}/`
}

function joinSiteUrl(pathname: string) {
  return new URL(pathname, `${normalizeOrigin(siteConfig.origin)}${normalizeBasePath(siteConfig.basePath)}`).toString()
}

function resolveAlternateLinks(): AlternateLink[] {
  const localizedAlternates = supportedLanguages.map((language) => ({
    locale: language,
    hrefLang: language,
    url: joinSiteUrl(seoContentByLocale[language].path),
  }))

  return [
    ...localizedAlternates,
    {
      locale: siteConfig.defaultLanguage,
      hrefLang: "x-default",
      url: joinSiteUrl(seoContentByLocale[siteConfig.defaultLanguage].path),
    },
  ]
}

export function resolveAbsoluteAssetUrl(assetPath: string) {
  return joinSiteUrl(assetPath.replace(/^\//, ""))
}

export function resolveSEOConfig(language: SupportedLanguage): SEOConfig {
  const config = seoContentByLocale[language]

  return {
    ...config,
    alternates: resolveAlternateLinks(),
    ogLocaleAlternates: supportedLanguages
      .filter((candidate) => candidate !== language)
      .map((candidate) => seoContentByLocale[candidate].locale),
    image: resolveAbsoluteAssetUrl(config.imagePath),
    url: joinSiteUrl(config.path),
  }
}
