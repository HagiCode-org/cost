import { describe, expect, it } from "vitest"

import { buildResultViewModel } from "./build-result-view-model"
import { evaluate } from "./calculate-ai-risk"

const result = evaluate({
  annualIncomeCny: 300_000,
  cityTier: "tier1",
  modelId: "gpt-5",
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
    expect(viewModel.costSection.modelDescription).toBe("Flagship coding model")
    expect(viewModel.costSection.sourceNote).toContain("standard official input / output pricing")
    expect(viewModel.costSection.inputPriceFormatted).toBe("$2.5")
    expect(viewModel.costSection.outputPriceFormatted).toBe("$15")
    expect(viewModel.costSection.mixedPriceFormatted).toMatch(/^\$.*\/ 1M$/)
    expect(viewModel.costSection.exchangeRateDisclosure).toContain("1 USD = 7.25 CNY")
    expect(viewModel.dataDisclaimer.pricingSource).toContain("official API pricing pages")
    expect(viewModel.dataDisclaimer.pricingReferences[3]?.sourceLabel).toBe("Zhipu Open Platform Pricing")
    expect(viewModel.summarySection.shareCopy).toContain("$")
  })

  it("keeps CNY budget formatting for CNY display while retaining China-mainland city labels", () => {
    const viewModel = buildResultViewModel(result, "zh-CN", "CNY", "cn-mainland")

    expect(viewModel.summarySection.annualIncomeFormatted).toBe("¥300,000")
    expect(viewModel.summarySection.annualTotalCostFormatted).toBe("¥445,000")
    expect(viewModel.summarySection.cityLabel).toBe("北京 / 上海 / 深圳 / 广州")
    expect(viewModel.costSection.inputPriceFormatted).toBe("$2.5")
    expect(viewModel.costSection.outputPriceFormatted).toBe("$15")
    expect(viewModel.costSection.exchangeRateDisclosure).toBeUndefined()
    expect(viewModel.tokenListSection.annualTotalCostFormatted).toBe("¥445,000")
  })
})
