import { resolveSEOConfig } from "@/config/seo"
import type { SupportedLanguage } from "@/i18n/config"

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement("meta")
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement("link")
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })
}

function replaceGeneratedMeta(property: string, values: string[]) {
  document.head.querySelectorAll(`meta[data-generated="${property}"]`).forEach((node) => node.remove())

  values.forEach((value) => {
    const meta = document.createElement("meta")
    meta.setAttribute("property", property)
    meta.setAttribute("content", value)
    meta.dataset.generated = property
    document.head.appendChild(meta)
  })
}

function replaceAlternateLinks(language: SupportedLanguage) {
  document.head.querySelectorAll('link[data-generated="alternate-language"]').forEach((node) => node.remove())

  resolveSEOConfig(language).alternates.forEach((item) => {
    const link = document.createElement("link")
    link.rel = "alternate"
    link.hreflang = item.hrefLang
    link.href = item.url
    link.dataset.generated = "alternate-language"
    document.head.appendChild(link)
  })
}

export function initializeDefaultSEO(language: SupportedLanguage = "zh-CN") {
  updateSEO(language)
}

export function updateSEO(language: SupportedLanguage) {
  const config = resolveSEOConfig(language)

  document.title = config.title
  document.documentElement.lang = language

  upsertMeta('meta[name="description"]', { name: "description", content: config.description })
  upsertMeta('meta[name="keywords"]', { name: "keywords", content: config.keywords.join(", ") })
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: config.title })
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: config.description })
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: config.image })
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: config.url })
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" })
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: config.siteName })
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: config.locale })
  replaceGeneratedMeta("og:locale:alternate", config.ogLocaleAlternates)
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" })
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: config.title })
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: config.description })
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: config.image })
  upsertMeta('meta[name="twitter:url"]', { name: "twitter:url", content: config.url })
  upsertLink('link[rel="canonical"]', { rel: "canonical", href: config.url })
  replaceAlternateLinks(language)
}
