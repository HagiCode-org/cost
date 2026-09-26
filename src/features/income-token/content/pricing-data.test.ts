import { describe, expect, it } from "vitest"

import { getLocalizedModelCopy, getModelById, pricingData, resolveCanonicalModelId } from "./pricing-data"

describe("pricingData canonical catalog", () => {
  it("keeps canonical IDs unique with dated, official source data and complete localized copy", () => {
    const ids = pricingData.models.map((model) => model.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(pricingData.catalogRefreshDate).toBe("2026-09-26")
    expect(pricingData.updatedAt).toBe(pricingData.catalogRefreshDate)

    for (const model of pricingData.models) {
      expect(model.sourceLabel).toBeTruthy()
      expect(model.sourceUrl).toMatch(/^https:\/\//)
      expect(model.sourceSyncedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(model.sourceSyncedAt))).toBe(false)
      expect(model.sourceSyncedAt).toBe(pricingData.catalogRefreshDate)
      expect(model.availabilityStatus).toBe("available")
      expect(model.inputCostPer1mToken).toBeGreaterThan(0)
      expect(model.outputCostPer1mToken).toBeGreaterThan(0)
      expect(model.cacheReadCostPer1mToken ?? 1).toBeGreaterThan(0)
      expect(model.cacheWriteCostPer1mToken ?? 1).toBeGreaterThan(0)
      expect(getLocalizedModelCopy(model, "zh-CN").description).toBeTruthy()
      expect(getLocalizedModelCopy(model, "en-US").description).toBeTruthy()
      expect(getLocalizedModelCopy(model, "zh-CN").pricingContext).toBeTruthy()
      expect(getLocalizedModelCopy(model, "en-US").pricingContext).toBeTruthy()
    }
  })

  it("preserves only provider-confirmed legacy model mappings", () => {
    expect(resolveCanonicalModelId("gpt-5")).toBe("gpt-5")
    expect(resolveCanonicalModelId("gpt-5-mini")).toBe("gpt-5-mini")
    expect(resolveCanonicalModelId("gpt-5.4-2026-03-05")).toBe("gpt-5.4")
    expect(resolveCanonicalModelId("claude-opus-4-6")).toBe("claude-opus-4-6")
    expect(resolveCanonicalModelId("claude-haiku-4-5-20251001")).toBe("claude-haiku-4-5")
    expect(resolveCanonicalModelId("deepseek-v4-flash")).toBe("deepseek-flash")
    expect(resolveCanonicalModelId("deepseek-v4-flash-vision-exp")).toBe("deepseek-flash")
    expect(resolveCanonicalModelId("minimax-m2-5")).toBe("MiniMax-M2.5")
    expect(resolveCanonicalModelId("minimax-m2-5-highspeed")).toBe("MiniMax-M2.5-highspeed")
    expect(resolveCanonicalModelId("deepseek-chat")).toBeNull()
    expect(resolveCanonicalModelId("deepseek-reasoner")).toBeNull()
    expect(resolveCanonicalModelId("deepseek-v3")).toBeNull()
    expect(resolveCanonicalModelId("not-a-real-model")).toBeNull()
    expect(() => getModelById("not-a-real-model")).toThrow(RangeError)
  })

  it("contains verified current models and explicitly calculated billing tiers", () => {
    const modelsById = new Map(pricingData.models.map((model) => [model.id, model]))
    const prices = (id: string) => {
      const model = modelsById.get(id)
      expect(model).toBeDefined()
      return [model?.inputCostPer1mToken, model?.outputCostPer1mToken]
    }

    expect(prices("gpt-6-astra")).toEqual([10, 50])
    expect(prices("gpt-6-sol")).toEqual([2, 10])
    expect(prices("gpt-6-luna")).toEqual([0.1, 0.5])
    expect(prices("gpt-6-astra-long-context")).toEqual([20, 75])
    expect(prices("claude-fable-5-1")).toEqual([10, 50])
    expect(prices("claude-opus-5-5")).toEqual([4, 20])
    expect(prices("claude-sonnet-5")).toEqual([2, 10])
    expect(prices("deepseek-flash")).toEqual([0.15, 0.6])
    expect(prices("deepseek-flash-peak")).toEqual([0.3, 1.2])
    expect(prices("deepseek-flash-cache-hit")).toEqual([0.003, 0.6])
    expect(prices("deepseek-v4-pro")).toEqual([0.66, 1.98])
    expect(prices("glm-5.3")).toEqual([8, 28])
    expect(prices("glm-5.3-flash")).toEqual([0.8, 2.8])
    expect(prices("glm-5.3-flashx")).toEqual([2, 7])
    expect(prices("MiniMax-M3")).toEqual([0.3, 1.2])
    expect(prices("MiniMax-M3-over-512k")).toEqual([0.6, 2.4])
    expect(prices("MiniMax-M2.7-highspeed")).toEqual([0.6, 2.4])
    expect(modelsById.get("MiniMax-M2.7-highspeed")?.pricingNoteEn).toContain("official pages conflict")
    expect(modelsById.get("gpt-5.5")?.availabilityStatus).toBe("available")
    expect(modelsById.get("MiniMax-M2.7")?.currency).toBe("USD")
    expect(modelsById.get("glm-5.3")?.currency).toBe("CNY")
    expect(pricingData.exchangeRateUsdToCny).toBe(7.25)
  })
})
