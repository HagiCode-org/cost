import { describe, expect, it } from "vitest"

import { buildResultViewModel } from "./build-result-view-model"
import { evaluate } from "./calculate-ai-risk"
import { pricingData } from "../content/pricing-data"

const result = evaluate({
  annualIncomeCny: 300_000,
  cityTier: "tier1",
  modelId: "gpt-6-sol",
  performanceMultiplier: 2.5,
  dailyTokenUsageM: 10,
})

describe("buildResultViewModel", () => {
  it("formats user-budget amounts in USD while preserving model-native pricing", () => {
    const viewModel = buildResultViewModel(result, "en-US", "USD", "international")

    expect(viewModel.summarySection.annualIncomeFormatted).toMatch(/^\$/)
    expect(viewModel.summarySection.annualTotalCostFormatted).toMatch(/^\$/)
    expect(viewModel.summarySection.cityLabel).toContain("Global tier 1 metro")
    expect(viewModel.costSection.dailyAiCostFormatted).toMatch(/^\$/)
    expect(viewModel.costSection.modelDescription).toBe("Complex coding and agentic workflows")
    expect(viewModel.costSection.sourceLabel).toBe("OpenAI API Pricing")
    expect(viewModel.costSection.sourceNote).toContain("Batch, Flex, Fast")
    expect(viewModel.costSection.sourceSyncedAt).toBe("2026-09-26")
    expect(viewModel.costSection.availabilityStatus).toBe("Available")
    expect(viewModel.costSection.inputPriceFormatted).toBe("$2")
    expect(viewModel.costSection.outputPriceFormatted).toBe("$10")
    expect(viewModel.costSection.cacheReadPriceFormatted).toBe("$0.2")
    expect(viewModel.costSection.cacheWritePriceFormatted).toBe("$2.5")
    expect(viewModel.costSection.mixedPriceFormatted).toMatch(/^\$.*\/ 1M$/)
    expect(viewModel.costSection.exchangeRateDisclosure).toContain("1 USD = 7.25 CNY")
    expect(viewModel.dataDisclaimer.pricingSource).toContain("2026-09-26")
    expect(viewModel.dataDisclaimer.pricingReferences.some((reference) => reference.sourceLabel === "OpenAI API Pricing")).toBe(true)
    expect(viewModel.dataDisclaimer.pricingReferences.some((reference) => reference.sourceLabel === "BigModel API Pricing (China)")).toBe(true)
    expect(viewModel.summarySection.shareCopy).toContain("$")

    const deepSeekModels = viewModel.tokenListSection.pricingProviders
      .find((provider) => provider.providerId === "deepseek")
      ?.models
    const deepSeekOffPeak = deepSeekModels?.find((model) => model.modelId === "deepseek-flash")
    expect(deepSeekOffPeak?.cacheReadPriceFormatted).toBe("$0.003")
    expect(deepSeekOffPeak?.cacheWritePriceFormatted).toBeUndefined()

    const disclosedModelIds = viewModel.tokenListSection.pricingProviders.flatMap((provider) =>
      provider.models.map((model) => model.modelId),
    )
    expect(disclosedModelIds).toHaveLength(pricingData.models.length)
    expect(new Set(disclosedModelIds)).toEqual(new Set(pricingData.models.map((model) => model.id)))
  })

  it("keeps CNY budget formatting for CNY display while retaining China-mainland city labels", () => {
    const viewModel = buildResultViewModel(result, "zh-CN", "CNY", "cn-mainland")

    expect(viewModel.summarySection.annualIncomeFormatted).toBe("¥300,000")
    expect(viewModel.summarySection.annualTotalCostFormatted).toBe("¥445,000")
    expect(viewModel.summarySection.cityLabel).toBe("北京 / 上海 / 深圳 / 广州")
    expect(viewModel.costSection.inputPriceFormatted).toBe("$2")
    expect(viewModel.costSection.outputPriceFormatted).toBe("$10")
    expect(viewModel.costSection.exchangeRateDisclosure).toBeUndefined()
    expect(viewModel.tokenListSection.annualTotalCostFormatted).toBe("¥445,000")
  })
})
