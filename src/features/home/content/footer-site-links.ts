import footerSitesSnapshot from "@/data/footer-sites.snapshot.json"

type CostLocale = "zh-CN" | "en-US"

export interface FooterSiteLink {
  siteId: string
  label: string
  description: string
  href: string
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

export function resolveCostFooterSiteLinks(locale: CostLocale): FooterSiteLink[] {
  void locale
  const snapshotById = new Map(footerSitesSnapshot.entries.map((entry) => [entry.id, entry]))

  return DEFAULT_RELATED_SITE_ORDER.flatMap((siteId) => {
    const entry = snapshotById.get(siteId)
    if (!entry || entry.id === CURRENT_SITE_ID) {
      return []
    }

    return [{
      siteId: entry.id,
      label: entry.title,
      description: entry.description,
      href: entry.url,
    }]
  })
}
