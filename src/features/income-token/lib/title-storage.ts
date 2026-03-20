import { specialTitleIds, type SpecialTitleId } from "./title-types"

export const SPECIAL_TITLE_STORAGE_KEY = "cost-special-titles"
export const SPECIAL_TITLE_STORAGE_VERSION = 1

interface SpecialTitleStoragePayload {
  version: number
  earnedTitleIds: string[]
}

function getStorage(storage?: Storage | null) {
  if (storage) return storage
  if (typeof window === "undefined") return null
  return window.localStorage
}

function isSpecialTitleId(value: string): value is SpecialTitleId {
  return (specialTitleIds as readonly string[]).includes(value)
}

export function normalizeEarnedTitleIds(titleIds: readonly string[]): SpecialTitleId[] {
  return Array.from(new Set(titleIds.filter(isSpecialTitleId)))
}

export function readEarnedTitleIds(storage?: Storage | null): SpecialTitleId[] {
  const targetStorage = getStorage(storage)
  if (!targetStorage) return []

  try {
    const rawValue = targetStorage.getItem(SPECIAL_TITLE_STORAGE_KEY)
    if (!rawValue) return []

    const payload = JSON.parse(rawValue) as Partial<SpecialTitleStoragePayload>
    if (payload.version !== SPECIAL_TITLE_STORAGE_VERSION) {
      return []
    }

    if (!Array.isArray(payload.earnedTitleIds)) {
      return []
    }

    return normalizeEarnedTitleIds(payload.earnedTitleIds)
  } catch {
    return []
  }
}

export function mergeEarnedTitleIds(
  currentTitleIds: readonly SpecialTitleId[],
  matchedTitleIds: readonly SpecialTitleId[]
): SpecialTitleId[] {
  return normalizeEarnedTitleIds([...currentTitleIds, ...matchedTitleIds])
}

export function writeEarnedTitleIds(
  titleIds: readonly SpecialTitleId[],
  storage?: Storage | null
): SpecialTitleId[] {
  const normalizedTitleIds = normalizeEarnedTitleIds(titleIds)
  const targetStorage = getStorage(storage)
  if (!targetStorage) return normalizedTitleIds

  try {
    targetStorage.setItem(
      SPECIAL_TITLE_STORAGE_KEY,
      JSON.stringify({
        version: SPECIAL_TITLE_STORAGE_VERSION,
        earnedTitleIds: normalizedTitleIds,
      })
    )
  } catch {
    return normalizedTitleIds
  }

  return normalizedTitleIds
}
