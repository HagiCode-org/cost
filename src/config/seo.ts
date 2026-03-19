import type { SupportedLanguage } from "@/i18n/config"

export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  imagePath: string
  path: string
  locale: string
  alternateLocales: Array<{ locale: string; hrefLang: string }>
}

const FALLBACK_SITE_URL = "https://hagicode.com"

export const siteConfig = {
  name: "我会被AI替代吗",
  origin: import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL,
  basePath: import.meta.env.BASE_URL || "/",
  author: "HagiCode",
}

function normalizeBasePath(basePath: string) {
  if (!basePath || basePath === "/") {
    return "/"
  }

  const trimmed = basePath.replace(/^\/+|\/+$/g, "")
  return `/${trimmed}/`
}

function joinSiteUrl(pathname: string) {
  return new URL(pathname, `${siteConfig.origin}${normalizeBasePath(siteConfig.basePath)}`).toString()
}

export function resolveAbsoluteAssetUrl(assetPath: string) {
  return joinSiteUrl(assetPath.replace(/^\//, ""))
}

export const seoByLocale: Record<SupportedLanguage, SEOConfig> = {
  "zh-CN": {
    title: "我会被AI替代吗 | HagiCode",
    description: "一个帮助你理解 AI 时代工作变化的站点骨架：先搭建可信首页、方法论与后续表单扩展位，再逐步加入真实评估能力。",
    keywords: ["AI 替代", "岗位风险", "职业评估", "方法论", "HagiCode"],
    imagePath: "og-image.svg",
    path: "",
    locale: "zh_CN",
    alternateLocales: [{ locale: "en-US", hrefLang: "en-US" }],
  },
  "en-US": {
    title: "Will AI Replace Me? | HagiCode",
    description: "A foundation site for understanding AI-era role changes, with a launch-ready landing page, methodology summary, and future assessment slots.",
    keywords: ["AI replacement", "career assessment", "automation risk", "job future", "HagiCode"],
    imagePath: "og-image.svg",
    path: "?lang=en-US",
    locale: "en_US",
    alternateLocales: [{ locale: "zh-CN", hrefLang: "zh-CN" }],
  },
}

export function resolveSEOConfig(language: SupportedLanguage) {
  const config = seoByLocale[language]

  return {
    ...config,
    image: resolveAbsoluteAssetUrl(config.imagePath),
    url: joinSiteUrl(config.path),
  }
}
