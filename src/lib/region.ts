import type { PricingCurrency } from "@/features/income-token/content/pricing-data"

export const supportedRegions = ["cn-mainland", "international"] as const

export type SiteRegion = (typeof supportedRegions)[number]

export const REGION_QUERY_KEY = "region"
export const REGION_STORAGE_KEY = "cost-region"

const cnLanguageTags = new Set(["zh-cn", "zh-hans-cn"])
const cnTimeZones = new Set(["Asia/Shanghai", "Asia/Urumqi"])

function getWindowSearch() {
  if (typeof window === "undefined") {
    return ""
  }

  return window.location.search
}

function getStorage() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage
}

function getNavigatorLanguages() {
  if (typeof navigator === "undefined") {
    return []
  }

  return [...navigator.languages, navigator.language].filter(Boolean)
}

function getResolvedTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null
  } catch {
    return null
  }
}

export function isSupportedRegion(value: string | null | undefined): value is SiteRegion {
  return value === "cn-mainland" || value === "international"
}

export function getRegionFromSearch(search = getWindowSearch()): SiteRegion | null {
  const params = new URLSearchParams(search)
  const region = params.get(REGION_QUERY_KEY)

  return isSupportedRegion(region) ? region : null
}

export function readStoredRegion(storage = getStorage()): SiteRegion | null {
  if (!storage) {
    return null
  }

  try {
    const region = storage.getItem(REGION_STORAGE_KEY)
    return isSupportedRegion(region) ? region : null
  } catch {
    return null
  }
}

export function writeStoredRegion(region: SiteRegion, storage = getStorage()) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(REGION_STORAGE_KEY, region)
  } catch {
    // Ignore storage failures in constrained environments.
  }
}

export function syncRegionPreferenceFromUrl(search = getWindowSearch()) {
  const explicitRegion = getRegionFromSearch(search)

  if (explicitRegion) {
    writeStoredRegion(explicitRegion)
  }

  return explicitRegion
}

export function detectRegionFromBrowser(options?: {
  languages?: readonly string[]
  timeZone?: string | null
}): SiteRegion {
  const languages = (options?.languages ?? getNavigatorLanguages())
    .map((language) => language.toLowerCase())
  const timeZone = options?.timeZone ?? getResolvedTimeZone()

  if (timeZone && cnTimeZones.has(timeZone)) {
    return "cn-mainland"
  }

  if (languages.some((language) => cnLanguageTags.has(language))) {
    return "cn-mainland"
  }

  return "international"
}

export function detectRegion(options?: {
  search?: string
  storedRegion?: string | null
  languages?: readonly string[]
  timeZone?: string | null
}): SiteRegion {
  const explicitRegion = getRegionFromSearch(options?.search)

  if (explicitRegion) {
    return explicitRegion
  }

  const storedRegion = isSupportedRegion(options?.storedRegion)
    ? options?.storedRegion
    : readStoredRegion()

  if (storedRegion) {
    return storedRegion
  }

  return detectRegionFromBrowser({
    languages: options?.languages,
    timeZone: options?.timeZone,
  })
}

export function getDefaultCurrencyForRegion(region: SiteRegion): PricingCurrency {
  return region === "cn-mainland" ? "CNY" : "USD"
}

export function getDefaultCityTierForRegion(region: SiteRegion) {
  void region
  return "tier1" as const
}
