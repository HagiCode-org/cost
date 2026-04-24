import { describe, expect, it } from "vitest"

import { pricingData, resolveCanonicalModelId } from "./pricing-data"

describe("pricingData canonical catalog", () => {
  it("keeps canonical IDs unique and required model-level source fields populated", () => {
    const ids = pricingData.models.map((model) => model.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(pricingData.catalogRefreshDate).toBe("2026-04-24")
    expect(pricingData.models.every((model) => model.sourceLabel && model.sourceUrl && model.sourceSyncedAt)).toBe(true)
    expect(pricingData.models.every((model) => model.availabilityStatus)).toBe(true)
  })

  it("maps legacy IDs to explicit canonical IDs instead of falling back", () => {
    expect(resolveCanonicalModelId("gpt-5")).toBe("gpt-5.4")
    expect(resolveCanonicalModelId("gpt-5-mini")).toBe("gpt-5.4-mini")
    expect(resolveCanonicalModelId("claude-opus-4-6")).toBe("claude-opus-4-7")
    expect(resolveCanonicalModelId("deepseek-v3")).toBe("deepseek-v4-flash")
    expect(resolveCanonicalModelId("deepseek-r1")).toBe("deepseek-v4-pro")
    expect(resolveCanonicalModelId("not-a-real-model")).toBeNull()
  })

  it("normalizes models.dev target-model pricing dimensions into calculable entries", () => {
    const gpt55 = pricingData.models.find((model) => model.id === "gpt-5.5")
    const deepseekFlashHit = pricingData.models.find((model) => model.id === "deepseek-v4-flash-cache-hit")
    const deepseekProMiss = pricingData.models.find((model) => model.id === "deepseek-v4-pro")

    expect(gpt55?.availabilityStatus).toBe("coming-soon")
    expect(gpt55?.inputCostPer1mToken).toBe(5)
    expect(gpt55?.outputCostPer1mToken).toBe(30)
    expect(deepseekFlashHit?.inputCostPer1mToken).toBe(0.028)
    expect(deepseekFlashHit?.pricingContextEn).toBe("Cache hit")
    expect(deepseekProMiss?.pricingContextEn).toBe("Cache miss")
  })
})
