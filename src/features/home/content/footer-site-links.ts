import type { SupportedLanguage } from "@/i18n/config"
import footerSitesSnapshot from "@/data/footer-sites.snapshot.json"

export interface FooterSiteLink {
  siteId: string
  label: string
  description: string
  href: string
}

type FooterCatalogLocale = SupportedLanguage
type LocalizedFooterField = string | Readonly<Record<FooterCatalogLocale, string>>

type FooterSnapshotEntry = {
  id: string
  title: LocalizedFooterField
  description: LocalizedFooterField
  url: string
}

const DEFAULT_RELATED_SITE_ORDER = [
  "hagicode-main",
  "hagicode-docs",
  "newbe-blog",
  "index-data",
  "compose-builder",
  "cost-calculator",
  "status-page",
  "awesome-design-gallery",
  "soul-builder",
  "trait-builder",
] as const

const CURRENT_SITE_ID = "cost-calculator"

function getFooterLocaleFallbackChain(locale: FooterCatalogLocale): readonly FooterCatalogLocale[] {
  return locale === "zh-Hant" ? ["zh-CN", "en-US"] : ["en-US"]
}

function resolveLocalizedField(field: LocalizedFooterField, locale: FooterCatalogLocale): string {
  if (typeof field === "string") {
    return field
  }

  for (const candidate of [locale, ...getFooterLocaleFallbackChain(locale)]) {
    const value = field[candidate as FooterCatalogLocale]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }

  for (const value of Object.values(field)) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }

  return ""
}

export function resolveCostFooterSiteLinks(locale: SupportedLanguage): FooterSiteLink[] {
  const snapshotById = new Map<string, FooterSnapshotEntry>(
    footerSitesSnapshot.entries.map((entry) => [entry.id, entry as FooterSnapshotEntry]),
  )

  return DEFAULT_RELATED_SITE_ORDER.flatMap((siteId) => {
    const entry = snapshotById.get(siteId)
    if (!entry || entry.id === CURRENT_SITE_ID) {
      return []
    }

    return [{
      siteId: entry.id,
      label: resolveLocalizedField(entry.title, locale),
      description: resolveLocalizedField(entry.description, locale),
      href: entry.url,
    }]
  })
}
