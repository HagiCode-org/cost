import {
  default as i18n,
  defaultLanguage,
  getSupportedLanguageMetadata,
  supportedLanguages,
  type SupportedLanguage,
} from "@/i18n/config"

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

const FALLBACK_SITE_URL = "https://cost.hagicode.com"

export const siteConfig = {
  name: "Cost",
  organizationName: "HagiCode",
  origin: import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL,
  basePath: import.meta.env.BASE_URL || "/",
  author: "HagiCode",
  defaultLanguage: defaultLanguage as SupportedLanguage,
  description:
    "Estimate how much leverage AI gives your work through salary, model efficiency, and daily token usage benchmarks.",
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
  const localizedAlternates: AlternateLink[] = supportedLanguages.map((language) => ({
    locale: language,
    hrefLang: getSupportedLanguageMetadata(language).hreflang,
    url: joinSiteUrl(language === "zh-CN" ? "" : `?lang=${language}`),
  }))

  const xDefaultAlternate: AlternateLink = {
    locale: siteConfig.defaultLanguage,
    hrefLang: "x-default",
    url: joinSiteUrl(""),
  }

  return [
    ...localizedAlternates,
    xDefaultAlternate,
  ]
}

export function resolveAbsoluteAssetUrl(assetPath: string) {
  return joinSiteUrl(assetPath.replace(/^\//, ""))
}

export function resolveSEOConfig(language: SupportedLanguage): SEOConfig {
  const t = i18n.getFixedT(language)
  const config = {
    title: t("seo.home.title"),
    description: t("seo.home.description"),
    keywords: t("seo.home.keywords", { returnObjects: true }) as string[],
    imagePath: "og-image.svg",
    path: language === "zh-CN" ? "" : `?lang=${language}`,
    locale: getSupportedLanguageMetadata(language).ogLocale,
    siteName: t("seo.home.siteName"),
  }

  return {
    ...config,
    alternates: resolveAlternateLinks(),
    ogLocaleAlternates: supportedLanguages
      .filter((candidate) => candidate !== language)
      .map((candidate) => getSupportedLanguageMetadata(candidate).ogLocale),
    image: resolveAbsoluteAssetUrl(config.imagePath),
    url: joinSiteUrl(config.path),
  }
}
